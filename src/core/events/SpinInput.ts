import {
    fromEvent,
    Subscription,
} from 'rxjs';

import type { GameEventBus } from './GameEventBus';
import type { SpinButtonView } from '../../components';

export class SpinInput {
    private readonly subscription: Subscription;

    constructor(
        button: SpinButtonView,
        eventBus: GameEventBus,
    ) {
        this.subscription =
            fromEvent(
                button,
                'spin',
            ).subscribe(() => {
                eventBus.emit({
                    type: 'SPIN_REQUESTED',
                });
            });
    }

    destroy(): void {
        this.subscription.unsubscribe();
    }
}
