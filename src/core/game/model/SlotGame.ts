import type { SlotConfig, SpinResult, SymbolId } from "../../../types/game";

export class SlotGame {
  private readonly config: SlotConfig;

  constructor(config: SlotConfig) {
    this.config = config;
  }

  spin(): SpinResult {
    const result = this.generateResult();
    console.log("Spin Result:", result);
    return result;
  }

  spinWithSymbols(forcedSymbols: SymbolId[]): SpinResult {
    const selectedSymbols = [...forcedSymbols]
      .filter((symbol) => this.config.symbols.some(({ id }) => id === symbol))
      .slice(0, this.config.rows);

    if (selectedSymbols.length === 0) {
      return this.spin();
    }

    const nonWinningSymbols = this.config.symbols
      .map(({ id }) => id)
      .filter((symbol) => !selectedSymbols.includes(symbol));

    const reels = Array.from({ length: this.config.reels }, (_, column) =>
      Array.from({ length: this.config.rows }, (_, row) => {
        const forcedSymbol = selectedSymbols[row];
        if (forcedSymbol) {
          return forcedSymbol;
        }

        return nonWinningSymbols[column % nonWinningSymbols.length] ?? selectedSymbols[0]!;
      }),
    );

    const { win, wins } = this.evaluate(reels);
    return {
      reels,
      win,
      reelPositions: Array.from({ length: this.config.reels }, () => 0),
      wins,
    };
  }

  private generateResult(): SpinResult {
    const reelPositions: number[] = [];

    const reels = this.config.reelStrips.map((reel) => {
      const startIndex = Math.floor(
        Math.random() * reel.symbols.length,
      );
      reelPositions.push(startIndex);
      return Array.from({ length: this.config.rows }, (_, index) => {
        const symbolIndex = (startIndex + index) % reel.symbols.length;

        return reel.symbols[symbolIndex];
      });
    });

    const { win, wins } = this.evaluate(reels);

    return {
      reels,
      win,
      reelPositions,
      wins,
    };
  }

  private evaluate(reels: SymbolId[][]): {
    win: number;
    wins: SpinResult["wins"];
  } {
    let win = 0;
    const wins: SpinResult["wins"] = [];

    for (const symbolConfig of this.config.symbols) {
      const matchingRowsByColumn: number[][] = [];

      for (const reel of reels) {
        const matchingRows = reel.flatMap((reelSymbol, row) =>
          reelSymbol === symbolConfig.id ? [row] : [],
        );

        if (matchingRows.length === 0) {
          break;
        }

        matchingRowsByColumn.push(matchingRows);
      }

      if (matchingRowsByColumn.length < 3) {
        continue;
      }

      const ways = matchingRowsByColumn.reduce(
        (total, matchingRows) => total * matchingRows.length,
        1,
      );
      const symbolWin = ways * symbolConfig.value;
      win += symbolWin;
      wins.push({
        pattern: matchingRowsByColumn.flatMap((matchingRows, column) =>
          matchingRows.map((row) => ({ column, row })),
        ),
        winAmount: symbolWin,
        symbol: symbolConfig.id,
      });
    }

    return { win, wins };
  }
}