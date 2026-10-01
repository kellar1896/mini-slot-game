import { describe, expect, it, vi } from 'vitest';
import { slotConfig } from '../../config/slot.config';
import { SlotGame } from '../model/SlotGame';

describe('SlotGame', () => {
  it('generates the correct number of reels', () => {
    const game = new SlotGame(slotConfig);

    const result = game.spin();

    expect(result.reels).toHaveLength(5);
  });

  it('generates the correct number of rows', () => {
    const game = new SlotGame(slotConfig);

    const result = game.spin();

    result.reels.forEach((reel) => {
      expect(reel).toHaveLength(3);
    });
  });

  it('generates valid symbols', () => {
    const game = new SlotGame(slotConfig);

    const result = game.spin();

    const validSymbols = slotConfig.symbols.map(
      (symbol) => symbol.id,
    );

    result.reels.flat().forEach((symbol) => {
      expect(validSymbols).toContain(symbol);
    });
  });

  it('pays each way of 3+ matching symbols across consecutive reels', () => {
    const game = new SlotGame({
      ...slotConfig,
      rows: 3,
      reels: 3,
      symbols: [{ id: 'M1', value: 10 }],
      reelStrips: Array.from({ length: 3 }, () => ({
        symbols: ['M1', 'M2', 'M1'],
      })),
    });
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = game.spin();

    random.mockRestore();
    expect(result.win).toBe(80);
    expect(result.wins).toEqual([{
      pattern: [
        { column: 0, row: 0 },
        { column: 0, row: 2 },
        { column: 1, row: 0 },
        { column: 1, row: 2 },
        { column: 2, row: 0 },
        { column: 2, row: 2 },
      ],
      winAmount: 80,
      symbol: 'M1',
    }]);
  });

  it('returns one win per symbol and sums them into the total win', () => {
    const game = new SlotGame({
      ...slotConfig,
      rows: 3,
      reels: 3,
      symbols: [
        { id: 'M1', value: 10 },
        { id: 'M2', value: 5 },
      ],
      reelStrips: Array.from({ length: 3 }, () => ({
        symbols: ['M1', 'M2', 'M1'],
      })),
    });
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = game.spin();

    random.mockRestore();
    expect(result.win).toBe(85);
    expect(result.wins).toEqual([
      {
        pattern: [
          { column: 0, row: 0 },
          { column: 0, row: 2 },
          { column: 1, row: 0 },
          { column: 1, row: 2 },
          { column: 2, row: 0 },
          { column: 2, row: 2 },
        ],
        winAmount: 80,
        symbol: 'M1',
      },
      {
        pattern: [
          { column: 0, row: 1 },
          { column: 1, row: 1 },
          { column: 2, row: 1 },
        ],
        winAmount: 5,
        symbol: 'M2',
      },
    ]);
  });

  it('does not pay matching symbols separated by a non-matching reel', () => {
    const game = new SlotGame({
      ...slotConfig,
      rows: 3,
      reels: 4,
      symbols: [{ id: 'M1', value: 10 }],
      reelStrips: [
        { symbols: ['M1', 'M2', 'M2'] },
        { symbols: ['M1', 'M2', 'M2'] },
        { symbols: ['M2', 'M2', 'M2'] },
        { symbols: ['M1', 'M2', 'M2'] },
      ],
    });
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = game.spin();

    random.mockRestore();
    expect(result.win).toBe(0);
    expect(result.wins).toEqual([]);
  });
});