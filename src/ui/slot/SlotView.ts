import { Container } from 'pixi.js';
import type { WinsView } from '../../types';
import type { Slot, WinMeter } from './Slot';
import type { SlotMachine } from './SlotMachine';

export class SlotView extends Container implements Slot {
	
    private readonly _reelFrameContainer: Container;
    private readonly _winsContainer: WinsView;
    private readonly _slotMachineContainer: SlotMachine;
    private readonly _winMeter: WinMeter;

	public constructor(
        slotMachineContainer: SlotMachine,
        winsContainer: WinsView,
        reelFrameContainer: Container,
        winMeter: WinMeter
    ) {
		super();

		this.label = 'slot-view';
		
        this._slotMachineContainer = slotMachineContainer;
        this._winsContainer = winsContainer;
        this._reelFrameContainer = reelFrameContainer;
        this._winMeter = winMeter;
        this._winMeter.x = (slotMachineContainer.slotMachineWidth - winMeter.width) / 2;
        this._winMeter.y = -72;

        this.addChild(this._slotMachineContainer);
        this.addChild(this._winsContainer);
        this.addChild(this._reelFrameContainer);
        this.addChild(this._winMeter);
	}

    updateLayout(): void {
        
    }

    get winsView(): WinsView {
        return this._winsContainer;
    }

    get slotMachine(): SlotMachine {
        return this._slotMachineContainer;
    }

    get winMeter(): WinMeter {
        return this._winMeter;
    }
}
