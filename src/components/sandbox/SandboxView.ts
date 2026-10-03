import type { SymbolConfig, SymbolId } from '../../types/game';

export class SandboxView {
  readonly element: HTMLElement;

  private readonly selectedSymbols = new Set<SymbolId>();
  private readonly symbolButtons = new Map<SymbolId, HTMLButtonElement>();
  private readonly countLabel: HTMLSpanElement;
  private readonly spinButton: HTMLButtonElement;
  private isSpinning = false;

  constructor(
    symbols: SymbolConfig[],
    maxSelected: number,
    onSpin: (symbols: SymbolId[]) => Promise<void>,
  ) {
    this.element = document.createElement('section');
    this.element.className = 'sandbox';
    this.element.setAttribute('aria-label', 'Win sandbox');

    const heading = document.createElement('div');
    heading.className = 'sandbox__heading';

    const title = document.createElement('h2');
    title.textContent = 'Sandbox';
    heading.append(title);

    this.countLabel = document.createElement('span');
    this.countLabel.className = 'sandbox__count';
    heading.append(this.countLabel);

    const symbolList = document.createElement('div');
    symbolList.className = 'sandbox__symbols';
    symbolList.setAttribute('role', 'group');
    symbolList.setAttribute('aria-label', 'Winning symbols');

    for (const symbol of symbols) {
      const button = document.createElement('button');
      button.className = 'sandbox__symbol';
      button.type = 'button';
      button.textContent = symbol.id;
      button.setAttribute('aria-label', `Toggle ${symbol.id} win`);
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        if (this.selectedSymbols.has(symbol.id)) {
          this.selectedSymbols.delete(symbol.id);
        } else if (this.selectedSymbols.size < maxSelected) {
          this.selectedSymbols.add(symbol.id);
        }

        this.updateSelection(maxSelected);
      });
      this.symbolButtons.set(symbol.id, button);
      symbolList.append(button);
    }

    this.spinButton = document.createElement('button');
    this.spinButton.className = 'sandbox__spin';
    this.spinButton.type = 'button';
    this.spinButton.textContent = 'Spin forced';
    this.spinButton.disabled = true;
    this.spinButton.addEventListener('click', async () => {
      if (this.selectedSymbols.size === 0) {
        return;
      }

      this.isSpinning = true;
      this.updateSelection(maxSelected);
      this.spinButton.disabled = true;
      try {
        await onSpin([...this.selectedSymbols]);
      } finally {
        this.isSpinning = false;
        this.updateSelection(maxSelected);
      }
    });

    this.element.append(heading, symbolList, this.spinButton);
    this.updateSelection(maxSelected);
  }

  private updateSelection(maxSelected: number): void {
    this.countLabel.textContent = `${this.selectedSymbols.size} / ${maxSelected}`;
    this.spinButton.disabled = this.isSpinning || this.selectedSymbols.size === 0;

    for (const [symbol, button] of this.symbolButtons) {
      const isSelected = this.selectedSymbols.has(symbol);
      button.setAttribute('aria-pressed', String(isSelected));
      button.disabled = this.isSpinning || (!isSelected && this.selectedSymbols.size >= maxSelected);
    }
  }
}