import React from "react";
import clsx from "clsx";

export function LogPanel({
  entries,
  className,
}: {
  entries: string[];
  className?: string;
}) {
  if (!entries.length) return null;
  return (
    <div
      className={clsx(
        "max-h-48 w-full overflow-y-auto rounded-md border border-slate-700/60 bg-slate-900/70 p-3 text-sm text-slate-300",
        className,
      )}
    >
      {entries.slice(-8).map((entry, index) => (
        <p key={`${index}-${entry.slice(0, 8)}`} className="mb-1 last:mb-0">
          {entry}
        </p>
      ))}
    </div>
  );
}
