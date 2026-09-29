import { Subject } from 'rxjs';

import type { GameEvent } from './GameEvent';

export class GameEventBus {
    private readonly subject =
        new Subject<GameEvent>();

    readonly events$ =
        this.subject.asObservable();

    emit(event: GameEvent): void {
        this.subject.next(event);
    }

    destroy(): void {
        this.subject.complete();
    }
}