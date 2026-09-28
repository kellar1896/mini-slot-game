import { describe, expect, it } from 'vitest';
import { SlotGame } from './SlotGame';
import { slotConfig } from '../config/slot.config';

describe('SlotGame', () => {
  it('generates the correct number of reels', () => {
    const game = new SlotGame(slotConfig);

    const result = game.spin();

    expect(result.reels).toHaveLength(3);
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
});