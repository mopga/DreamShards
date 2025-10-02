export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  healHP?: number;
  healSP?: number;
}

export const itemCatalog: Record<string, ItemDefinition> = {
  dream_tonic: {
    id: "dream_tonic",
    name: "Dream Tonic",
    description: "Mends 40 HP with cooling starlight.",
    healHP: 40,
  },
  starlight_infusion: {
    id: "starlight_infusion",
    name: "Starlight Infusion",
    description: "Restores 25 SP with gentle moonfire.",
    healSP: 25,
  },
  royal_diary_page: {
    id: "royal_diary_page",
    name: "Royal Diary Page",
    description: "A perfumed letter chronicling the palace sovereign's final night.",
  },
};