import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { GameEventBus } from '../../events/GameEventBus';
import { SlotController } from './SlotGame.controller';

describe(
    'SlotController',
    () => {
        it(
            'spins the game and updates the view when SPIN_REQUESTED is emitted',
            () => {
                const result = {
                    reels: [
                        [1, 2, 3],
                        [4, 5, 6],
                        [7, 8, 9],
                        [4, 5, 6],
                        [1, 2, 4],
                    ],
                    win: 10,
                };

                const game = {
                    spin: vi.fn(() => result),
                };

                const view = {
                    setResult: vi.fn(),
                };
                const spinButton = {
                    setEnabled: vi.fn(() => {}),
                };

                const eventBus =
                    new GameEventBus();


                const controller =
                    new SlotController(
                        game as any,
                        view as any,
                        spinButton as any,
                        eventBus,
                    );

                eventBus.emit({
                    type: 'SPIN_REQUESTED',
                });

                expect(
                    game.spin,
                ).toHaveBeenCalledTimes(1);

                expect(
                    view.setResult,
                ).toHaveBeenCalledTimes(1);

                expect(
                    view.setResult,
                ).toHaveBeenCalledWith(
                    result.reels,
                );

                controller.destroy();
                eventBus.destroy();
            },
        );
    },
);