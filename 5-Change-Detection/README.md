# Angular Change Detection — Deep Dive

A hands-on project exploring Angular's change detection system, progressing from default behavior through `OnPush`, manual triggering, `AsyncPipe`, and finally the new Zoneless mode.

---

## Project Structure

```
src/app/
├── app.component          # Root shell
├── counter/               # Counter with increment/decrement
│   └── info-message/      # Child of counter (no OnPush — used to observe CD propagation)
└── messages/
    ├── messages.component       # Parent wrapper
    ├── messages-list/           # Displays the message list
    ├── new-message/             # Input + submit form
    └── messages.service.ts      # Shared state (Signal + BehaviorSubject)
```

Each component has a `debugOutput` getter that logs to the console — this makes it easy to see exactly when Angular re-evaluates a binding (i.e., when change detection runs on that component).

---

## Concepts Covered (by commit)

### 1. Init — Default Change Detection

**Commit:** `4376a29`

Angular's default change detection strategy (`ChangeDetectionStrategy.Default`) runs on every browser event — clicks, timers, HTTP responses — across the **entire component tree**. Zone.js patches async APIs to notify Angular after every such event.

**Observable behavior:** Clicking the counter increment button causes the `debugOutput` getter in *every* component to be re-evaluated, even components that have nothing to do with the counter.

---

### 2. OnPush Strategy + Signals in Service

**Commit:** `00b2a17`

`ChangeDetectionStrategy.OnPush` tells Angular: *"Only check this component when its inputs change, an event originates inside it, or it's explicitly marked dirty."*

Applied to: `CounterComponent`, `MessagesComponent`, `MessagesListComponent`, `NewMessageComponent`.

**What changed:**
- `MessagesService` was introduced with state managed as a `signal<string[]>`.
- `NewMessageComponent` uses a `signal` for `enteredText` — the two-way binding via `ngModel` is replaced by a signal setter.
- Because signals notify Angular automatically, `OnPush` components still update correctly when signal values change.

**Key insight:** With `OnPush`, clicking the counter no longer causes `Messages*` components to re-evaluate their bindings, and vice versa. Change detection is now **scoped** to the subtree that actually changed.

---

### 3. OnPush Without Signals — The Problem

**Commit:** `7580dd7`

An intentional experiment: what happens when you use `OnPush` but update state via a plain mutable array instead of a signal or immutable update?

`MessagesService` was temporarily changed to hold a plain `string[]` and mutate it with `.push()`. The `MessagesListComponent` read from this array directly.

**Result:** The list never updated in the UI. With `OnPush`, Angular skips the component unless it detects a changed input reference or a signal notification. A mutated array is the same reference — Angular sees no change.

---

### 4. OnPush Without Signals — Manual Fix via `ChangeDetectorRef`

**Commit:** `ecd5a87`

To fix the previous problem **without** signals, `ChangeDetectorRef` was injected and `markForCheck()` was called manually inside an RxJS subscription.

```ts
// messages-list.component.ts (OnPush + manual CD)
ngOnInit(): void {
  const subscription = this.messagesService.messages$.subscribe((messages) => {
    this.messages = messages;
    this.cdRef.markForCheck(); // tells Angular: re-check this component on the next CD cycle
  });
  this.desRef.onDestroy(() => subscription.unsubscribe());
}
```

`DestroyRef` was used for cleanup instead of `ngOnDestroy`, keeping the component class leaner.

**Key insight:** `markForCheck()` schedules the component (and all its ancestors up to the root) to be checked in the **next** change detection cycle. It does not trigger CD immediately.

---

### 5. Async Pipe

**Commit:** `0336824`

The manual subscription + `markForCheck()` pattern works but is boilerplate. The `AsyncPipe` does the same automatically:

```html
<!-- messages-list.component.html -->
@for (message of messages$ | async; track message) {
  <li>{{ message }}</li>
}
```

```ts
// messages-list.component.ts
messages$ = this.messagesService.messages$;
```

`AsyncPipe` subscribes to the Observable, calls `markForCheck()` on every emission, and **automatically unsubscribes** when the component is destroyed — no `ngOnInit`, no `DestroyRef`, no manual cleanup.

**Key insight:** `AsyncPipe` is the idiomatic way to consume Observables in `OnPush` components.

---

### 6. Going Zoneless

**Commit:** `841a9b3`

Zone.js is the mechanism Angular has historically relied on to know *when* to run change detection. It patches browser APIs (setTimeout, fetch, event listeners, etc.) and triggers a CD cycle after each one. This adds overhead and can cause unexpected extra CD cycles.

Angular 18+ ships `provideExperimentalZonelessChangeDetection()` which removes Zone.js entirely.

**What changed:**

`main.ts` — Zone.js replaced with the zoneless provider:
```ts
bootstrapApplication(AppComponent, {
  providers: [provideExperimentalZonelessChangeDetection()]
});
```

`angular.json` — the `zone.js` polyfill entry removed from `polyfills`.

`MessagesService` — state kept as both a `signal` and a `BehaviorSubject` (the Observable drives `AsyncPipe`; the signal drives `OnPush` scheduling).

**Why it works:** In zoneless mode, Angular only runs change detection when:
- A **signal** it tracks changes
- `markForCheck()` / `detectChanges()` is called manually
- An `AsyncPipe` (which calls `markForCheck()` internally) receives a new value

Because the codebase already used signals and `AsyncPipe`, it worked without further changes.

**Key insight:** Zoneless Angular requires that all state changes that should trigger UI updates go through signals, Observables consumed by `AsyncPipe`, or explicit `ChangeDetectorRef` calls. Plain mutation silently breaks the UI.

---

## Summary Table

| Concept | Mechanism | CD Trigger |
|---|---|---|
| Default CD | Zone.js + `Default` strategy | Every async event, whole tree |
| `OnPush` + Signals | `signal()` + `OnPush` | Signal write notifies Angular |
| `OnPush` + plain mutation | Mutable array | Nothing — UI breaks |
| `OnPush` + `markForCheck()` | `ChangeDetectorRef` | Manual call after Observable emit |
| `AsyncPipe` | `AsyncPipe` + `OnPush` | Pipe calls `markForCheck()` automatically |
| Zoneless | `provideExperimentalZonelessChangeDetection()` | Signals / `AsyncPipe` / explicit calls only |
