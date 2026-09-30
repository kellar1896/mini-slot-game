import type { SlotConfig, SpinResult, SymbolId } from "../../../types/game";

export class SlotGame {
  private readonly config: SlotConfig;

  constructor(config: SlotConfig) {
    this.config = config;
  }

  spin(): SpinResult {
    const result = this.generateResult();

    return {
      reels: result.reels,
      win: this.evaluate(result.reels),
      reelPositions: result.reelPositions,
    };
  }

  private generateResult(): { reels: SymbolId[][]; reelPositions: number[] } {
    const reelPositions: number[] = [];

    const reels = this.config.reelStrips.map((reel) => {

      const startIndex = Math.floor(
        Math.random() * reel.symbols.length,
      );
      reelPositions.push(startIndex);
      return Array.from(
        { length: this.config.rows },
        (_, index) => {
          const symbolIndex =
            (startIndex + index) % reel.symbols.length;

          return reel.symbols[symbolIndex];
        },
      );
    });

    return {
      reels,
      reelPositions,
    };
  }

  private evaluate(reels: SymbolId[][]): number {
    const topRow = reels.map((reel) => reel[0]);

    if (topRow.every((symbol) => symbol === topRow[0])) {
      const symbol = this.config.symbols.find(
        (item) => item.id === topRow[0],
      );

      return symbol?.value ?? 0;
    }

    return 0;
  }
}