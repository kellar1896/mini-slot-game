import { AssetManager, SpinButtonView } from './components';
import { slotConfig, symbolSize } from './core/config/slot.config';
import { GameEventBus } from './core/events/GameEventBus';
import { SpinInput } from './core/events/SpinInput';
import { SlotController, SlotGame } from './core/game';
import './style.css';
import { GameApplication } from './ui/app/GameApplication';
import { SlotLayout } from './ui/slot/SlotLayout';
import { SlotScaler } from './ui/slot/SlotScaler';
import { SlotMachineView } from './ui/slot/SlotMachineView';
import { BackgroundView } from './ui/background/BackgroundView';
import { WaysWinView } from './components/ways-win/WaysWinView';
import { ReelFrameView } from './components/reels-frame/ReelFrameView';
import { SlotView } from './ui/slot/SlotView';


const container = document.querySelector<HTMLDivElement>('#app');

if (!container) {
  throw new Error('Application container not found');
}

const app = new GameApplication();
const assetManager = new AssetManager();

await app.init(container);
await assetManager.load();

const game = new SlotGame(slotConfig);

const backgroundView = new BackgroundView(
  assetManager,
);

const slotMachineView = new SlotMachineView(
  slotConfig,
  symbolSize,
  0,
  assetManager
);

const spinButton = new SpinButtonView(assetManager);
const waysWin = new WaysWinView(slotConfig);
const reelsFrame = new ReelFrameView(slotConfig, assetManager);

const slotView= new SlotView(
  slotMachineView,
  waysWin,
  reelsFrame
);

app.stage.addChild(backgroundView);
app.stage.addChild(slotView);
app.stage.addChild(spinButton);

const layout = new SlotLayout([
  slotMachineView,
  waysWin,
  reelsFrame
]);

const scaler = new SlotScaler({
  min: 0.6,
  max: 1.2,
  referenceWidth: 1400,
});



const updateLayout = (): void => {
  backgroundView.resize(
    app.screen.width,
    app.screen.height,
  );

  const scale = scaler.calculate(
    app.screen.width,
  );

  slotMachineView.scale.set(scale);
  waysWin.scale.set(scale);
  spinButton.scale.set(scale);
  reelsFrame.scale.set(scale);

  layout.center(
    app.screen.width,
    app.screen.height,
  );

  spinButton.x =
    (app.screen.width -
      spinButton.width) / 2;

  spinButton.y =
    app.screen.height - spinButton.height -
    10;
};

updateLayout();

const eventBus =
  new GameEventBus();

new SpinInput(
  spinButton,
  eventBus,
);

new SlotController(
  game,
  slotMachineView,
  waysWin,
  spinButton,
  eventBus
);

window.addEventListener(
  'resize',
  updateLayout,
);

(globalThis as typeof globalThis & { __PIXI_APP__: GameApplication }).__PIXI_APP__ = app;
