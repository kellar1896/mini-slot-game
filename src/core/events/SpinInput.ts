import { fromEvent } from 'rxjs';

import type { GameEventBus } from './GameEventBus';
import type { SpinButtonView } from '../../components';

export class SpinInput {
    constructor(
        button: SpinButtonView,
        eventBus: GameEventBus,
    ) {
        fromEvent(
            button,
            'spin',
        ).subscribe(() => {
            eventBus.emit({
                type: 'SPIN_REQUESTED',
            });
        });
    }
}