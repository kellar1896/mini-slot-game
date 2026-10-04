import type { Container } from "pixi.js";
import type { WinsView } from "../../types";
import type { SlotMachine } from "./SlotMachine";

export interface Slot {
    winsView: WinsView;
    slotMachine: SlotMachine;
    winMeter: WinMeter;
}

export interface WinMeter extends Container {
    setAmount(amount: number): void;
    reset(): void;
}