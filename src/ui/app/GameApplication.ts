import { Application } from 'pixi.js';

export class GameApplication {
  private readonly app: Application;

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
  }

  get stage() {
    return this.app.stage;
  }

  get screen() {
    return this.app.screen;
  }
}