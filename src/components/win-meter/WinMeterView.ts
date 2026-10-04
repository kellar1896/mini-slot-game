import { Container, Graphics, Text } from 'pixi.js';
import type { WinMeter } from '../../ui/slot/Slot';

const METER_WIDTH = 220;
const METER_HEIGHT = 64;

export class WinMeterView extends Container implements WinMeter {
  private readonly amountText: Text;

  constructor() {
    super();
    this.label = 'win-meter';

    const panel = new Graphics()
      .roundRect(0, 0, METER_WIDTH, METER_HEIGHT, 6)
      .fill(0x18211b)
      .stroke({ color: 0xb7d879, width: 2 });
    this.addChild(panel);

    const label = new Text({
      text: 'WIN',
      style: {
        fontFamily: 'Arial',
        fontSize: 13,
        fontWeight: 'bold',
        fill: 0xb7d879,
      },
    });
    label.anchor.set(0.5, 0);
    label.position.set(METER_WIDTH / 2, 7);
    this.addChild(label);

    this.amountText = new Text({
      text: '0',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xf4f5f0,
      },
    });
    this.amountText.anchor.set(0.5, 0);
    this.amountText.position.set(METER_WIDTH / 2, 25);
    this.addChild(this.amountText);
  }

  setAmount(amount: number): void {
    this.amountText.text = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(amount);
  }

  reset(): void {
    this.setAmount(0);
  }
}