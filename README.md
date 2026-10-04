# Mini Slot Engine

A small slot-game client built from scratch with **TypeScript, PixiJS, RxJS, XState and Vite**.

This project was created as a technical exercise to demonstrate how I approach the development of an interactive iGaming frontend: starting from the game model and configuration, then progressively building the rendering layer, reel mechanics, game lifecycle, win evaluation, visual feedback, testing tools and responsive layout.

The project is intentionally small, but the architecture is designed around concepts that can scale towards a larger slot-game client.

---

## Demo

> Add a screenshot or GIF of the finished game here.

The current implementation includes:

- 5 reels × 3 rows
- Configurable reel strips
- 7 configurable symbols
- Random reel positions
- Animated reel spinning
- Sequential reel stopping
- Ways-based win evaluation
- Multiple simultaneous wins
- Win highlighting and cycling
- Interactive spin button
- Disabled state during spins
- Responsive scaling
- Custom slot-machine assets
- Win sandbox for deterministic testing
- Unit tests for core game logic and input handling

---

## Technical Highlights

- Config-driven reel strips and symbol definitions
- Result-driven reel stopping
- Ways-based win evaluation
- PixiJS ticker-driven reel animation
- XState game lifecycle
- RxJS event-driven input
- Reusable symbol instances through object recycling
- Deterministic win sandbox for development
- Unit tests for game mathematics and event handling
- Responsive PixiJS layout
- Separation between game logic, orchestration and rendering

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Building the Project](#building-the-project)
- [Development Process](#development-process)
- [Game Configuration](#game-configuration)
- [Game Flow](#game-flow)
- [Game Model](#game-model)
- [Ways Win Evaluation](#ways-win-evaluation)
- [Reel Rendering and Animation](#reel-rendering-and-animation)
- [State Management](#state-management)
- [Event-Driven Input](#event-driven-input)
- [Win Presentation](#win-presentation)
- [Sandbox](#sandbox)
- [Responsive Layout](#responsive-layout)
- [Testing](#testing)
- [Technical Decisions](#technical-decisions)
- [Trade-offs and Limitations](#trade-offs-and-limitations)
- [Possible Improvements](#possible-improvements)

---
# Tech Stack

| Technology | Purpose |
|---|---|
| **TypeScript** | Application, domain and UI logic |
| **PixiJS 8** | Rendering and game UI |
| **RxJS 7** | Event-driven communication |
| **XState 5** | Game lifecycle/state machine |
| **Tween.js** | Win-overlay animation |
| **Vite 8** | Development server and bundling |
| **Vitest 5** | Unit testing |

---

# Architecture

The application is divided into several layers.

```text
SpinButtonView ──"spin"──► SpinInput ──SPIN_REQUESTED──► GameEventBus
                                                   │
                                                   ▼
                                            GameApplication
                                            forwards event
                                                   │
                                                   ▼
                                              XState actor
                                                   │ invokes
                                                   ▼
                                              SlotController
                                              /           \
                                             ▼             ▼
                                        SlotGame       SlotView / Pixi
                                      result + wins   reels, wins, UI
                                          │
                                          └──SPIN_RESPONSE──► GameEventBus

SandboxView ──forced symbols──► SlotController.spinDEBUG()
                            (direct path; bypasses XState)
```

The main principle is:

> **The game model determines the result; the rendering layer presents that result.**

This prevents visual animation from becoming responsible for game mathematics.

---

# Project Structure

```text
src/
├── assets/
│   ├── slot/
│   └── symbols/
│
├── components/
│   ├── assets-manager/
│   ├── reels-frame/
│   ├── sandbox/
│   ├── spin-button/
│   ├── ways-win/
│   └── win-meter/
│
├── core/
│   ├── config/
│   ├── events/
│   ├── game/
│   │   ├── controller/
│   │   ├── model/
│   │   └── test/
│   └── state-machine/
│
├── types/
│
├── ui/
│   ├── app/
│   ├── background/
│   ├── reel/
│   ├── slot/
│   └── symbol/
│
├── main.ts
└── style.css
```

### `core`

Contains game-related logic that should not depend on the visual implementation.

### `components`

Contains reusable UI components such as the spin button, sandbox, asset manager and win presentation.

### `ui`

Contains PixiJS rendering and layout.

### `types`

Contains shared domain contracts such as symbols, reel configuration and spin results.

---

# Building the Project

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build the application:

```bash
npm run build
```

Run tests:

```bash
npm test
```

---

# Development Process

I approached the project incrementally rather than trying to build the entire slot engine at once.

The implementation was developed around several progressively more complex layers.

```text
1. Project setup
       ↓
2. Define game configuration
       ↓
3. Build the domain model
       ↓
4. Create PixiJS rendering
       ↓
5. Implement symbols and reels
       ↓
6. Implement reel-strip animation
       ↓
7. Introduce result-based stopping
       ↓
8. Introduce state management
       ↓
9. Introduce event-driven input
       ↓
10. Implement ways evaluation
       ↓
11. Add win visualization
       ↓
12. Add sandbox / deterministic testing
       ↓
13. Add responsive layout and visual polish
```

This order was intentional.

The game mechanics were established before building too much visual complexity around them.

That made it possible to verify the underlying result independently from the animation.

---

# Game Configuration

The game is configuration-driven.

The main configuration defines:

```ts
interface SlotConfig {
  rows: number;
  reels: number;
  symbols: SymbolConfig[];
  reelStrips: ReelConfig[];
  defaultReels: SymbolId[][];
}
```

The current game is configured as:

```text
5 reels
3 rows
7 symbols
50 positions per reel
```

Each symbol has an ID and a value:

```ts
{
  id: 'M1',
  value: 10
}
```

The reel strips are independent arrays.

This is important because a real slot game should not assume that every reel has the same symbol distribution.

---

# Game Flow

A spin follows this general lifecycle:

```text
SpinInput emits SPIN_REQUESTED
                 │
                 ▼
GameApplication forwards event to XState actor
                 │
                 ▼
idle ──► spinning ──► stopReels ──► win ──► idle
           │               │          │
           │               │          └─ show cached result
           │               └─ await reel-stop Promise
           └─ start animation; wait a randomized delay
```

The state machine owns the lifecycle transitions, while the controller exposes operations the machine invokes. The game model calculates the result, and Pixi views animate and present it. The machine enters `win` after the reel-stop Promise resolves; it then reads the result cached by `SlotGame` and returns to `idle`.

---

# Game Model

The `SlotGame` class is responsible for generating and evaluating results.

It does not know anything about:

- PixiJS
- Sprites
- Containers
- Animation
- DOM elements
- Buttons

Its responsibility is to answer:

> Given the game configuration, what is the result of this spin?

A normal spin generates a random starting position for every reel.

For each reel:

```text
random start position
        ↓
read consecutive positions
        ↓
produce visible rows
```

For example:

```text
Reel strip:

... F2 M3 M2 F3 M1 F1 M1 M3 ...

             ▲
             │
        random position

Visible result:

M1
F1
M1
```

The model returns both the visible symbols and the reel positions.

```ts
interface SpinResult {
  reels: SymbolId[][];
  win: number;
  reelPositions: number[];
  wins: Wins[];
}
```

---

# Ways Win Evaluation

One of the main game-logic features implemented in the project is a simplified **ways-to-win** evaluation.

Instead of defining individual paylines, the evaluator looks for matching symbols across consecutive reels.

For every configured symbol:

1. Find matching rows on the first reel.
2. Continue to the next reel.
3. Stop when a reel contains no matching symbol.
4. Require at least 3 consecutive matching reels.
5. Calculate the number of possible combinations.
6. Multiply the number of ways by the symbol value.

---

# Reel Rendering and Animation

The visual reel implementation is handled by `ReelView`.

The visible symbols are buffered with an additional symbol above and below the visible area.

Conceptually:

```text
        buffer
          ↓
       [ F2 ]
       [ M1 ]  ← visible
       [ F3 ]  ← visible
       [ M2 ]  ← visible
       [ F1 ]  ← visible
          ↑
        buffer
```

The reel does not create new sprites for every movement.

Instead, symbols are recycled.

---

# Reel Animation Loop

The reel animation uses the PixiJS `Ticker`.

The simplified flow is:

```text
Pixi Ticker
     ↓
updateSpin()
     ↓
Move symbol container
     ↓
Cross symbol boundary?
     ↓
Recycle symbol
     ↓
Continue
```

The stop animation uses the same ticker and gradually travels towards the calculated stopping distance.

The stop uses easing so that the reel decelerates instead of simply stopping at a constant speed.

---

# State Management

XState 5 runs the slot lifecycle as an actor created in `GameApplication`. The current machine contains four states:

```text
idle --SPIN_REQUESTED--> spinning
spinning --random delay--> stopReels
stopReels --stop Promise resolves--> win
win --immediate transition--> idle
```

On entry to `spinning`, the machine disables the spin button, clears old win presentation, and starts reel animation through the controller. After a randomized delay, it invokes the controller's reel-stop operation. When that Promise resolves, the `win` state presents the result from `SlotGame.spinResult`, then transitions immediately back to `idle`, where the spin button is enabled again. Win/no-win is not a separate branch in the current machine.

---

# Controller Responsibilities

`SlotController` is the orchestration layer.

It provides operations used by the state machine to coordinate:

- Starting the visual spin
- Asking `SlotGame` to generate or force a result
- Reel animation
- Win presentation
- Spin button state

The controller neither subscribes to the event bus nor owns state transitions. It does not implement the game mathematics; `SlotGame` evaluates results. The XState machine chooses when controller operations run.

```text
GameApplication ── creates/connects ──► XState actor
                                                   │
                                                   ▼
                                            SlotController
                                            ├── SlotGame
                                            ├── SlotMachineView
                                            ├── WaysWinView
                                            ├── WinMeterView
                                            └── SpinButtonView
```

This keeps orchestration separate from both the domain and rendering implementations.

---

# Event-Driven Input

The spin button does not call the controller directly. Instead, its `spin` event is translated into an application event.

```text
SpinButtonView
      │
      │ "spin"
      ▼
SpinInput
      │
      ▼
GameEventBus
      │
      │ SPIN_REQUESTED
      ▼
GameApplication event subscription
        │
        ▼
XState actor
```

The RxJS-based event bus is shared by `SpinInput`, `GameApplication`, and `SlotGame`. `SpinInput` translates the button's `spin` event to `SPIN_REQUESTED`. `GameApplication` subscribes to the bus and forwards events to the actor. `SlotGame` emits `SPIN_RESPONSE` when it creates a result; the current state machine does not use that event to drive a transition. This keeps the input component independent of the game lifecycle and controller.

---

# Win Presentation

The ways-win presentation is separated from the game evaluator.

The evaluator returns data describing:

```text
Which symbol?
Which columns?
Which rows?
How much did it win?
```

The `WaysWinView` decides how to display that information.

For a win pattern, the view creates an overlay for every visible symbol position.

```text
┌─────┬─────┬─────┬─────┬─────┐
│     │     │     │     │     │
├─────┼─────┼─────┼─────┼─────┤
│     │     │     │     │     │
├─────┼─────┼─────┼─────┼─────┤
│     │     │     │     │     │
└─────┴─────┴─────┴─────┴─────┘
```

When a win is displayed, the reel area is dimmed and the symbols participating in the win are revealed by removing their overlay.

This allows multiple winning patterns to be cycled.

---

# Win Animation

`WaysWinView` supports two presentation modes:

### Single pattern

```ts
showPattern(pattern)
```

Used when a specific win pattern needs to be displayed.

### Multiple wins

```ts
iterateWins(wins)
```

Cycles through all winning combinations.

Tween.js is used for the timing of the win presentation.

---

# Sandbox

One of the most useful development tools in the project is the **Win Sandbox**.

Random game results make it difficult to reliably test specific visual scenarios.

The sandbox solves that problem.

The developer can select symbols and trigger a deterministic spin.

The selected symbols are passed to the controller's debug method:

```ts
controller.spinDEBUG(symbols)
```

This path clears the current presentation, starts the reels, asks `SlotGame.spinWithSymbols()` for a deterministic result, stops the reels, and displays the wins directly. It bypasses the normal XState lifecycle so specific visual outcomes can be tested on demand.

This makes it possible to repeatedly test:

- Different winning symbols
- Multiple simultaneous wins
- Different numbers of ways
- Win highlighting
- Reel stopping
- UI behaviour

without depending on random chance.

---

# Responsive Layout

The game is designed to adapt to the available browser size.

The layout system separates scaling from positioning.

### SlotScaler

Calculates a scale based on the available screen width.

The current configuration defines:

```text
Minimum scale: 0.6
Maximum scale: 1.2
Reference width: 1400px
```

### SlotLayout

Centers the slot within the available screen.

The background uses a separate resize calculation so it always covers the complete application viewport.

This keeps browser-specific layout calculations outside the game and reel components.

---

# Application Composition

`GameApplication` acts as the composition root.

It is responsible for creating and connecting the major parts of the application:

```text
GameApplication
│
├── Pixi Application
├── AssetManager
├── SlotGame
├── BackgroundView
├── SlotMachineView
├── SpinButtonView
├── WaysWinView
├── ReelFrameView
├── SlotView
├── SlotLayout
├── SlotScaler
├── GameEventBus
├── SpinInput
├── SlotController
├── XState actor
└── SandboxView
```
The application entry point therefore remains intentionally small.

---

# Testing

The project includes Vitest tests around the core behaviour.

Current tests cover areas including:

### Game result structure

- Correct number of reels
- Correct number of rows
- Valid symbols

### Ways calculation

- Multiple matching rows
- Number of ways
- Symbol payout
- Multiple simultaneous symbol wins
- Breaking a win when a reel no longer contains the symbol

### Forced results

The `spinWithSymbols()` behaviour is tested to ensure selected symbols are placed consistently across the reels.

### Input events

`SpinInput` is tested to verify that a button's `spin` event becomes:

```ts
{
  type: 'SPIN_REQUESTED'
}
```

on the application event bus.

The testing strategy focuses first on deterministic domain behaviour, where correctness is more important than visual testing.

---

# Technical Decisions

## Why XState?

The spin lifecycle has explicit states and transitions.

Using a state machine prevents invalid transitions and makes the lifecycle easier to reason about.

It also provides a foundation for adding future states such as:

```text
bonus
free-spins
autoplay
anticipation
feature
```

without turning the controller into a collection of flags.

---

## Why RxJS?

RxJS is used at the input/event boundary.

The event bus keeps the button independent from the controller.

This means a future input source can emit the same event:

```ts
{
  type: 'SPIN_REQUESTED'
}
```

without the controller needing to know where the request originated.

---

# Trade-offs and Limitations

This project intentionally focuses on the frontend/game-client side of a slot game.

It is not intended to represent a complete production casino platform.


### Simplified mathematics

The ways calculation is intentionally simplified.

A production game could have considerably more complex rules involving:

- Paytable configuration
- Wilds
- Scatters
- Multipliers
- Feature triggers
- Different minimum/maximum ways
- Bonus game logic

### No backend

There is currently no:

- Authentication
- Wallet
- Balance
- Betting API
- Game server
- Session management

Those concerns are outside the scope of this exercise.

---

# Possible Improvements

If this project were continued towards a more production-oriented implementation, I would consider the following.

## Game architecture

- Server-driven game results
- Separate game-result DTOs
- Network/API layer
- Dependency injection
- More explicit domain interfaces
- Feature-specific state machines

---