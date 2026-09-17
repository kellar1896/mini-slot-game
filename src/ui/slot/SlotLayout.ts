import type { Container } from 'pixi.js';

export class SlotLayout {
private readonly _container: Container;

  constructor(
    container: Container,
  ) {
    this._container = container;
  }

  center(
    width: number,
    height: number,
  ): void {
    this._container.x =
      (width - this._container.width) / 2;

    this._container.y =
      (height - this._container.height) / 2;
  }
}