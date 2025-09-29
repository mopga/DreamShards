import type { ComponentType } from "react";
import type { Element } from "@shared/types";
import { FlameIcon, IceIcon, BoltIcon, MindIcon, VoidIcon, SlashIcon } from "./StatusIcons";

export const elementIconMap: Record<Element, ComponentType<{ className?: string; title?: string }>> = {
  physical: SlashIcon,
  fire: FlameIcon,
  ice: IceIcon,
  electric: BoltIcon,
  psychic: MindIcon,
  void: VoidIcon,
};
