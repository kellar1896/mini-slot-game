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

export class SlotController {
    private readonly actor: ReturnType<
        typeof createActor
    >;

    private readonly _game: SlotGame;
    private readonly _view: SlotView;
    private readonly _eventSubscription: Subscription;

    constructor(
        game: SlotGame,
        view: SlotView,
        eventBus: GameEventBus,
    ) {
        this._game = game;
        this._view = view;

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

        this._view.startSpin();

        const result =
            this._game.spin();

        await this._view.stop(result.reels);

        this.actor.send({
            type: 'REELS_STOPPED',
        });

        if (result.win > 0) {
            this.actor.send({
                type: 'WIN_DETECTED',
            });
        } else {
            this.actor.send({
                type: 'NO_WIN',
            });
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
