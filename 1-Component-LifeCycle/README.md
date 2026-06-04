# Angular Component Lifecycle — Deep Dive Notes

A learning project demonstrating every Angular lifecycle hook through a togglable child component that receives an `@Input()`.

---

## Project Structure

```
app.component          ← parent: controls visibility + input text
  └── lifecycle.component  ← child: implements all 8 lifecycle hooks
```

**Parent controls:**
- A toggle button mounts/unmounts `<app-lifecycle>` using `@if`
- A second button changes the `[text]` input with a new random number

This setup lets you observe every hook in the browser console.

---

## What is the Component Lifecycle?

When Angular creates, updates, and destroys a component, it runs a predictable sequence of **lifecycle hooks** — methods you can implement to run code at specific moments.

Angular manages this via its **change detection** system. Every time an event fires, Angular checks if the UI needs to be updated and runs the relevant hooks.

---

## The 8 Lifecycle Hooks (in execution order)

### 1. `constructor()`
- Called by JavaScript when the class is instantiated — **not an Angular hook**, but part of the lifecycle.
- Angular has **not yet set `@Input()` values** at this point.
- Use only for **dependency injection** (injecting services).
- **Do not** access `@Input()` properties or do DOM work here.

```ts
constructor() {
  console.log(this.text); // undefined — @Input not set yet
}
```

---

### 2. `ngOnChanges(changes: SimpleChanges)`
- **First hook Angular calls.**
- Fires **before `ngOnInit`** with the initial input values, then again **every time an `@Input()` value changes**.
- Only called if the component has at least one `@Input()`.
- `SimpleChanges` is an object where each key is an input property name, and the value contains `previousValue`, `currentValue`, and `firstChange`.

```ts
ngOnChanges(changes: SimpleChanges) {
  console.log(changes);
  // { text: { previousValue: undefined, currentValue: 'Some Random Number: 42', firstChange: true } }
}
```

**When to use:** React to input changes — e.g., recalculate derived state when a parent passes new data.

---

### 3. `ngOnInit()`
- Called **once** after the first `ngOnChanges` (or directly after constructor if there are no inputs).
- `@Input()` values are available here.
- The component's template is **not yet rendered** at this point.

```ts
ngOnInit() {
  // Safe to access this.text here
  // Good place to fetch data, initialize state, subscribe to observables
}
```

**When to use:** Main initialization logic — HTTP calls, setting up subscriptions, initializing data.

---

### 4. `ngDoCheck()`
- Called on **every change detection run**, not just when this component's inputs change.
- Runs after `ngOnChanges` / `ngOnInit` on the first run, then after every subsequent change detection cycle **across the entire app**.
- Very performance-sensitive — runs frequently.

```ts
ngDoCheck() {
  // fires even if the user clicks a button in a completely different component
}
```

**When to use:** Rarely. Only when you need to detect changes Angular's default change detection misses (e.g., mutations inside objects/arrays). Prefer `OnPush` change detection strategy instead.

---

### 5. `ngAfterContentInit()`
- Called **once** after Angular projects external content into the component via `<ng-content>`.
- "Content" = DOM passed in from the **parent's template** (content projection).

```html
<!-- parent template -->
<app-lifecycle>
  <p>This is projected content</p>  ← this is "content"
</app-lifecycle>
```

```ts
ngAfterContentInit() {
  // projected content is now initialized and accessible via @ContentChild
}
```

**When to use:** When you need to interact with projected content after it's been initialized.

---

### 6. `ngAfterContentChecked()`
- Called after every change detection run that checks the projected content.
- Runs after `ngAfterContentInit` on the first cycle, then after every `ngDoCheck`.

**When to use:** Rarely. When you need to respond to changes in projected content after each check.

---

### 7. `ngAfterViewInit()`
- Called **once** after Angular has fully initialized the component's **own template** (its View).
- "View" = the component's own template + the views of its child components.
- Safe to access `@ViewChild` references here.

```ts
ngAfterViewInit() {
  // component's DOM is fully rendered
  // safe to use @ViewChild / @ViewChildren here
}
```

**When to use:** DOM manipulation, integrating third-party libraries that need a real DOM node, reading element dimensions.

---

### 8. `ngAfterViewChecked()`
- Called after every change detection run that checks the component's view.
- Runs after `ngAfterViewInit` on the first cycle, then after every `ngDoCheck`.
- Be careful — triggering change detection here can cause infinite loops.

**When to use:** Rarely. When you need to react after every view check cycle.

---

### 9. `ngOnDestroy()`
- Called **once** just before Angular destroys the component.
- In this project: fires when the toggle button hides the component (`@if` removes it from the DOM).

```ts
ngOnDestroy() {
  // clean up subscriptions, intervals, event listeners
  this.subscription.unsubscribe();
  clearInterval(this.intervalId);
}
```

**When to use:** Always clean up here to prevent **memory leaks** — unsubscribe from Observables, clear timers, detach event listeners.

---

## Complete Execution Order

### On component creation (first render):
```
constructor()
  → ngOnChanges()       (only if @Input exists)
  → ngOnInit()
  → ngDoCheck()
  → ngAfterContentInit()
  → ngAfterContentChecked()
  → ngAfterViewInit()
  → ngAfterViewChecked()
```

### On input change (parent changes [text]):
```
ngOnChanges()
  → ngDoCheck()
  → ngAfterContentChecked()
  → ngAfterViewChecked()
```

### On any change detection cycle (no input change):
```
ngDoCheck()
  → ngAfterContentChecked()
  → ngAfterViewChecked()
```

### On component destruction (toggled off via @if):
```
ngOnDestroy()
```

---

## Key Concepts

### `@Input()` and `ngOnChanges`
`ngOnChanges` only fires when the **reference** changes for objects/arrays, not when their internal properties mutate. This is because Angular uses `===` comparison.

```ts
// triggers ngOnChanges ✅
this.user = { ...this.user, name: 'New Name' };

// does NOT trigger ngOnChanges ❌
this.user.name = 'New Name';
```

### Content Projection vs View
| Term | What it means |
|---|---|
| **View** | The component's own template (`lifecycle.component.html`) |
| **Content** | HTML passed in by the parent between the component's tags via `<ng-content>` |

### `@if` vs `[hidden]` / `display: none`
- `@if (condition)` — **destroys and recreates** the component. All lifecycle hooks fire including `ngOnDestroy` and `constructor`.
- `[hidden]="condition"` — **hides** the component but keeps it alive. No destroy/recreate cycle.

---

## Common Interview Questions

**Q: What is the difference between `constructor` and `ngOnInit`?**
> `constructor` is a TypeScript/JavaScript class feature used for dependency injection. `@Input()` values are not available there. `ngOnInit` is an Angular hook called after inputs are set — use it for initialization logic.

**Q: When does `ngOnChanges` fire?**
> It fires before `ngOnInit` with the initial input values, and then again every time a bound `@Input()` value changes. It does not fire if there are no `@Input()` bindings.

**Q: What is the difference between `ngOnInit` and `ngDoCheck`?**
> `ngOnInit` runs once after component initialization. `ngDoCheck` runs on every change detection cycle across the entire application — it is much more frequent and expensive.

**Q: Why should you clean up in `ngOnDestroy`?**
> Angular does not automatically unsubscribe from Observables, clear intervals, or remove event listeners when a component is destroyed. Failing to clean up causes memory leaks because those callbacks still hold references to the destroyed component.

**Q: What is `SimpleChanges`?**
> It is an object passed to `ngOnChanges`. Each key corresponds to an `@Input()` property name, and each value is a `SimpleChange` object with `previousValue`, `currentValue`, and `firstChange` (boolean, true on the first call).

**Q: What is the difference between `ngAfterContentInit` and `ngAfterViewInit`?**
> `ngAfterContentInit` fires after projected content (`<ng-content>`) is initialized. `ngAfterViewInit` fires after the component's own template and all child component views are initialized.

**Q: Can you use `@ViewChild` in `ngOnInit`?**
> No. `@ViewChild` references are only available after `ngAfterViewInit`. Using them in `ngOnInit` will give `undefined`.

**Q: What happens to lifecycle hooks when using `@if` vs `[hidden]`?**
> With `@if`, the component is destroyed (`ngOnDestroy`) and recreated (full lifecycle from `constructor`) each time the condition toggles. With `[hidden]`, the component stays alive — no destroy or recreate occurs.

**Q: Why should you avoid heavy logic in `ngDoCheck`?**
> It runs on every single change detection cycle in the app — even for events in unrelated components. Heavy logic here will severely degrade performance.

**Q: What is the order of lifecycle hooks?**
> `constructor` → `ngOnChanges` → `ngOnInit` → `ngDoCheck` → `ngAfterContentInit` → `ngAfterContentChecked` → `ngAfterViewInit` → `ngAfterViewChecked` → (repeat ngDoCheck group on updates) → `ngOnDestroy`
