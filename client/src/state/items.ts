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
};