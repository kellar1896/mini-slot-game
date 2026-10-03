import { Container, Sprite } from "pixi.js";
import type { SlotConfig } from "../../types/game";
import type { AssetManager } from "../assets-manager/AssetManager";
import { symbolSize } from "../../core/config/slot.config";

export class ReelFrameView extends Container {
    label = 'reel-frame';

    private readonly _reelsFrame: Sprite;

    constructor(
        slotConfig: SlotConfig,
        assetManager: AssetManager
    ) {
        super();
        this._reelsFrame =
            new Sprite(
                assetManager.getTexture(
                    'reel-frame',
                ),
            );

        this._reelsFrame.width = slotConfig.reels * symbolSize;
        this._reelsFrame.height = slotConfig.rows * symbolSize;

        this.addChild(this._reelsFrame);
    }


}