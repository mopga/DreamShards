import React from "react";

interface IconProps {
  className?: string;
  title?: string;
}

const base = "w-5 h-5";

export function SwordIcon({ className = base, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden={!title} role={title ? "img" : "presentation"}>
      {title ? <title>{title}</title> : null}
      <path d="M19 3l-6.5 6.5M11 11l-6.5 6.5-1.5 3 3-1.5L12 12l2 2 5-5-2-2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarIcon({ className = base, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden={!title} role={title ? "img" : "presentation"}>
      {title ? <title>{title}</title> : null}
      <path d="M12 3l2.6 5.26 5.8.84-4.2 4.09 1 5.81-5.2-2.73-5.2 2.73 1-5.81-4.2-4.09 5.8-.84L12 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BagIcon({ className = base, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden={!title} role={title ? "img" : "presentation"}>
      {title ? <title>{title}</title> : null}
      <path d="M7 7h10l2 13H5L7 7z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 7c0-2 1.5-4 3-4s3 2 3 4" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon({ className = base, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden={!title} role={title ? "img" : "presentation"}>
      {title ? <title>{title}</title> : null}
      <path d="M12 3l8 3v6c0 4.5-3 8-8 10-5-2-8-5.5-8-10V6l8-3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HourglassIcon({ className = base, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden={!title} role={title ? "img" : "presentation"}>
      {title ? <title>{title}</title> : null}
      <path d="M7 3h10v3l-3.5 4 3.5 4v7H7v-7l3.5-4L7 6V3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BackIcon({ className = base, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden={!title} role={title ? "img" : "presentation"}>
      {title ? <title>{title}</title> : null}
      <path d="M10 7l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12H6" strokeLinecap="round" />
    </svg>
  );
}
