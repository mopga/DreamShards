import React, { useEffect, useState } from "react";

interface DamageFloatProps {
  amount: number;
  variant: "hit" | "heal";
  className?: string;
}

export function DamageFloat({ amount, variant, className = "absolute -top-2 right-0" }: DamageFloatProps) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 320);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <span
      className={`pointer-events-none select-none text-sm font-semibold ${
        variant === "hit" ? "text-rose-200" : "text-emerald-200"
      } damage-float ${className}`}
    >
      {variant === "hit" ? "-" : "+"}
      {amount}
    </span>
  );
}
