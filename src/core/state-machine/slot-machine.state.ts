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
        console.log('Displaying win...');
        const result = controller.game.spinResult;
        if (!result) {
          console.warn('No spin result available to display wins.');
          return;
        }
        controller.showWins(result);
      },
      enableSpinButton: () => {
        console.log('Enabling spin button...');
        controller.setEnableSpinButton(true);
      }
    },
    actors: {
      stopMachine: fromPromise(() => {
        console.log('Invoking stopMachine actor...');
        return controller.stopReels();
      }),
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
        actions: [
          'displayWin',
        ],
        target: 'idle',
      },
    },
  });