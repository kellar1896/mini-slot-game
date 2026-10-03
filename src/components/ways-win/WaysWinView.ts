import { Container, Graphics } from "pixi.js";
import { Tween } from "@tweenjs/tween.js";
import type { SlotConfig, SymbolPosition, Wins } from "../../types/game";
import { symbolSize } from "../../core/config/slot.config";
import type { WinsView } from "../../types";


export class WaysWinView extends Container implements WinsView {
    label = 'ways-container';

    private readonly _reelsOverlays: Array<Array<Graphics>> = [];
    private readonly winOverlayAlpha = 0.9;
    private readonly winDisplayDuration = 1200;
    private activeTween: Tween<{ progress: number }> | null = null;
    private animationFrame: number | null = null;
    private animationId = 0;

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
        this.stopWinAnimation();
        this.updateOverlay(0);
    }

    showPattern(pattern: Array<SymbolPosition>): void {
        this.stopWinAnimation();
        this.applyPattern(pattern);
    }

    private applyPattern(pattern: Array<SymbolPosition>): void {
        this.updateOverlay(this.winOverlayAlpha);
        pattern.forEach((position) => {
            const { column, row } = position;
            const symbolOverlay = this._reelsOverlays[column][row];
            if (!symbolOverlay) {
                throw new Error(
                    `Can not find symbol overlar for column:${column} and row:${row}`,
                );
            }
            symbolOverlay.alpha = 0;
        });
    }

    iterateWins(wins: Array<Wins>): void {
        this.stopWinAnimation();

        if (wins.length === 0) {
            this.updateOverlay(0);
            return;
        }

        const animationId = this.animationId;
        let winIndex = 0;

        const showNextWin = (): void => {
            if (animationId !== this.animationId) {
                return;
            }

            const win = wins[winIndex];
            if (!win) {
                return;
            }

            this.applyPattern(win.pattern);
            winIndex = (winIndex + 1) % wins.length;

            this.activeTween = new Tween({ progress: 0 })
                .to({ progress: 1 }, this.winDisplayDuration)
                .onComplete(showNextWin)
                .start();
        };

        const updateTween = (time: number): void => {
            if (animationId !== this.animationId || !this.activeTween) {
                return;
            }

            this.activeTween.update(time);

            if (animationId === this.animationId && this.activeTween) {
                this.animationFrame = requestAnimationFrame(updateTween);
            }
        };

        showNextWin();
        this.animationFrame = requestAnimationFrame(updateTween);
    }

    private stopWinAnimation(): void {
        this.animationId++;
        this.activeTween?.stop();
        this.activeTween = null;

        if (this.animationFrame !== null) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
}