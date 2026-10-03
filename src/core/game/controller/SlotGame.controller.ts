import {
    createActor,
} from 'xstate';
import {
    filter,
    Subscription,
} from 'rxjs';

import { SlotView } from '../../../ui/slot/SlotView';
import { SlotGame } from '../model/SlotGame';
import { slotMachine } from '../../state-machine/slot-machine.state';
import type { GameEvent } from '../../events/GameEvent';
import type { GameEventBus } from '../../events/GameEventBus';
import type { SpinButtonView } from '../../../components';
import type { WaysWinView } from '../../../components/ways-win/WaysWinView';

export class SlotController {
    private readonly actor: ReturnType<
        typeof createActor
    >;

    private readonly _game: SlotGame;
    private readonly _slotView: SlotView;
    private readonly _winsView: WaysWinView;
    private readonly _spinButton: SpinButtonView;
    private readonly _eventSubscription: Subscription;

    constructor(
        game: SlotGame,
        slotView: SlotView,
        winsView: WaysWinView,
        spinButton: SpinButtonView,
        eventBus: GameEventBus,
    ) {
        this._game = game;
        this._slotView = slotView;
        this._winsView = winsView;
        this._spinButton = spinButton;

        this.actor = createActor(
            slotMachine,
        );

        this.actor.start();

        this._eventSubscription =
            eventBus.events$
                .pipe(
                    filter(
                        (
                            event: GameEvent,
                        ) =>
                            event.type ===
                            'SPIN_REQUESTED',
                    ),
                )
                .subscribe(() => {
                    this.spin();
                });
    }

    async spin(): Promise<void> {
        if (
            this.actor.getSnapshot().value !==
            'idle'
        ) {
            return;
        }

        this.actor.send({
            type: 'SPIN_REQUEST',
        });

        this._winsView.resetOverlays();
        this._spinButton.setEnabled(false);
        this._slotView.startSpin();

        await new Promise((resolve) =>
            setTimeout(resolve, 2000),
        );

        const result =
            this._game.spin();

        await this._slotView.stop(result.reels, result.reelPositions);
        this._winsView.showPattern(result.wins[0]?.pattern ?? [])

        this.actor.send({
            type: 'REELS_STOPPED',
        });

        if (result.win > 0) {
            this.actor.send({
                type: 'WIN_DETECTED',
            });

            this.actor.send({
                type: 'WIN_COMPLETED',
            });
            this._spinButton.setEnabled(true);
        } else {
            this.actor.send({
                type: 'NO_WIN',
            });
            this._spinButton.setEnabled(true);
        }
    }

    destroy(): void {
        this._eventSubscription.unsubscribe();
        this.actor.stop();
    }

    get state() {
        return this.actor.getSnapshot().value;
    }
}
