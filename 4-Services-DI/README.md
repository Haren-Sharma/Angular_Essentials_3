# Services & Dependency Injection

A task management app that demonstrates Angular's Services and Dependency Injection (DI) system. The app lets users add tasks, update their status (Open / In Progress / Done), and filter the list by status.

---

## Component Tree

```
AppComponent
  └── TasksComponent
        ├── NewTaskComponent      (form to add tasks)
        └── TasksListComponent    (filter bar + task list)
              └── TaskItemComponent (single task card with status selector)
```

---

## Topics Covered

### 1. The Problem Services Solve

**Commit: `Services : Init`**

Before services, components held their own state and had no way to share it. `TasksListComponent` had an empty `tasks = []` array and `NewTaskComponent`'s `onAddTask()` did nothing — there was no channel to pass a new task from the form up to the list.

The classic fix (passing data via `@Input`/`@Output` through parent components) becomes painful as the tree grows. Services solve this by lifting shared state out of any single component.

---

### 2. Creating a Service with `@Injectable`

**Commit: `Services : Added A Task Service`**

`TasksService` was introduced with `@Injectable({ providedIn: 'root' })`, making Angular register it as a **singleton** in the root injector automatically — no manual registration needed.

```ts
// tasks.service.ts
@Injectable({ providedIn: 'root' })
export class TasksService {
  private tasks = signal<Task[]>([]);
  allTasks = this.tasks.asReadonly();   // read-only view for consumers

  addTask(title: string, description: string) {
    const newTask: Task = { id: Math.random().toString(), title, description, status: 'OPEN' };
    this.tasks.update((old) => [...old, newTask]);
  }
}
```

Key ideas:
- State lives in a **`signal`** inside the service, not in a component.
- `allTasks` is exposed as a **readonly signal** so consumers can read but not mutate directly.
- Components inject the service via `inject(TasksService)` (or constructor injection) — Angular supplies the same singleton instance to every component that asks for it.

---

### 3. Injecting Services — Two Syntaxes

**Commit: `Services : Added A Task Service` → `Services : Filtering the tasks`**

**`inject()` function (modern, preferred):**
```ts
// tasks-list.component.ts
private taskService = inject(TasksService);
```

**Constructor injection (traditional):**
```ts
// new-task.component.ts
constructor(private tasksService: TasksService) {}
```

Both achieve the same result. `inject()` is the modern Angular 14+ approach and works outside constructors (e.g., in field initialisers).

---

### 4. Reactive Filtered List with `computed()`

**Commit: `Services : Filtering the tasks`**

`TasksListComponent` derives a filtered view of the task list reactively — no manual refresh needed.

```ts
private selectedFilter = signal<string>('all');
private taskService = inject(TasksService);

tasks = computed(() => {
  const filter = this.selectedFilter().toUpperCase();
  if (filter === 'ALL') return this.taskService.allTasks();
  return this.taskService.allTasks().filter((t) => t.status === filter);
});
```

When the user clicks a filter button, `selectedFilter` updates, which invalidates `tasks` (a computed signal), causing the template to re-render automatically.

`TaskItemComponent` also wires status changes back to the service:

```ts
private tasksService = inject(TasksService);

onChangeTaskStatus(taskId: string, status: string) {
  // maps 'open'/'in-progress'/'done' → TaskStatus enum value
  this.tasksService.updateTaskStatus(taskId, newStatus);
}
```

The service's `updateTaskStatus` uses `signal.update()` with an immutable map to avoid mutating the existing array.

---

### 5. `InjectionToken` & Manual Provider Registration

**Commit: `Services : Injector token`**

Instead of relying on `providedIn: 'root'`, this commit demonstrates **manual provider registration** using `InjectionToken`.

**Step 1 — Create a token** (in `main.ts`):
```ts
export const taskServiceToken = new InjectionToken<TasksService>('task-service-token');
```

A token is just a unique key for the DI system. Using `InjectionToken` (instead of the class itself as the key) is useful when you want to swap implementations or provide the same interface under a different token.

**Step 2 — Register the provider** (in `bootstrapApplication`):
```ts
bootstrapApplication(AppComponent, {
  providers: [
    { provide: taskServiceToken, useClass: TasksService },
  ],
});
```

`useClass` tells Angular: *when something asks for `taskServiceToken`, instantiate `TasksService`*.

**Step 3 — Inject by token in components:**
```ts
// inject() syntax
private taskService = inject(taskServiceToken);

// constructor @Inject() syntax
constructor(@Inject(taskServiceToken) private tasksService: TasksService) {}
```

Because `@Injectable({ providedIn: 'root' })` was removed from the service, it is now **only** available where it is explicitly provided — giving you control over scope and lifetime.

---

## Key Concepts Summary

| Concept | Where used |
|---|---|
| `@Injectable({ providedIn: 'root' })` | Auto-registers service as a root singleton |
| `inject()` | Modern functional injection (field level) |
| Constructor `@Inject()` | Classic injection, required when using a custom token via constructor |
| `signal` + `asReadonly()` | Encapsulates mutable state; exposes a read-only view to consumers |
| `computed()` | Derived reactive state (filtered task list) |
| `InjectionToken` | Type-safe DI token for non-class values or manual provider control |
| `bootstrapApplication providers` | Root-level manual provider registration |
| `useClass` | Provider config: map a token to a concrete class |

---

## File Map

```
src/
├── main.ts                          # InjectionToken + bootstrapApplication providers
└── app/
    └── tasks/
        ├── task.model.ts            # Task interface + TaskStatus union type
        ├── tasks.service.ts         # Shared state: signal-based task list
        ├── tasks.component.ts       # Shell: composes NewTask + TasksList
        ├── new-task/
        │   └── new-task.component.ts  # Form; injects service to call addTask()
        └── tasks-list/
            ├── tasks-list.component.ts  # Filter state + computed filtered list
            └── task-item/
                └── task-item.component.ts  # Single task; calls updateTaskStatus()
```
