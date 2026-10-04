import {
    createActor,
} from 'xstate';
import {
    filter,
    Subscription,
} from 'rxjs';

import { SlotGame } from '../model/SlotGame';
// import { slotMachine } from '../../state-machine/slot-machine.state';
import type { GameEvent } from '../../events/GameEvent';
import type { GameEventBus } from '../../events/GameEventBus';
import type { SpinButtonView } from '../../../components';
import type { Slot, SlotView } from '../../../ui/slot';
import type { SymbolId } from '../../../types/game';

export class SlotController {
    // private readonly actor: ReturnType<
    //     typeof createActor
    // >;

    private readonly _game: SlotGame;
    private readonly _slotView: Slot;
    private readonly _spinButton: SpinButtonView;
    private readonly _eventSubscription: Subscription | undefined;

    constructor(
        game: SlotGame,
        slotView: SlotView,
        spinButton: SpinButtonView,
        eventBus: GameEventBus,
    ) {
        this._game = game;
        this._slotView = slotView;
        this._spinButton = spinButton;

        // this.actor = createActor(
        //     slotMachine,
        // );

        // this.actor.start();
        console.log(this._eventSubscription);

        // this._eventSubscription =
        //     eventBus.events$
        //         .pipe(
        //             filter(
        //                 (
        //                     event: GameEvent,
        //                 ) =>
        //                     event.type ===
        //                     'SPIN_REQUESTED',
        //             ),
        //         )
        //         .subscribe(() => {
        //             this.spin();
        //         });
    }

    startSpin(): void {
        this._slotView.winsView.resetOverlays();
        this._slotView.winMeter.reset();
        this._spinButton.setEnabled(false);
        this._slotView.slotMachine.startSpin();
    }

    stopReels(forcedSymbols?: SymbolId[]): Promise<void> {
        const result = forcedSymbols?.length
            ? this._game.spinWithSymbols(forcedSymbols)
            : this._game.spin();
        return this._slotView.slotMachine.stop(result.reels, result.reelPositions);
    }

    showWins(result: { wins: any[]; win: number }): void {
        this._slotView.winsView.iterateWins(result.wins);
        this._slotView.winMeter.setAmount(result.win);
        this._spinButton.setEnabled(true);
    }

    setEnableSpinButton(enabled: boolean): void {
        this._spinButton.setEnabled(enabled);
    }

    async spin(forcedSymbols?: SymbolId[]): Promise<void> {
        this._slotView.winsView.resetOverlays();
        this._slotView.winMeter.reset();
        this._spinButton.setEnabled(false);
        this._slotView.slotMachine.startSpin();

        await new Promise((resolve) =>
            setTimeout(resolve, 2000),
        );

        const result = forcedSymbols?.length
            ? this._game.spinWithSymbols(forcedSymbols)
            : this._game.spin();

        await this._slotView.slotMachine.stop(result.reels, result.reelPositions);
        this._slotView.winsView.iterateWins(result.wins);
        this._slotView.winMeter.setAmount(result.win);
    }

    get game(): SlotGame {
        return this._game;
    }
}
