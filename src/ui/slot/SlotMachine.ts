import type { Container } from "pixi.js";
import type { SymbolId } from "../../types/game";

export interface SlotMachine extends Container {
    startSpin(): void;
    stop(result: SymbolId[][], reelPositions: number[]): Promise<void>;
    setResult(result: SymbolId[][]): void;
    readonly slotMachineWidth: number;
    readonly slotMachineHeight: number;
}