import { Application } from 'pixi.js';
import { AssetManager, SandboxView, SpinButtonView } from '../../components';
import { ReelFrameView } from '../../components/reels-frame/ReelFrameView';
import { WaysWinView } from '../../components/ways-win/WaysWinView';
import { slotConfig, symbolSize } from '../../core/config/slot.config';
import { GameEventBus } from '../../core/events/GameEventBus';
import { SpinInput } from '../../core/events/SpinInput';
import { SlotController, SlotGame } from '../../core/game';
import { BackgroundView } from '../background/BackgroundView';
import { SlotLayout } from '../slot/SlotLayout';
import { SlotMachineView } from '../slot/SlotMachineView';
import { SlotScaler } from '../slot/SlotScaler';
import { SlotView } from '../slot/SlotView';

export class GameApplication {
  private readonly app: Application;
  private backgroundView: BackgroundView | undefined;
  private slotView: SlotView | undefined;
  private spinButton: SpinButtonView | undefined;
  private scaler: SlotScaler | undefined;
  private layout: SlotLayout | undefined;

  constructor() {
    this.app = new Application();
  }

  async init(container: HTMLElement): Promise<void> {
    await this.app.init({
      resizeTo: container,
      background: '#111111',
      antialias: true,
    });

    container.appendChild(this.app.canvas);

    const assetManager = new AssetManager();
    await assetManager.load();

    const game = new SlotGame(slotConfig);
    const backgroundView = new BackgroundView(assetManager);
    const slotMachineView = new SlotMachineView(
      slotConfig,
      symbolSize,
      0,
      assetManager,
    );
    const spinButton = new SpinButtonView(assetManager);
    const waysWin = new WaysWinView(slotConfig);
    const reelsFrame = new ReelFrameView(slotConfig, assetManager);
    const slotView = new SlotView(
      slotMachineView,
      waysWin,
      reelsFrame,
    );

    this.app.stage.addChild(backgroundView);
    this.app.stage.addChild(slotView);
    this.app.stage.addChild(spinButton);

    const layout = new SlotLayout([slotView]);
    const scaler = new SlotScaler({
      min: 0.6,
      max: 1.2,
      referenceWidth: 1400,
    });

    this.backgroundView = backgroundView;
    this.slotView = slotView;
    this.spinButton = spinButton;
    this.scaler = scaler;
    this.layout = layout;

    this.updateLayout();

    const eventBus = new GameEventBus();
    new SpinInput(spinButton, eventBus);

    const controller = new SlotController(
      game,
      slotView,
      spinButton,
      eventBus,
    );

    const sandbox = new SandboxView(
      slotConfig.symbols,
      slotConfig.rows,
      (symbols) => controller.spin(symbols),
    );
    container.appendChild(sandbox.element);

    window.addEventListener('resize', this.updateLayout);

    (globalThis as typeof globalThis & {
      __PIXI_APP__: GameApplication;
    }).__PIXI_APP__ = this;
  }

  updateLayout = (): void => {
    const { backgroundView, slotView, spinButton, scaler, layout } = this;

    if (!backgroundView || !slotView || !spinButton || !scaler || !layout) {
      return;
    }

    backgroundView.resize(
      this.app.screen.width,
      this.app.screen.height,
    );

    const scale = scaler.calculate(this.app.screen.width);

    slotView.scale.set(scale);
    spinButton.scale.set(scale * 0.5);

    layout.center(
      this.app.screen.width,
      this.app.screen.height,
    );

    spinButton.x =
      (this.app.screen.width - spinButton.width) / 2;
    spinButton.y =
      this.app.screen.height - spinButton.height - 10;
  };

  get stage() {
    return this.app.stage;
  }

  get screen() {
    return this.app.screen;
  }
}