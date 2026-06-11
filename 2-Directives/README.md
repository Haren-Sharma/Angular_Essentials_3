# Angular Directives — Deep Dive

This project explores Angular **attribute directives** and **structural directives** by building two real custom directives from scratch.

---

## Project Structure

```
src/app/
├── app.component.ts / .html          # Root — wires everything together
├── safe-link.directive.ts            # Attribute directive
├── auth/
│   ├── auth.directive.ts             # Structural directive
│   ├── auth.service.ts               # Signal-based auth state
│   ├── auth.component.ts / .html     # Login form
│   └── auth.model.ts                 # Permission type
└── learning-resources/
    └── learning-resources.component  # Uses SafeLinkDirective
```

---

## Concepts Covered

### 1. Attribute Directive — `SafeLinkDirective`

**File:** `src/app/safe-link.directive.ts`

An **attribute directive** augments an existing element without changing the DOM structure. It only modifies the host element's behavior or appearance.

```ts
@Directive({
  selector: '[appSafeLink]',
  standalone: true,
  host: {
    '(click)': 'navigate($event)'   // bind to host element's click event
  }
})
export class SafeLinkDirective {
  @Input({ alias: 'appSafeLink' }) inputVar!: string;

  constructor(private hostElementRef: ElementRef<HTMLAnchorElement>) {}

  navigate(event: MouseEvent) {
    const isNavigate = window.confirm('Do you want to navigate?');
    if (isNavigate) {
      let address = this.hostElementRef.nativeElement.href;
      this.hostElementRef.nativeElement.href = address + '?from=' + this.inputVar;
      return;
    }
    event.preventDefault();
  }
}
```

**Key concepts:**

| Concept | Detail |
|---|---|
| `@Directive` | Marks the class as an attribute directive (no own template) |
| `selector: '[appSafeLink]'` | Square-bracket selector — activates on any element with this attribute |
| `host: { '(click)': 'navigate($event)' }` | Declarative way to bind to the host element's DOM events |
| `ElementRef<T>` | Gives a typed reference to the actual DOM element the directive is attached to |
| `@Input({ alias })` | The attribute value (`appSafeLink="my-app"`) is read as the input; alias maps the attribute name to the class property |

**Usage:**
```html
<!-- 'my-app-docs' is passed as inputVar; confirms navigation and appends ?from=my-app-docs -->
<a href="https://angular.dev" appSafeLink="my-app-docs">Angular Documentation</a>

<!-- No directive — navigates directly with no confirmation -->
<a href="https://www.google.com/search?q=angular">Google</a>
```

---

### 2. Structural Directive — `AuthDirective`

**File:** `src/app/auth/auth.directive.ts`

A **structural directive** conditionally adds or removes DOM elements — it changes the DOM structure, just like built-in `*ngIf` and `*ngFor`.

```ts
@Directive({
  selector: '[appAuth]',
  standalone: true,
})
export class AuthDirective {
  userType = input.required<Permission>({ alias: 'appAuth' });

  private authService      = inject(AuthService);
  private templateRef      = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      if (this.authService.activePermission() === this.userType()) {
        this.viewContainerRef.createEmbeddedView(this.templateRef); // add to DOM
      } else {
        this.viewContainerRef.clear();                              // remove from DOM
      }
    });
  }
}
```

**Key concepts:**

| Concept | Detail |
|---|---|
| `TemplateRef` | A blueprint/reference to the `<ng-template>` content — not rendered by default |
| `ViewContainerRef` | The DOM slot at the directive's position; used to stamp or clear the template |
| `createEmbeddedView(templateRef)` | Renders the template into the DOM at the directive's position |
| `viewContainerRef.clear()` | Removes all previously rendered content |
| `effect()` | Re-runs whenever any reactive signal it reads (permission, userType) changes |
| `input.required()` with alias | Reads the `appAuth="admin"` attribute as a required signal input |

#### How `<ng-template>` works

`<ng-template>` is **never rendered by itself**. Angular holds it as an inert blueprint (`TemplateRef`) in memory. A structural directive receives that blueprint plus a `ViewContainerRef` slot, and decides when to stamp it into the DOM.

```html
<!-- Long form — explicit ng-template -->
<ng-template appAuth="admin">
  <p>Only Admins Can See This</p>
</ng-template>

<!-- Short form — * sugar (Angular desugars this to the ng-template form automatically) -->
<p *appAuth="'admin'">Only Admins Can See This</p>
```

> The `*` prefix is syntactic sugar. Angular automatically wraps the host element in an `<ng-template>` and moves the attribute onto it, so both forms are equivalent.

---

### 3. Signal-Based Auth State

**File:** `src/app/auth/auth.service.ts`

```ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  activePermission = signal<Permission>('guest');   // 'admin' | 'user' | 'guest'

  authenticate(email: string, password: string) {
    if (email === 'admin@example.com' && password === 'admin')
      this.activePermission.set('admin');
    else if (email === 'user@example.com' && password === 'user')
      this.activePermission.set('user');
    else
      this.activePermission.set('guest');
  }

  logout() { this.activePermission.set('guest'); }
}
```

The `AuthDirective` uses `effect()` to reactively respond to signal changes — no `ngOnChanges` or manual subscriptions needed.

---

### 4. `computed()` in the Root Component

```ts
export class AppComponent {
  private authService = inject(AuthService);
  isAdmin = computed(() => this.authService.activePermission() === 'admin');
}
```

`computed()` derives a read-only signal from other signals. It re-evaluates automatically whenever `activePermission` changes — same reactive pattern used across the app.

---

## Attribute vs Structural Directive — Quick Comparison

| | Attribute Directive | Structural Directive |
|---|---|---|
| DOM effect | Modifies the host element (style, behavior) | Adds or removes elements |
| Selector | `[appFoo]` on any element | `[appFoo]` on `<ng-template>` (or `*appFoo` sugar) |
| Key injections | `ElementRef`, `Renderer2` | `TemplateRef`, `ViewContainerRef` |
| Built-in examples | `NgClass`, `NgStyle` | `*ngIf`, `*ngFor`, `*ngSwitch` |
| Example in this project | `SafeLinkDirective` | `AuthDirective` |

---

## Steps to Build a Structural Directive

1. Decorate with `@Directive` and an attribute selector: `'[appMyDir]'`
2. Inject `TemplateRef` — reference to the content blueprint
3. Inject `ViewContainerRef` — the DOM slot where content will live
4. Use `createEmbeddedView(templateRef)` to render and `clear()` to remove
5. Drive the show/hide logic with `effect()` (for signals) or `ngOnChanges` / `ngOnInit`

---

## Commit History

| Commit | What was added |
|---|---|
| `64d0bbd` | Project scaffold — `AuthService`, `AuthComponent`, `LearningResourcesComponent`, basic structure |
| `e8cc1f8` | `SafeLinkDirective` — first custom attribute directive with `ElementRef`, `@Input` alias, host event binding |
| `9f36efe` | `AuthDirective` — structural directive using `TemplateRef`, `ViewContainerRef`, `effect()`, and `*appAuth` sugar |
