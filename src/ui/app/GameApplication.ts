import { Application } from 'pixi.js';
import { AssetManager, SandboxView, SpinButtonView, WinMeterView } from '../../components';
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
import { Subscription } from 'rxjs';
import { createActor } from 'xstate';
import { createSlotMachine } from '../../core/state-machine/slot-machine.state';

const MIN_SLOT_SCALE = 0.6;
const MAX_SLOT_SCALE = 1.2;
const SLOT_SCALE_REFERENCE_WIDTH = 1400;
const SPIN_BUTTON_SCALE_FACTOR = 0.5;
const SPIN_BUTTON_BOTTOM_MARGIN = 10;

export class GameApplication {
  private readonly app: Application;
  private actor: ReturnType<
    typeof createActor
  > | undefined;
  private backgroundView: BackgroundView | undefined;
  private slotView: SlotView | undefined;
  private spinButton: SpinButtonView | undefined;
  private scaler: SlotScaler | undefined;
  private layout: SlotLayout | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private eventBus: GameEventBus;
  private readonly _eventSubscription: Subscription;

  constructor() {
    this.app = new Application();
    this.eventBus = new GameEventBus();

    this._eventSubscription =
      this.eventBus.events$
        .subscribe((event) => {
          console.log('Event received in GameApplication:', event);
          if (this.actor) {
            this.actor.send(event);
          }
        });
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

    const game = new SlotGame(slotConfig, this.eventBus);
    const backgroundView = new BackgroundView(assetManager);
    const slotMachineView = new SlotMachineView(
      slotConfig,
      symbolSize,
      0,
      assetManager,
    );
    const spinButton = new SpinButtonView(assetManager);
    const waysWin = new WaysWinView(slotConfig);
    const winMeter = new WinMeterView();
    const reelsFrame = new ReelFrameView(slotConfig, assetManager);
    const slotView = new SlotView(
      slotMachineView,
      waysWin,
      reelsFrame,
      winMeter,
    );

    this.app.stage.addChild(backgroundView);
    this.app.stage.addChild(slotView);
    this.app.stage.addChild(spinButton);

    const layout = new SlotLayout([slotView]);
    const scaler = new SlotScaler({
      min: MIN_SLOT_SCALE,
      max: MAX_SLOT_SCALE,
      referenceWidth: SLOT_SCALE_REFERENCE_WIDTH,
    });

    this.backgroundView = backgroundView;
    this.slotView = slotView;
    this.spinButton = spinButton;
    this.scaler = scaler;
    this.layout = layout;

    this.updateLayout();

    new SpinInput(spinButton, this.eventBus);

    const controller = new SlotController(
      game,
      slotView,
      spinButton,
    );

    const sandbox = new SandboxView(
      slotConfig.symbols,
      slotConfig.rows,
      (symbols) => controller.spinDEBUG(symbols),
    );
    container.appendChild(sandbox.element);
    this.actor = createActor(createSlotMachine(controller));
    this.actor.start();

    this.resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(this.updateLayout);
    });
    this.resizeObserver.observe(container);

    (globalThis as typeof globalThis & {
      __PIXI_APP__: GameApplication;
    }).__PIXI_APP__ = this;
  }

  destroy(): void {
    this._eventSubscription.unsubscribe();
    this.actor?.stop();
    this.eventBus.destroy();
    this.resizeObserver?.disconnect();
    this.app.destroy({ removeView: true });
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
    spinButton.scale.set(scale * SPIN_BUTTON_SCALE_FACTOR);

    layout.center(
      this.app.screen.width,
      this.app.screen.height,
    );

    spinButton.x =
      (this.app.screen.width - spinButton.width) / 2;
    spinButton.y =
      this.app.screen.height - spinButton.height - SPIN_BUTTON_BOTTOM_MARGIN;
  };

  get stage() {
    return this.app.stage;
  }

  get screen() {
    return this.app.screen;
  }
}