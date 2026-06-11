# Angular Pipes — Deep Dive

A hands-on project exploring Angular Pipes: built-in pipes, custom pipes, pipe arguments, and pipe caching behaviour.

---

## Topics Covered

### 1. Built-in Pipes

Angular ships a set of ready-to-use pipes from `@angular/common`. This project uses:

| Pipe | Usage in template | What it does |
|------|-------------------|--------------|
| `DatePipe` | `{{ currentDate \| date:'medium' }}` | Formats a `Date` object into a human-readable string using the `'medium'` locale format |
| `DecimalPipe` | `{{ value \| number:'1.1-2' }}` | Formats a number with a minimum of 1 integer digit, minimum 1 and maximum 2 decimal places |

**Key point:** Standalone pipes must be explicitly imported into the component's `imports` array — they are not globally available.

```ts
@Component({
  standalone: true,
  imports: [DatePipe, DecimalPipe],
})
export class AppComponent { ... }
```

---

### 2. Creating Custom Pipes

A custom pipe is a class decorated with `@Pipe` that implements the `PipeTransform` interface.

**`temperature-pipe.pipe.ts`** — converts between Celsius and Fahrenheit:

```ts
@Pipe({
  name: 'temp',
  standalone: true,
})
export class TemperaturePipe implements PipeTransform {
  transform(value: string | number | null, inputType: 'cel' | 'fah', outputType?: 'cel' | 'fah'): string | null {
    // conversion logic
  }
}
```

- The `name` in `@Pipe` is what you use in the template (`| temp`)
- `standalone: true` means it can be imported directly without an NgModule
- The class must implement `PipeTransform` and define a `transform()` method

---

### 3. Accepting Arguments in Pipes

Pipes can accept one or more arguments after a colon (`:`) in the template.

**Template syntax:**
```html
{{ currentTemperaturs.newYork | temp:'fah':'cel' }}
{{ currentTemperaturs.paris  | temp:'cel':'fah' }}
```

**Pipe signature:**
```ts
transform(value: string | number | null, inputType: 'cel' | 'fah', outputType?: 'cel' | 'fah'): string | null
```

- First argument after `|` is the pipe name
- Each `:` adds another argument, mapped to subsequent parameters in `transform()`
- Optional parameters (`?`) allow flexible usage — if `outputType` is omitted, the value is just formatted without conversion

**Conversion formulas implemented:**
- Celsius → Fahrenheit: `(val * 9/5) + 32`
- Fahrenheit → Celsius: `(val - 32) * (5/9)`

---

### 4. Pipe Default Caching (Pure Pipes)

Angular pipes are **pure by default** — `transform()` is only re-executed when the input value or arguments change. If the input reference is the same, Angular returns the cached result, skipping re-computation.

**`sort.pipe.ts`** — sorts an array of strings or numbers:

```ts
@Pipe({
  name: 'sort',
  standalone: true,
})
export class SortPipe implements PipeTransform {
  transform(value: string[] | number[], direction: 'asc' | 'desc' = 'asc') {
    let output = [...value];  // creates a new array — does not mutate the original
    output.sort((a, b) => direction === 'asc' ? (a > b ? 1 : -1) : (a > b ? -1 : 1));
    return output;
  }
}
```

**Template usage:**
```html
@for (temperature of historicTemperatures | sort:'desc'; track temperature) {
  <li (click)="onReset($index)">{{ temperature }}</li>
}
```

**Why the immutable copy matters:**
- Mutating the original array in-place (`value.sort(...)`) would not change the array reference
- Angular's pure pipe would see the same reference → skip re-running `transform()`
- Spreading into a new array (`[...value]`) ensures a fresh reference is returned and the template updates correctly

**The `onReset` pattern demonstrates the caching behaviour:**
```ts
onReset(index: number) {
  // Replacing the array triggers the pipe to re-run because the reference changes
  this.historicTemperatures = this.historicTemperatures.map(
    (val, i) => i === index ? 18 : val
  );
}
```

Clicking a temperature replaces the entire array (new reference) → Angular re-evaluates the `sort` pipe and the list re-renders sorted.

---

## Project Structure

```
src/
└── app/
    ├── app.component.ts          # Root component — data + imports
    ├── app.component.html        # Template — demonstrates all pipe usages
    ├── temperature-pipe.pipe.ts  # Custom pipe: Celsius ↔ Fahrenheit conversion
    └── sort.pipe.ts              # Custom pipe: ascending / descending sort
```

---

## Key Concepts Summary

| Concept | What to remember |
|---------|-----------------|
| Built-in pipes | Import from `@angular/common`; must be listed in `imports[]` for standalone components |
| Custom pipes | Decorate with `@Pipe`, implement `PipeTransform`, define `transform()` |
| Pipe arguments | Pass with `:` in the template; map to parameters after `value` in `transform()` |
| Pure pipes (default) | `transform()` only runs when input reference or arguments change — Angular caches the result |
| Impure pipes | Set `pure: false` in `@Pipe` to run on every change detection cycle (use sparingly — expensive) |
| Immutability | Always return a new object/array from `transform()` to ensure Angular detects the change |
