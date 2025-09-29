import React from "react";
import swordIcon from "./svg/sword.svg";
import starIcon from "./svg/star.svg";
import bagIcon from "./svg/bag.svg";
import shieldIcon from "./svg/shield.svg";
import hourglassIcon from "./svg/hourglass.svg";
import backIcon from "./svg/back.svg";

interface IconProps {
  className?: string;
  title?: string;
}

const base = "h-5 w-5";

function GenericIcon({ src, title, className = base }: IconProps & { src: string }) {
  return (
    <img
      src={src}
      className={className}
      alt=""
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    />
  );
}

export function SwordIcon(props: IconProps) {
  return <GenericIcon src={swordIcon} {...props} />;
}

export function StarIcon(props: IconProps) {
  return <GenericIcon src={starIcon} {...props} />;
}

export function BagIcon(props: IconProps) {
  return <GenericIcon src={bagIcon} {...props} />;
}

export function ShieldIcon(props: IconProps) {
  return <GenericIcon src={shieldIcon} {...props} />;
}

export function HourglassIcon(props: IconProps) {
  return <GenericIcon src={hourglassIcon} {...props} />;
}

export function BackIcon(props: IconProps) {
  return <GenericIcon src={backIcon} {...props} />;
}
