# DOM Benchmark: React vs Angular vs Vue vs Svelte

A four-framework benchmark project for the **DOM benchmark comparison of the front-end JavaScript frameworks React, Angular, Vue, and Svelte** checkpoint.

The project implements the same small to-do list in all four frameworks and provides an in-browser benchmark suite for:
- Rendering 100, 500, and 1,000 tasks from an empty list.
- Updating the first 50 tasks in a 1,000-task list.
- Deleting the first 50 tasks from a 1,000-task list.

Each task has a name and priority and can be added, viewed, edited, or deleted.

## Project structure

```text
dom-framework-benchmark/
├── react-app/                 # React + Vite
├── angular-app/               # Angular standalone app
├── vue-app/                   # Vue + Vite
├── svelte-app/                # Svelte + Vite
└── docs/
    ├── BENCHMARK_PROTOCOL.md  # Controlled run procedure
    ├── RESULTS_TEMPLATE.md    # Fill in measured results
    └── REFLECTION.md          # 200–300 word reflection draft
```

## Run each application

Use Node.js 20+ (Node.js 22 is recommended). Open a separate terminal for each app, then run:

### React
```bash
cd react-app
npm install
npm run dev
```

### Angular
```bash
cd angular-app
npm install
npm start
```

### Vue
```bash
cd vue-app
npm install
npm run dev
```

### Svelte
```bash
cd svelte-app
npm install
npm run dev
```

Open the local URL shown in the terminal. Run only one framework at a time for the fairest comparison, and keep the same browser, machine, power mode, and browser window size.

## Run the benchmark

1. Open the framework app and wait for it to finish loading.
2. Click **Run benchmark suite**.
3. The app records measurements for rendering 100, 500, and 1,000 tasks, then updating 50 and deleting 50 tasks from a 1,000-task list.
4. Repeat the suite at least five times per framework. Export/copy the results, and report the **median** for each operation.
5. Use `docs/BENCHMARK_PROTOCOL.md` and record actual results in `docs/RESULTS_TEMPLATE.md`.

The in-app timing is a comparative browser-side measurement from initiating the update until the next animation frame, not a laboratory-grade measure of isolated JavaScript execution or guaranteed physical paint completion. It includes framework scheduling and browser timing and can be affected by background activity. For stronger evidence, run Chrome DevTools Performance recordings as described in the protocol. Do not invent missing results.

## Important methodology notes

- All four apps use the same logical data size and operation definitions, keyed list rendering, and task text/priority patterns.
- Run each app in the same browser and machine; close unrelated tabs and wait for the browser to settle.
- Use production builds for formal comparisons if time permits, and state the build mode in your report. The commands above run development servers for convenient demonstration; development-mode timings should not be presented as production performance.
- The benchmark includes small differences in framework/runtime and rendering strategy by design. A single run is not enough to conclude that one framework is universally fastest.
- Memory usage is not automatically measured in a portable, reliable way by this app. If reporting memory, capture it in Chrome DevTools Memory/Performance tools and document the method.

## Framework-specific implementation details

- **React:** function components, `useState`, and stable task keys.
- **Angular:** standalone component, `*ngFor`, `*ngIf`, `[(ngModel)]`, and `trackBy`.
- **Vue:** reactive state, `v-for`, `v-if`, and keyed task rows.
- **Svelte:** compiler-managed updates, `{#each}` keyed blocks, and component state.

## Submission checklist

- [ ] Install dependencies and launch each app successfully.
- [ ] Verify add, edit, delete, and priority controls in all four apps.
- [ ] Run the benchmark suite at least five times per framework.
- [ ] Enter measured medians and environment details in `docs/RESULTS_TEMPLATE.md`.
- [ ] Customize the reflection with your actual observations.
- [ ] Upload the project to GitHub and submit the public repository URL.

## Author

Mubarak Aliyu
