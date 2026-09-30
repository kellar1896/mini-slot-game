import type { SlotConfig } from "../../types/game";


export const slotConfig: SlotConfig = {
  rows: 3,
  reels: 5,

  symbols: [
    {
      id: 'M1',
      value: 10,
    },
    {
      id: 'M2',
      value: 8,
    },
    {
      id: 'M3',
      value: 6,
    },
    {
      id: 'F1',
      value: 5,
    },
    {
      id: 'F2',
      value: 4,
    },
    {
      id: 'F3',
      value: 3,
    },
    {
      id: 'F4',
      value: 2,
    },
  ],

  reelStrips: [
    {
      symbols: [
        'M1',
        'M2',
        'M3',
        'F1',
        'F2',
        'F3',
        'F4',
        'M1',
      ],
    },
    {
      symbols: [
        'M2',
        'M3',
        'F1',
        'F2',
        'F3',
        'F4',
        'M1',
        'M2',
      ],
    },
    {
      symbols: [
        'M3',
        'F1',
        'F2',
        'F3',
        'F4',
        'M1',
        'M2',
        'M3',
      ],
    },
    {
      symbols: [
        'F1',
        'F2',
        'F3',
        'F4',
        'M1',
        'M2',
        'M3',
        'F1',
      ],
    },
    {
      symbols: [
        'F2',
        'F3',
        'F4',
        'M1',
        'M2',
        'M3',
        'F1',
        'F2',
      ],
    },
  ],

  defaultReels: [
    ['M1', 'M2', 'M3'],
    ['M2', 'M3', 'F1'],
    ['M3', 'F1', 'F2'],
    ['F1', 'F2', 'F3'],
    ['F2', 'F3', 'F4'],
  ],
};