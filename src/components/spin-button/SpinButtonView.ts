import {
    Container,
    Sprite,
} from 'pixi.js';
import type { AssetManager } from '../assets-manager/AssetManager';

export class SpinButtonView extends Container {
    private readonly _background: Sprite;
    private readonly _assetManager: AssetManager;

    private _enabled = true;

    constructor(
        assetManager: AssetManager,
    ) {
        super();
        this._assetManager = assetManager;

        this._background =
            new Sprite(
                assetManager.getTexture(
                    'spin-button-normal',
                ),
            );


        this.addChild(
            this._background,
        );


        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on(
            'pointerdown',
            this.handlePointerDown,
        );

        this.on(
            'pointerover',
            this.handlePointerOver,
        );

        this.on(
            'pointerout',
            this.handlePointerOut,
        );

        this.on(
            'pointerup',
            this.handlePointerUp,
        );
    }

    setEnabled(
        enabled: boolean,
    ): void {
        this._enabled = enabled;

        this._background.texture =
            this._assetManager.getTexture(
                enabled
                    ? 'spin-button-normal'
                    : 'spin-button-disabled',
            );

        this.eventMode =
            enabled
                ? 'static'
                : 'none';
    }

    private handlePointerOver(): void {
        if (!this._enabled) {
            return;
        }

        this._background.texture =
            this._assetManager.getTexture(
                'spin-button-over',
            );
    }

    private handlePointerOut(): void {
        if (!this._enabled) {
            return;
        }

        this._background.texture =
            this._assetManager.getTexture(
                'spin-button-normal',
            );
    }

    private handlePointerDown(): void {
        if (!this._enabled) {
            return;
        }

        this._background.texture =
            this._assetManager.getTexture(
                'spin-button-down',
            );

        this.emit('spin');
    }

    private handlePointerUp(): void {
        if (!this._enabled) {
            return;
        }

        this._background.texture =
            this._assetManager.getTexture(
                'spin-button-hover',
            );
    }
}