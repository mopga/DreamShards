import React from "react";
import type { CombatStatus } from "../logic/types";

interface IconProps {
  className?: string;
  title?: string;
}

const base = "w-4 h-4";

export function BrokenShieldIcon({ className = base, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden={!title} role={title ? "img" : "presentation"}>
      {title ? <title>{title}</title> : null}
      <path d="M12 3L5 6v6c0 4 2.6 7.3 7 9 4.4-1.7 7-5 7-9V6l-4.5-2 1.5 5-4 3.5L10.5 9 12 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DownIcon({ className = base, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden={!title} role={title ? "img" : "presentation"}>
      {title ? <title>{title}</title> : null}
      <path d="M12 5v14m0 0L6 13m6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UpShieldIcon({ className = base, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden={!title} role={title ? "img" : "presentation"}>
      {title ? <title>{title}</title> : null}
      <path d="M12 3l7 3v6c0 4-2.6 7.3-7 9-4.4-1.7-7-5-7-9V6l7-3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 11l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function statusIcon(status: CombatStatus) {
  switch (status) {
    case "vulnerable":
      return BrokenShieldIcon;
    case "weakened":
      return DownIcon;
    case "guarded":
      return UpShieldIcon;
    default:
      return BrokenShieldIcon;
  }
}
