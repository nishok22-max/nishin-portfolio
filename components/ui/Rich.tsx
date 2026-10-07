import { Fragment } from "react";

type Props = {
  text: string;
  /** Wrap emphasized phrases in an element that can draw an accent underline. */
  underline?: boolean;
};

/** Renders `**emphasis**` segments from content/site.ts as <strong>. */
export default function Rich({ text, underline = false }: Props) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") ? (
          <strong key={i} className={underline ? "draw-underline" : undefined} data-underline={underline || undefined}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

