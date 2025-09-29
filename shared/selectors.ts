import type { GameState } from "./types";

const HERO_NAME_PATTERN = /^[A-Za-z\u0401\u0451\u0410-\u044F\u0430-\u044F\s'-]{2,16}$/;

export function selectHeroName(state: Pick<GameState, "heroName">): string {
  const raw = state.heroName ?? "";
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }
  if (!HERO_NAME_PATTERN.test(trimmed)) {
    return "";
  }
  return trimmed;
}

export function isHeroNameValid(name: string): boolean {
  return HERO_NAME_PATTERN.test(name.trim());
}
