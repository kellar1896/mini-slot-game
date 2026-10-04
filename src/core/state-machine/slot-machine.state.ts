import { fromPromise, setup } from 'xstate';
import type { GameEvent } from '../events/GameEvent';
import type { SlotController } from '../game';

export const createSlotMachine = (controller: SlotController) =>
  setup({
    types: {
      events: {} as GameEvent,
    },
    actions: {
      startSpin: () => {
        controller.startSpin();
      },
      displayWin: () => {
        const result = controller.game.spinResult;
        if (!result) {
          console.warn('No spin result available to display wins.');
          return;
        }
        controller.showWins(result);
      },
      enableSpinButton: () => {
        controller.setEnableSpinButton(true);
      }
    },
    actors: {
      stopMachine: fromPromise(() => controller.stopReels()),
    },
    delays: {
      randomResponseDelay: () => Math.floor(Math.random() * 1000) + 100,
    },
    guards: {},
  }).createMachine({
    id: 'mini-slot',

    initial: 'idle',

    states: {
      idle: {
        entry: ['enableSpinButton'],
        on: {
          SPIN_REQUESTED: {
            target: 'spinning',
          },
        },
      },

      spinning: {
        entry: [
          'startSpin',
        ],
        after: {
          randomResponseDelay: {
            target: 'stopReels',
          },
        },
      },

      stopReels: {
        invoke: {
          src: 'stopMachine',
          onDone: {
            target: 'win',
          }
        }
      },

      win: {
        entry: [
          'displayWin',
        ],
        always: {
          target: 'idle',
        },
      },
    },
  });