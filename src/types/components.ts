import type { Container } from "pixi.js";
import type { SymbolPosition, Wins } from "./game";

export interface WinsView extends Container {
    resetOverlays(): void;
    showPattern(pattern: Array<SymbolPosition>): void;
    iterateWins(wins: Array<Wins>): void;
}