export interface SlotScaleConfig {
  min: number;
  max: number;
  referenceWidth: number;
}

export class SlotScaler {
private readonly _config: SlotScaleConfig;
  constructor(
    config: SlotScaleConfig,
  ) {
    this._config = config;
  }

  calculate(
    screenWidth: number,
  ): number {
    const scale =
      screenWidth /
      this._config.referenceWidth;

    return Math.min(
      this._config.max,
      Math.max(
        this._config.min,
        scale,
      ),
    );
  }
}
