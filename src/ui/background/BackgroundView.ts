import {
  Sprite,
} from 'pixi.js';

import type { AssetManager } from '../../components';

export class BackgroundView extends Sprite {
  constructor(
    assetManager: AssetManager,
  ) {
    super(
      assetManager.getTexture(
        'slot-background',
      ),
    );
  }

  resize(
    width: number,
    height: number,
  ): void {
    const scale =
      Math.max(
        width / this.texture.width,
        height / this.texture.height,
      );

    this.scale.set(scale);

    this.x =
      (width - this.width) / 2;

    this.y =
      (height - this.height) / 2;
  }
}