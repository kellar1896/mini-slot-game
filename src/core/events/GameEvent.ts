export type GameEvent =
    | {
        type: 'SPIN_REQUESTED';
    }
    | {
        type: 'SPIN_STARTED';
    }
    | {
        type: 'SPIN_COMPLETED';
    }
    | {
        type: 'WIN_DETECTED';
        amount: number;
    };