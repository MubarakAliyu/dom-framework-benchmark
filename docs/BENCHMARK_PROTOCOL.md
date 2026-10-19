# Benchmark Protocol

## Purpose
Compare React, Angular, Vue, and Svelte on three DOM workload categories with consistent task data and operation definitions.

## Environment to record
- Computer / CPU / RAM:
- Operating system:
- Browser and version:
- Node.js version:
- Framework versions (record from each `package.json`):
- Build mode: development or production (state clearly):
- Date and time:

## Procedure

1. Use the same machine and browser version for every framework. Keep the browser window size and power mode consistent. Close unrelated tabs and avoid running other heavy jobs.
2. Install dependencies once per application. Start only one application at a time.
3. Wait until the app is loaded and idle, then click **Run benchmark suite**.
4. The suite clears the task list before each initial render test, populates it with 100, 500, and 1,000 deterministic tasks, then updates 50 tasks and deletes 50 tasks from the 1,000-task list.
5. Run at least five suites for each framework. Save/export the results; calculate the median for each operation. Record individual runs or link a CSV in your repository if possible.
6. Repeat suspicious measurements and note unusually noisy runs rather than silently discarding them.
7. Use Chrome DevTools Performance to record a run for additional context. The in-page metric is a simple comparable end-to-next-animation-frame timing, not a pure DOM mutation duration. It may include event-loop scheduling and browser-frame delay.
8. If measuring memory, use Chrome DevTools Memory or Performance tools consistently for each framework and record whether the reading is heap size, memory after GC, or another specific measure. Do not compare unlike memory metrics.

## Definitions

- **Render N:** start with an empty list, create N task records, and measure time from requesting the render until the next animation frame after the framework has applied the update.
- **Update 50:** after rendering 1,000 tasks, update the label and priority of the first 50 existing tasks.
- **Delete 50:** after updating, remove the first 50 tasks from the 1,000-task list.
- **Median:** sort the five or more results and take the middle value (for an even number of runs, average the two middle values).

## Fair-comparison cautions

- Do not compare a production build of one framework with development builds of the others.
- Keep task labels, initial task count, update count, priority toggling, browser, and machine consistent.
- The browser and operating system affect scheduling; reported values apply to the tested environment, not every environment.
- A winner on these small list operations is not necessarily the winner for every application or workload.
