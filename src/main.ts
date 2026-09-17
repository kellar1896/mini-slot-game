import { slotConfig } from './core/config/slot.config';
import { SlotGame } from './core/game/slotGame';
import './style.css';
import { GameApplication } from './ui/app/GameApplication';
import { SlotLayout } from './ui/slot/SlotLayout';
import { SlotScaler } from './ui/slot/SlotScaler';
import { SlotView } from './ui/slot/SlotView';


const container = document.querySelector<HTMLDivElement>('#app');

if (!container) {
  throw new Error('Application container not found');
}

const app = new GameApplication();

await app.init(container);

const game = new SlotGame(slotConfig);

const slotView = new SlotView(
  slotConfig.reels,
  slotConfig.rows,
  240,
  10,
);

app.stage.addChild(slotView);

const layout = new SlotLayout(
  slotView,
);

const scaler = new SlotScaler({
  min: 0.6,
  max: 1.2,
  referenceWidth: 1280,
});

const updateLayout = (): void => {
  const scale = scaler.calculate(
    app.screen.width,
  );

  slotView.scale.set(scale);

  layout.center(
    app.screen.width,
    app.screen.height,
  );
};

updateLayout();

const result = game.spin();

slotView.setResult(
  result.reels,
);

window.addEventListener(
  'resize',
  updateLayout,
);

(globalThis as typeof globalThis & { __PIXI_APP__: GameApplication }).__PIXI_APP__ = app;
