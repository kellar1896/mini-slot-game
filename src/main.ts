import { SpinButtonView } from './components';
import { slotConfig } from './core/config/slot.config';
import { GameEventBus } from './core/events/GameEventBus';
import { SpinInput } from './core/events/SpinInput';
import { SlotController, SlotGame } from './core/game';
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
const spinButton = new SpinButtonView();

app.stage.addChild(slotView);
app.stage.addChild(spinButton);

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

  spinButton.x =
    (app.screen.width -
      spinButton.width) / 2;

  spinButton.y =
    slotView.y +
    slotView.height +
    30;
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
    slotView,
    eventBus
  );


// const result = game.spin();

// slotView.setResult(
//   result.reels,
// );

window.addEventListener(
  'resize',
  updateLayout,
);

(globalThis as typeof globalThis & { __PIXI_APP__: GameApplication }).__PIXI_APP__ = app;
