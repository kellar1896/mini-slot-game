import { Container } from 'pixi.js';
import type { WinsView } from '../../types';
import type { Slot } from './Slot';
import type { SlotMachine } from './SlotMachine';

export class SlotView extends Container implements Slot {
	
    private readonly _reelFrameContainer: Container;
    private readonly _winsContainer: WinsView;
    private readonly _slotMachineContainer: SlotMachine;

	public constructor(
        slotMachineContainer: SlotMachine,
        winsContainer: WinsView,
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
        
    }

    get winsView(): WinsView {
        return this._winsContainer;
    }

    get slotMachine(): SlotMachine {
        return this._slotMachineContainer;
    }
}
