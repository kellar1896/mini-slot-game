import {
    describe,
    expect,
    it,
} from 'vitest';

import {
    SpinButtonView,
} from '../../components';

import {
    GameEventBus,
} from './GameEventBus';

import {
    SpinInput,
} from './SpinInput';

describe(
    'SpinInput',
    () => {
        it(
            'emits SPIN_REQUESTED when the spin button emits spin',
            () => {
                const button =
                    new SpinButtonView();

                const eventBus =
                    new GameEventBus();

                const events: unknown[] = [];

                const subscription =
                    eventBus.events$
                        .subscribe(
                            (event) => {
                                events.push(
                                    event,
                                );
                            },
                        );

                const spinInput = new SpinInput(
                    button,
                    eventBus,
                );

                button.emit(
                    'spin',
                );

                expect(
                    events,
                ).toEqual([
                    {
                        type:
                            'SPIN_REQUESTED',
                    },
                ]);

                spinInput.destroy();
                subscription.unsubscribe();
                eventBus.destroy();
            },
        );
    },
);