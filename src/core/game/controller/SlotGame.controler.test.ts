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
            async () => {
                vi.useFakeTimers();

                const result = {
                    reels: [
                        [1, 2, 3],
                        [4, 5, 6],
                        [7, 8, 9],
                        [4, 5, 6],
                        [1, 2, 4],
                    ],
                    win: 10,
                    reelPositions: [0, 1, 2, 3, 4],
                    wins: [],
                };

                const game = {
                    spin: vi.fn(() => result),
                };

                const slotMachine = {
                    startSpin: vi.fn(),
                    stop: vi.fn().mockResolvedValue(undefined),
                };
                const winsView = {
                    resetOverlays: vi.fn(),
                    iterateWins: vi.fn(),
                };
                const winMeter = {
                    reset: vi.fn(),
                    setAmount: vi.fn(),
                };
                const view = {
                    slotMachine,
                    winsView,
                    winMeter,
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
                await vi.advanceTimersByTimeAsync(2000);

                expect(
                    game.spin,
                ).toHaveBeenCalledTimes(1);

                expect(
                    winsView.resetOverlays,
                ).toHaveBeenCalledTimes(1);
                expect(winMeter.reset).toHaveBeenCalledTimes(1);
                expect(slotMachine.startSpin).toHaveBeenCalledTimes(1);
                expect(slotMachine.stop).toHaveBeenCalledWith(
                    result.reels,
                    result.reelPositions,
                );
                expect(winsView.iterateWins).toHaveBeenCalledWith(result.wins);
                expect(winMeter.setAmount).toHaveBeenCalledWith(result.win);
                expect(spinButton.setEnabled).toHaveBeenNthCalledWith(1, false);
                expect(spinButton.setEnabled).toHaveBeenNthCalledWith(2, true);

                controller.destroy();
                eventBus.destroy();
                vi.useRealTimers();
            },
        );
    },
);