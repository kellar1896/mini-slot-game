import { Container, Graphics } from "pixi.js";
import type { SlotConfig, SymbolPosition, Wins } from "../../types/game";
import { symbolSize } from "../../core/config/slot.config";
import type { WinsView } from "../../types";


export class WaysWinView extends Container implements WinsView {
    label = 'ways-container';

    private readonly _reelsOverlays: Array<Array<Graphics>> = [];

    constructor(
        slotConfig: SlotConfig,
    ) {
        super();

        Array.from({ length: slotConfig.reels }).forEach((_, column) => {
            const rowArray: Array<Graphics> = []
            Array.from({ length: slotConfig.rows }).forEach((_, row) => {
                const symbolOverlay = new Graphics();
                symbolOverlay.rect(0, 0, symbolSize, symbolSize)
                    .fill(0x000000);
                symbolOverlay.alpha = 0;
                rowArray.push(symbolOverlay)
                symbolOverlay.y = row * symbolSize;
                symbolOverlay.x = column * symbolSize;
                this.addChild(symbolOverlay);
            })
            this._reelsOverlays.push(rowArray);
        })
    }

    private updateOverlay(alpha: number): void {
        this._reelsOverlays.forEach((column) => {
            column.forEach((overlay) => overlay.alpha = alpha);
        });
    }

    resetOverlays(): void {
        this.updateOverlay(0);
    }

    showPattern(pattern: Array<SymbolPosition>): void {
        this.updateOverlay(0.9);
        pattern.forEach((position) => {
            const { column, row } = position;
            const symbolOverlay = this._reelsOverlays[column][row];
            if (!symbolOverlay) {
                throw new Error(
                    `Can not find symbol overlar for column:${column} and row:${row}`,
                );
            }
            symbolOverlay.alpha = 0.2;
        });
    }

    iterateWins(wins: Array<Wins>): void {
        // TODO: Implement the logic to iterate through wins and highlight them accordingly.
    }
}