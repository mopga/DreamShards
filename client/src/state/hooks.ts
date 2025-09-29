import { useMemo } from "react";
import { selectHeroName } from "@shared/selectors";
import { useGame } from "./GameContext";
import { useLocale } from "./LocaleContext";

export function useHeroName() {
  const { state } = useGame();
  const { t } = useLocale();
  const cleaned = selectHeroName(state);
  return useMemo(() => (cleaned ? cleaned : t("hero.default_name")), [cleaned, t]);
}
