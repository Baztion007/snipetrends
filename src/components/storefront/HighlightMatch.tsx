import { Fragment } from "react";

/**
 * Renders `text` with all occurrences of `query` highlighted in <mark>.
 * Case-insensitive, whole-token match. Used in product titles/brands so
 * shoppers can see *why* a result matched their search.
 */
export function HighlightMatch({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className?: string;
}) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  // Escape regex special chars in the query.
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));

  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part.toLowerCase() === q.toLowerCase() ? (
            <mark
              className={`rounded bg-amber-200/70 px-0.5 text-foreground dark:bg-amber-500/30 ${
                className ?? ""
              }`}
            >
              {part}
            </mark>
          ) : (
            part
          )}
        </Fragment>
      ))}
    </>
  );
}

export default HighlightMatch;
