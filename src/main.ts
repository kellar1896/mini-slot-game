import './style.css';
import { GameApplication } from './ui/app/GameApplication';

const container = document.querySelector<HTMLDivElement>('#app');

if (!container) {
  throw new Error('Application container not found');
}

const app = new GameApplication();
await app.init(container);
