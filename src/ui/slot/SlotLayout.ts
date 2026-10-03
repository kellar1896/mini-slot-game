import type { Container } from 'pixi.js';

export class SlotLayout {
private readonly _slotContainer: Container;
private readonly _winsContainer: Container;

  constructor(
    slotContainer: Container,
    winsContainer: Container
  ) {
    this._slotContainer = slotContainer;
    this._winsContainer = winsContainer;
  }

  center(
    width: number,
    height: number,
  ): void {
    this._slotContainer.x =
      (width - this._slotContainer.width) / 2;

    this._slotContainer.y =
      (height - this._slotContainer.height) / 2;

    this._winsContainer.x =
      (width - this._winsContainer.width) / 2;

    this._winsContainer.y =
      (height - this._winsContainer.height) / 2;
  }
}