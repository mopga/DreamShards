import React from "react";
import vulnerableIcon from "./svg/broken-shield.svg";
import weakenedIcon from "./svg/down.svg";
import guardedIcon from "./svg/up-shield.svg";
import flameIcon from "./svg/flame.svg";
import iceIcon from "./svg/ice.svg";
import boltIcon from "./svg/bolt.svg";
import mindIcon from "./svg/brain.svg";
import voidIcon from "./svg/void.svg";
import slashIcon from "./svg/slash.svg";

import type { CombatStatus } from "../logic/types";

interface IconProps {
  className?: string;
  title?: string;
}

const base = "h-4 w-4";

function GenericIcon({ src, className = base, title }: IconProps & { src: string }) {
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

export function BrokenShieldIcon(props: IconProps) {
  return <GenericIcon src={vulnerableIcon} {...props} />;
}

export function DownIcon(props: IconProps) {
  return <GenericIcon src={weakenedIcon} {...props} />;
}

export function UpShieldIcon(props: IconProps) {
  return <GenericIcon src={guardedIcon} {...props} />;
}

export function FlameIcon(props: IconProps) {
  return <GenericIcon src={flameIcon} {...props} />;
}

export function IceIcon(props: IconProps) {
  return <GenericIcon src={iceIcon} {...props} />;
}

export function BoltIcon(props: IconProps) {
  return <GenericIcon src={boltIcon} {...props} />;
}

export function MindIcon(props: IconProps) {
  return <GenericIcon src={mindIcon} {...props} />;
}

export function VoidIcon(props: IconProps) {
  return <GenericIcon src={voidIcon} {...props} />;
}

export function SlashIcon(props: IconProps) {
  return <GenericIcon src={slashIcon} {...props} />;
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
