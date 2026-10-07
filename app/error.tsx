"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "#f2f2f2",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        padding: "2rem",
        gap: "1rem",
      }}
    >
      <h1 style={{ color: "#bde85a", fontSize: "1.5rem" }}>Runtime Error</h1>
      <pre
        style={{
          background: "#111",
          border: "1px solid #2e2e2e",
          padding: "1.5rem",
          borderRadius: "8px",
          maxWidth: "800px",
          overflow: "auto",
          whiteSpace: "pre-wrap",
          fontSize: "13px",
          color: "#f2f2f2",
        }}
      >
        {error.message}
        {"\n\n"}
        {error.stack}
      </pre>
      <button
        onClick={reset}
        style={{
          background: "#bde85a",
          color: "#0a0a0a",
          border: "none",
          padding: "10px 24px",
          cursor: "pointer",
          fontFamily: "monospace",
          fontSize: "14px",
          borderRadius: "4px",
        }}
      >
        Try again
      </button>
    </div>
  );
}
