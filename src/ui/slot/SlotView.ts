import { Container } from 'pixi.js';

/** Parent view for the slot machine's reels and win display. */
export class SlotView extends Container {
	
    private readonly _reelFrameContainer: Container;
    private readonly _winsContainer: Container;
    private readonly _slotMachineContainer: Container;

	public constructor(
        slotMachineContainer: Container,
        winsContainer: Container,
        reelFrameContainer: Container
    ) {
		super();

		this.label = 'slot-view';
		
        this._slotMachineContainer = slotMachineContainer;
        this._winsContainer = winsContainer;
        this._reelFrameContainer = reelFrameContainer;

        this.addChild(this._slotMachineContainer);
        this.addChild(this._winsContainer);
        this.addChild(this._reelFrameContainer);
	}

    updateLayout(): void {
        // TODO: Implement layout update logic for children containers
    }
}
