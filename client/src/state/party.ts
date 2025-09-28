import type { Actor } from "@shared/types";

export type PartyMemberId = "dreamer" | "senna" | "io";

export const partyActors: Record<PartyMemberId, Actor> = {
  dreamer: {
    id: "dreamer",
    name: "The Dreamer",
    stats: {
      maxHP: 120,
      maxSP: 40,
      str: 14,
      mag: 16,
      def: 10,
      res: 10,
      agi: 12,
      luck: 9,
    },
    skills: ["luminous_strike", "voltaic_chain", "mind_pierce"],
    weaknesses: ["ice"],
  },
  senna: {
    id: "senna",
    name: "Senna",
    stats: {
      maxHP: 95,
      maxSP: 36,
      str: 10,
      mag: 15,
      def: 9,
      res: 11,
      agi: 13,
      luck: 11,
    },
    skills: ["ember_burst", "frost_lattice"],
    weaknesses: ["electric"],
    resistances: ["fire"],
  },
  io: {
    id: "io",
    name: "Io",
    stats: {
      maxHP: 88,
      maxSP: 34,
      str: 11,
      mag: 14,
      def: 8,
      res: 12,
      agi: 14,
      luck: 10,
    },
    skills: ["luminous_strike", "ember_burst", "twin_resonance"],
    weaknesses: ["physical"],
  },
};