import { setup } from 'xstate';

export const slotMachine =
  setup({
    types: {
      events: {} as
        | {
            type: 'SPIN_REQUEST';
          }
        | {
            type: 'REELS_STOPPED';
          }
        | {
            type: 'WIN_DETECTED';
          }
        | {
            type: 'NO_WIN';
          }
        | {
            type: 'WIN_COMPLETED';
          },
    },
  }).createMachine({
    id: 'mini-slot',

    initial: 'idle',

    states: {
      idle: {
        on: {
          SPIN_REQUEST: {
            target: 'spinning',
          },
        },
      },

      spinning: {
        on: {
          REELS_STOPPED: {
            target: 'evaluating',
          },
        },
      },

      evaluating: {
        on: {
          WIN_DETECTED: {
            target: 'win',
          },

          NO_WIN: {
            target: 'idle',
          },
        },
      },

      win: {
        on: {
          WIN_COMPLETED: {
            target: 'idle',
          },
        },
      },
    },
  });