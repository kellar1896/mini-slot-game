export type GameEvent =
    | {
        type: 'SPIN_REQUESTED';
    }
    | {
        type: 'SPIN_RESPONSE';
    }
    | {
        type: 'SPIN_COMPLETED';
    }
    | {
        type: 'WIN_DETECTED';
        amount: number;
    }
    | {
        type: 'NO_WIN';
    };