import {
    Container,
    Graphics,
    Text,
} from 'pixi.js';

export class SpinButtonView extends Container {
    private readonly background: Graphics;
    private readonly labelText: Text;

    private enabled = true;

    constructor(
        width = 220,
        height = 70,
    ) {
        super();

        this.background =
            new Graphics();

        this.background
            .roundRect(
                0,
                0,
                width,
                height,
                12,
            )
            .fill(0x2f7dff);

        this.labelText =
            new Text({
                text: 'SPIN',
                style: {
                    fill: 0xffffff,
                    fontSize: 28,
                    fontWeight: 'bold',
                },
            });

        this.labelText.anchor.set(0.5);

        this.labelText.position.set(
            width / 2,
            height / 2,
        );

        this.addChild(
            this.background,
        );

        this.addChild(
            this.labelText,
        );

        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on(
            'pointerdown',
            () => {
                if (!this.enabled) {
                    return;
                }

                this.emit('spin');
            },
        );
    }

    setEnabled(
        enabled: boolean,
    ): void {
        this.enabled = enabled;

        this.alpha =
            enabled ? 1 : 0.5;

        this.eventMode =
            enabled
                ? 'static'
                : 'none';
    }
}