"use client";

/**
 * VectorWordmark — a raw-WebGL wordmark that behaves like a glyph being
 * edited in a vector tool. The cursor (or an idle auto-sweep) grabs the
 * surface; a spring-driven anchor drags the letterforms, bezier handles
 * and a dashed construction triangle are drawn over it, and live
 * coordinate labels read out the anchor position.
 *
 * Modifications vs. the Originkit base (see build prompt §3.3):
 *  1. Sizes to its container (no min-width / min-height).
 *  2. Waits for the real font before rasterising the glyph atlas.
 *  3. Touch: pointerdown engages, pointerleave releases → sweep resumes.
 *  4. Pauses (ticker removed) when offscreen via IntersectionObserver.
 *  5. Full GL cleanup + context lost / restored handling. The GL context
 *     is torn down entirely when far offscreen so only one is ever live.
 *  6. Static gradient <span> fallback for no-WebGL / reduced motion.
 *  7. Canvas + labels are aria-hidden (the page supplies the <h1>).
 *  8. DPR capped at 1.5 under 768px, slightly lower spring speed.
 *  9. `uReveal` left→right wipe driven from GSAP via the imperative ref.
 */

import { useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type Ref } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMediaQueries";

export type VectorWordmarkHandle = {
  /** Tween `.value` 0 → 1 with GSAP to wipe the wordmark in. */
  reveal: { value: number };
  /** Coordinate label elements, for staggered fades. */
  labels: () => HTMLElement[];
};

type FontSpec = {
  fontFamily: string;
  fontWeight?: number | string;
  /** Size relative to a 1200px reference width, e.g. "300px". */
  fontSize?: string;
  letterSpacing?: string;
};

type Props = {
  text: string;
  font: FontSpec;
  background?: string;
  textColor?: string;
  shade?: string;
  accent?: string;
  /** Radius of influence around the anchor, in reference px. */
  reach?: number;
  /** Spring stiffness 0–100. */
  speed?: number;
  /** Spring damping 0–100. */
  damping?: number;
  handles?: { size?: number; spread?: number; labels?: boolean };
  /** Max fraction of container width the text may occupy. */
  fit?: number;
  /** Starting value of the reveal wipe. Use 0 when GSAP drives the intro. */
  initialReveal?: number;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<VectorWordmarkHandle>;
};

const REF_WIDTH = 1200;

/* ── Shaders ───────────────────────────────────────────────────── */
const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uAtlas;
uniform vec2 uRes;      // css px
uniform vec2 uHead;     // anchor, css px (y down)
uniform vec2 uDrag;     // head - tail, css px
uniform float uReach;
uniform float uHover;
uniform float uReveal;
uniform vec2 uBox;      // glyph top / bottom as 0-1 (y down)
uniform vec3 uBg;
uniform vec3 uInk;
uniform vec3 uShade;
uniform vec4 uAccent;

float glyph(vec2 px) {
  vec2 uv = px / uRes;
  return texture2D(uAtlas, vec2(uv.x, 1.0 - uv.y)).a;
}

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  vec2 d = p - uHead;
  float w = exp(-dot(d, d) / (uReach * uReach));

  // Drag the surface along the handle vector + a slight lens pinch.
  vec2 q = p - uDrag * w - d * 0.1 * w * uHover;
  float a = glyph(q);

  // Vertical ink → shade gradient across the glyph box gives depth.
  float t = clamp((q.y / uRes.y - uBox.x) / max(uBox.y - uBox.x, 0.001), 0.0, 1.0);
  vec3 col = mix(uInk, uShade, smoothstep(0.2, 1.05, t));

  float pull = clamp(length(uDrag) / 60.0, 0.0, 1.0);
  col = mix(col, uAccent.rgb, w * w * pull * uAccent.a * 0.45);

  vec3 outCol = mix(uBg, col, a);

  // Dashed accent outline of the undeformed glyph near the anchor.
  if (w * w * pull > 0.02) {
    float o = 1.25;
    float e = abs(glyph(p + vec2(o, 0.0)) - glyph(p - vec2(o, 0.0)))
            + abs(glyph(p + vec2(0.0, o)) - glyph(p - vec2(0.0, o)));
    float dash = step(0.5, fract((p.x + p.y) / 9.0));
    outCol = mix(outCol, uAccent.rgb, clamp(e, 0.0, 1.0) * w * w * pull * dash * uAccent.a * 0.8);
  }

  // Left → right reveal wipe.
  float r = uReveal * 1.1;
  float m = 1.0 - smoothstep(r - 0.1, r, vUv.x);
  gl_FragColor = vec4(mix(uBg, outCol, m), 1.0);
}`;

/* ── Helpers ───────────────────────────────────────────────────── */
function parseColor(input: string): [number, number, number, number] {
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.fillStyle = "#000";
  probe.fillStyle = input;
  const v = probe.fillStyle; // "#rrggbb" or "rgba(r, g, b, a)"
  if (v.startsWith("#")) {
    const n = parseInt(v.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
  }
  const [r, g, b, a = "1"] = v.replace(/rgba?\(|\)/g, "").split(",").map((s) => s.trim());
  return [Number(r) / 255, Number(g) / 255, Number(b) / 255, Number(a)];
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(`VectorWordmark shader: ${log}`);
  }
  return s;
}

const px = (value: string | undefined, fallback: number) => {
  const n = parseFloat(value ?? "");
  return Number.isFinite(n) ? n : fallback;
};

/* ── Component ─────────────────────────────────────────────────── */
export default function VectorWordmark({
  text,
  font,
  background = "#0A0A0A",
  textColor = "#F2F2F2",
  shade = "#1A1A1A",
  accent = "rgba(189,232,90,0.55)",
  reach = 320,
  speed = 45,
  damping = 55,
  handles,
  fit = 0.9,
  initialReveal = 1,
  className = "",
  style,
  ref,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reveal = useRef({ value: initialReveal });
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);
  const [glReady, setGlReady] = useState(false);
  const [glFailed, setGlFailed] = useState(false);
  const staticMode = reduced || glFailed;

  const handleSize = handles?.size ?? 96;
  const handleSpread = handles?.spread ?? 26;
  const showLabels = handles?.labels ?? true;

  useImperativeHandle(
    ref,
    () => ({
      reveal: reveal.current,
      labels: () => labelRefs.current.filter((el): el is HTMLSpanElement => !!el),
    }),
    [],
  );

  // Only keep a GL context alive while the wordmark is near the viewport.
  useEffect(() => {
    const el = container.current!;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "50% 0px 50% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near || staticMode) {
      setGlReady(false);
      return;
    }
    const host = container.current!;
    const over = overlay.current!;
    const octx = over.getContext("2d")!;

    // A fresh canvas per mount: a context lost via loseContext() can't be reused.
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    host.insertBefore(canvas, over);

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      canvas.remove();
      setGlFailed(true);
      return;
    }

    const bg = parseColor(background);
    const ink = parseColor(textColor);
    const sh = parseColor(shade);
    const ac = parseColor(accent);
    const atlas = document.createElement("canvas");
    const actx = atlas.getContext("2d")!;

    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let texture: WebGLTexture | null = null;
    let U: Record<string, WebGLUniformLocation | null> = {};
    let disposed = false;
    let lost = false;
    let fontsReady = false;
    let visible = false;
    let ticking = false;

    let W = 1;
    let H = 1;
    let dpr = 1;
    let scale = 1;
    let box: [number, number] = [0.3, 0.7];

    const isSmall = () => window.innerWidth < 768;
    const sim = {
      head: { x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      tail: { x: 0, y: 0 },
      tvel: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      hasPointer: false,
      hover: 0,
      time: Math.random() * 10,
      frame: 0,
    };

    /* GL resources */
    const buildGL = () => {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link");
      gl.useProgram(program);

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      U = {};
      for (const name of [
        "uAtlas", "uRes", "uHead", "uDrag", "uReach", "uHover", "uReveal", "uBox", "uBg", "uInk", "uShade", "uAccent",
      ]) {
        U[name] = gl.getUniformLocation(program, name);
      }
      gl.uniform1i(U.uAtlas, 0);
      gl.uniform3f(U.uBg, bg[0], bg[1], bg[2]);
      gl.uniform3f(U.uInk, ink[0], ink[1], ink[2]);
      gl.uniform3f(U.uShade, sh[0], sh[1], sh[2]);
      gl.uniform4f(U.uAccent, ac[0], ac[1], ac[2], ac[3]);
    };

    const disposeGL = () => {
      if (gl.isContextLost()) return;
      if (texture) gl.deleteTexture(texture);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      texture = buffer = program = null;
    };

    /* Glyph atlas: the text rasterised at device resolution. */
    const buildAtlas = () => {
      if (!fontsReady || lost || !texture) return;
      atlas.width = Math.max(1, Math.round(W * dpr));
      atlas.height = Math.max(1, Math.round(H * dpr));
      actx.setTransform(dpr, 0, 0, dpr, 0, 0);
      actx.clearRect(0, 0, W, H);

      const weight = font.fontWeight ?? 800;
      const family = font.fontFamily;
      let size = px(font.fontSize, 300) * (W / REF_WIDTH);
      const trackingEm = font.letterSpacing?.endsWith("em") ? parseFloat(font.letterSpacing) : 0;
      const apply = (s: number) => {
        actx.font = `${weight} ${s}px ${family}`;
        if ("letterSpacing" in actx) {
          (actx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${trackingEm * s}px`;
        }
      };
      apply(size);
      let m = actx.measureText(text);
      // Fit width (and a sane share of height) regardless of the reference size.
      const widthFactor = (W * fit) / Math.max(1, m.width);
      const glyphH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const heightFactor = (H * 0.62) / Math.max(1, glyphH);
      size *= Math.min(widthFactor, heightFactor);
      apply(size);
      m = actx.measureText(text);
      scale = W / REF_WIDTH;

      const asc = m.actualBoundingBoxAscent;
      const desc = m.actualBoundingBoxDescent;
      // Tracking adds a trailing space after the last glyph; compensate.
      const x = (W - (m.width - trackingEm * size)) / 2;
      const baseline = H * 0.5 + (asc - desc) / 2;
      box = [(baseline - asc) / H, (baseline + desc) / H];

      actx.fillStyle = "#fff";
      actx.textBaseline = "alphabetic";
      actx.fillText(text, x, baseline);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
    };

    const resize = () => {
      const r = host.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, isSmall() ? 1.5 : 1.75);
      canvas.width = over.width = Math.round(W * dpr);
      canvas.height = over.height = Math.round(H * dpr);
      if (!lost) gl.viewport(0, 0, canvas.width, canvas.height);
      if (!sim.head.x) {
        sim.head.x = sim.tail.x = sim.target.x = W * 0.5;
        sim.head.y = sim.tail.y = sim.target.y = H * 0.5;
      }
      buildAtlas();
    };

    /* Overlay: handles, dashed triangle, crosshair */
    const labels = labelRefs.current;
    const setLabel = (i: number, x: number, y: number, str: string | null) => {
      const el = labels[i];
      if (!el) return;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      if (str !== null && el.textContent !== str) el.textContent = str;
    };

    const drawOverlay = (reveal: number) => {
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.clearRect(0, 0, W, H);
      const alpha = gsap.utils.clamp(0, 1, (reveal - 0.6) / 0.4);
      if (alpha <= 0) return;
      octx.globalAlpha = alpha;

      const { head, tail } = sim;
      const dx = head.x - tail.x;
      const dy = head.y - tail.y;
      const len = Math.hypot(dx, dy);
      const base = len > 0.5 ? Math.atan2(dy, dx) : sim.time * 0.4;
      const spread = (handleSpread * Math.PI) / 180;
      const hl = handleSize * Math.max(scale, 0.55) * (0.75 + Math.min(len / 80, 1) * 0.5);
      const ha = { x: head.x + Math.cos(base + spread) * hl, y: head.y + Math.sin(base + spread) * hl };
      const hb = { x: head.x - Math.cos(base - spread) * hl, y: head.y - Math.sin(base - spread) * hl };

      // Crosshair guides
      octx.lineWidth = 1;
      octx.setLineDash([2, 6]);
      octx.strokeStyle = "rgba(255,255,255,0.07)";
      octx.beginPath();
      octx.moveTo(0, head.y);
      octx.lineTo(W, head.y);
      octx.moveTo(head.x, 0);
      octx.lineTo(head.x, H);
      octx.stroke();

      // Dashed construction triangle
      octx.setLineDash([4, 4]);
      octx.strokeStyle = accent;
      octx.beginPath();
      octx.moveTo(tail.x, tail.y);
      octx.lineTo(ha.x, ha.y);
      octx.lineTo(hb.x, hb.y);
      octx.closePath();
      octx.stroke();

      // Bezier handles
      octx.setLineDash([]);
      octx.strokeStyle = "rgba(242,242,242,0.55)";
      octx.beginPath();
      octx.moveTo(ha.x, ha.y);
      octx.lineTo(hb.x, hb.y);
      octx.stroke();

      octx.fillStyle = background;
      for (const h of [ha, hb]) {
        octx.beginPath();
        octx.arc(h.x, h.y, 3.5, 0, Math.PI * 2);
        octx.fill();
        octx.stroke();
      }
      octx.fillStyle = "rgba(242,242,242,0.55)";
      octx.beginPath();
      octx.arc(tail.x, tail.y, 2, 0, Math.PI * 2);
      octx.fill();

      // Anchor
      octx.fillStyle = background;
      octx.strokeStyle = accent;
      octx.lineWidth = 1.25;
      octx.fillRect(head.x - 4.5, head.y - 4.5, 9, 9);
      octx.strokeRect(head.x - 4.5, head.y - 4.5, 9, 9);
      octx.globalAlpha = 1;

      if (showLabels) {
        const txt = sim.frame % 4 === 0;
        const f4 = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");
        const deg = String(Math.round(((base * 180) / Math.PI + 360) % 360)).padStart(3, "0");
        setLabel(0, head.x + 12, head.y + 10, txt ? `x: ${f4(head.x)}  y: ${f4(head.y)}` : null);
        setLabel(1, ha.x + 10, ha.y - 18, txt ? `H1 ∠ ${deg}°` : null);
        setLabel(2, tail.x + 10, tail.y + 8, txt ? `Δ ${len.toFixed(1)}` : null);
      }
    };

    /* Simulation + render */
    const tick = (_t: number, deltaMs: number) => {
      if (lost || !program) return;
      const dt = Math.min(deltaMs / 1000, 1 / 30);
      sim.time += dt;
      sim.frame++;

      if (!sim.hasPointer) {
        const t = sim.time * 0.32;
        sim.target.x = W * (0.5 + 0.38 * Math.sin(t));
        sim.target.y = H * (0.5 + 0.16 * Math.sin(t * 1.7 + 1.2));
      }
      const spd = speed * (isSmall() ? 0.8 : 1);
      const k = (spd / 100) * 260;
      const c = (damping / 100) * 2 * Math.sqrt(k);
      const kt = k * 0.3;
      const ct = (damping / 100) * 2 * Math.sqrt(kt);
      for (const axis of ["x", "y"] as const) {
        sim.vel[axis] += ((sim.target[axis] - sim.head[axis]) * k - sim.vel[axis] * c) * dt;
        sim.head[axis] += sim.vel[axis] * dt;
        sim.tvel[axis] += ((sim.head[axis] - sim.tail[axis]) * kt - sim.tvel[axis] * ct) * dt;
        sim.tail[axis] += sim.tvel[axis] * dt;
      }
      // Clamp the drag so glyphs stretch, never tear.
      const maxDrag = reach * scale * 0.45;
      const ddx = sim.head.x - sim.tail.x;
      const ddy = sim.head.y - sim.tail.y;
      const dl = Math.hypot(ddx, ddy);
      if (dl > maxDrag) {
        sim.tail.x = sim.head.x - (ddx / dl) * maxDrag;
        sim.tail.y = sim.head.y - (ddy / dl) * maxDrag;
      }
      sim.hover += ((sim.hasPointer ? 1 : 0.55) - sim.hover) * Math.min(1, dt * 4);

      const rv = reveal.current.value;
      gl.uniform2f(U.uRes, W, H);
      gl.uniform2f(U.uHead, sim.head.x, sim.head.y);
      gl.uniform2f(U.uDrag, sim.head.x - sim.tail.x, sim.head.y - sim.tail.y);
      gl.uniform1f(U.uReach, Math.max(40, reach * scale));
      gl.uniform1f(U.uHover, sim.hover);
      gl.uniform1f(U.uReveal, rv);
      gl.uniform2f(U.uBox, box[0], box[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      drawOverlay(rv);
    };

    const gate = () => {
      const shouldRun = visible && fontsReady && !lost && !disposed;
      if (shouldRun && !ticking) gsap.ticker.add(tick);
      if (!shouldRun && ticking) gsap.ticker.remove(tick);
      ticking = shouldRun;
    };

    /* Input */
    const local = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      sim.target.x = e.clientX - r.left;
      sim.target.y = e.clientY - r.top;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.buttons) {
        sim.hasPointer = true;
        local(e);
      }
    };
    const onDown = (e: PointerEvent) => {
      sim.hasPointer = true;
      local(e);
    };
    const onLeave = () => {
      sim.hasPointer = false;
    };
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerdown", onDown, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointercancel", onLeave);

    /* Context loss */
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      gate();
    };
    const onRestored = () => {
      lost = false;
      try {
        buildGL();
        resize();
        gate();
      } catch {
        setGlFailed(true);
      }
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    /* Visibility */
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      gate();
    });
    io.observe(host);

    const ro = new ResizeObserver(() => resize());
    ro.observe(host);

    try {
      buildGL();
    } catch (err) {
      console.warn(err);
      canvas.remove();
      setGlFailed(true);
      return;
    }
    resize();

    // Rasterise only once the real font is available.
    const weight = font.fontWeight ?? 800;
    Promise.all([document.fonts.load(`${weight} 100px ${font.fontFamily}`, text), document.fonts.ready])
      .catch(() => undefined)
      .then(() => {
        if (disposed) return;
        fontsReady = true;
        buildAtlas();
        gate();
        setGlReady(true);
      });

    return () => {
      disposed = true;
      gate();
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointercancel", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      disposeGL();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
      octx.clearRect(0, 0, over.width, over.height);
      setGlReady(false);
    };
  }, [near, staticMode, text, font.fontFamily, font.fontWeight, font.fontSize, font.letterSpacing, background, textColor, shade, accent, reach, speed, damping, handleSize, handleSpread, showLabels, fit]);

  const gradient = `linear-gradient(to bottom, ${textColor} 30%, ${shade} 105%)`;
  const labelOpacity = initialReveal >= 1 ? 0.6 : 0;

  return (
    <div
      ref={container}
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{ background, touchAction: "pan-y", ...style }}
    >
      {/* Static fallback: no JS, no WebGL, or reduced motion. */}
      <span
        aria-hidden="true"
        className="vw-fallback absolute inset-0 flex items-center justify-center whitespace-nowrap"
        style={{
          fontFamily: font.fontFamily,
          fontWeight: font.fontWeight ?? 800,
          letterSpacing: font.letterSpacing,
          lineHeight: 1,
          fontSize: `min(${(fit * 100) / 3.8}vw, 40svh)`,
          backgroundImage: gradient,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          opacity: glReady && !staticMode ? 0 : 1,
          visibility: staticMode || !glReady ? undefined : "hidden",
        }}
        data-static={staticMode || undefined}
      >
        {text}
      </span>
      <canvas ref={overlay} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] h-full w-full" />
      {showLabels &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="mono mono-sm pointer-events-none absolute left-0 top-0 z-[2] whitespace-nowrap will-change-transform"
            style={{
              color: i === 0 ? "var(--accent)" : "var(--fg)",
              opacity: labelOpacity,
              display: staticMode || !glReady ? "none" : undefined,
            }}
          />
        ))}
    </div>
  );
}
