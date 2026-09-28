import { createActor } from "xstate";
import { SlotView } from "../../../ui/slot/SlotView";
import { SlotGame } from "../model/SlotGame";
import { slotMachine } from "../../state-machine/slot-machine.state";

export class SlotController {
    private readonly actor;

    private readonly _game: SlotGame;
    private readonly _view: SlotView;
    constructor(
        game: SlotGame,
        view: SlotView
    ) {
        this._game = game;
        this._view = view;
        this.actor = createActor(
            slotMachine,
        );

        this.actor.start();
    }

    spin(): void {
        if (
            this.actor.getSnapshot().value !==
            'idle'
        ) {
            return;
        }

        this.actor.send({
            type: 'SPIN_REQUEST',
        });

        const result = this._game.spin();

        this._view.setResult(
            result.reels,
        );

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

    get state() {
        return this.actor.getSnapshot().value;
    }
}