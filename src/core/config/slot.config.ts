import type { SlotConfig } from "../../types/game";


export const slotConfig: SlotConfig = {
  rows: 3,
  reels: 3,

  symbols: [
    {
      id: 'A',
      value: 10,
    },
    {
      id: 'K',
      value: 8,
    },
    {
      id: 'Q',
      value: 6,
    },
    {
      id: 'J',
      value: 4,
    },
    {
      id: '10',
      value: 2,
    },
  ],

  reelStrips: [
    {
      symbols: ['A', 'K', 'Q', 'J', '10', 'A', 'K', 'Q'],
    },
    {
      symbols: ['K', 'Q', 'A', '10', 'J', 'K', 'A', 'Q'],
    },
    {
      symbols: ['Q', 'J', 'A', 'K', '10', 'Q', 'A', 'J'],
    },
  ],

  defaultReels: [
    ['A', 'K', 'Q'],
    ['K', 'Q', 'A'],
    ['Q', 'J', 'A'],
  ],
};