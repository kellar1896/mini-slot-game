import type { Container } from 'pixi.js';

export class SlotLayout {
  private readonly _slotViewContainers: Container[];

  constructor(
    slotContainers: Container[],
  ) {
    this._slotViewContainers = slotContainers;
  }

  center(
    width: number,
    height: number,
  ): void {
    for (const container of this._slotViewContainers) {
      container.x =
        (width - container.width) / 2;

      container.y =
        (height - container.height) / 2;
    }
  }
}