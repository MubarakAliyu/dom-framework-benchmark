import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Priority = 'Low' | 'Medium' | 'High';
interface Task { id: number; name: string; priority: Priority; }
interface Result { label: string; ms: number; time: string; }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <main class="page">
    <header><p class="eyebrow">DOM PERFORMANCE LAB · ANGULAR</p><h1>Task Tracker</h1><p class="subtitle">Add, edit, prioritize, and delete tasks. Run the same DOM workload used in the other framework apps.</p></header>
    <section class="panel"><h2>Add a task</h2><form class="add-form" (ngSubmit)="addTask()"><label>Task name<input name="newName" [(ngModel)]="newName" placeholder="e.g. Review assignment" /></label><label>Priority<select name="newPriority" [(ngModel)]="newPriority"><option *ngFor="let priority of priorities" [value]="priority">{{ priority }}</option></select></label><button type="submit">Add task</button></form></section>
    <section class="panel"><div class="section-heading"><h2>Tasks <span class="count">{{ tasks.length }}</span></h2><button class="secondary" type="button" (click)="tasks = []">Clear all</button></div><p *ngIf="tasks.length === 0" class="empty">No tasks yet. Add one above or run the benchmark suite.</p><ul *ngIf="tasks.length > 0" class="task-list"><li *ngFor="let task of tasks; trackBy: trackTask" class="task-row"><ng-container *ngIf="editingId === task.id; else taskView"><div class="edit-fields"><input aria-label="Edit task name" name="editName" [(ngModel)]="editName"/><select aria-label="Edit priority" name="editPriority" [(ngModel)]="editPriority"><option *ngFor="let priority of priorities" [value]="priority">{{ priority }}</option></select><button type="button" (click)="saveEdit(task.id)">Save</button><button type="button" class="secondary" (click)="editingId = null">Cancel</button></div></ng-container><ng-template #taskView><div class="task-text"><span>{{ task.name }}</span><span class="priority" [ngClass]="task.priority.toLowerCase()">{{ task.priority }}</span></div><div class="task-actions"><button type="button" class="secondary" (click)="startEdit(task)">Edit</button><button type="button" class="danger" (click)="deleteTask(task.id)">Delete</button></div></ng-template></li></ul></section>
    <section class="panel benchmark"><div class="section-heading"><div><p class="eyebrow">REPEATABLE WORKLOAD</p><h2>DOM benchmark</h2></div><button type="button" [disabled]="busy" (click)="runSuite()">{{ busy ? 'Running…' : 'Run benchmark suite' }}</button></div><p class="muted">Renders 100, 500, and 1,000 tasks from empty; updates 50 tasks; then deletes 50 tasks from the 1,000-task list.</p><p *ngIf="message" class="status" role="status">{{ message }}</p><div *ngIf="results.length > 0" class="table-wrap"><table><thead><tr><th>Operation</th><th>Time (ms)</th><th>Recorded</th></tr></thead><tbody><tr *ngFor="let item of results; let i = index; trackBy: trackResult"><td>{{ item.label }}</td><td>{{ item.ms.toFixed(3) }}</td><td>{{ item.time }}</td></tr></tbody></table></div><div *ngIf="results.length > 0" class="result-actions"><button type="button" class="secondary" (click)="downloadCsv()">Download CSV</button><button type="button" class="secondary" (click)="results = []">Clear results</button></div><p *ngIf="results.length === 0" class="empty">No measurements yet.</p></section>
    <footer>Browser timings are approximate. Run at least five suites in the same environment and compare medians.</footer>
  </main>`,
})
export class AppComponent {
  readonly priorities: Priority[] = ['Low', 'Medium', 'High'];
  tasks: Task[] = []; newName = ''; newPriority: Priority = 'Medium';
  editingId: number | null = null; editName = ''; editPriority: Priority = 'Medium';
  results: Result[] = []; message = ''; busy = false;

  addTask(): void { const name = this.newName.trim(); if (!name) return; this.tasks = [...this.tasks, { id: Date.now() + Math.random(), name, priority: this.newPriority }]; this.newName = ''; }
  startEdit(task: Task): void { this.editingId = task.id; this.editName = task.name; this.editPriority = task.priority; }
  saveEdit(id: number): void { const name = this.editName.trim(); if (!name) return; this.tasks = this.tasks.map((task) => task.id === id ? { ...task, name, priority: this.editPriority } : task); this.editingId = null; }
  deleteTask(id: number): void { this.tasks = this.tasks.filter((task) => task.id !== id); }
  trackTask(_index: number, task: Task): number { return task.id; }
  trackResult(index: number, item: Result): string { return `${item.label}-${index}`; }
  private nextFrame(): Promise<void> { return new Promise((resolve) => requestAnimationFrame(() => resolve())); }
  private async settle(): Promise<void> { await this.nextFrame(); }
  private record(label: string, start: number): void { const ms = Number((performance.now() - start).toFixed(3)); this.results = [...this.results, { label, ms, time: new Date().toLocaleTimeString() }]; }
  private makeTasks(count: number): Task[] { return Array.from({ length: count }, (_, index) => ({ id: index + 1, name: `Task ${index + 1}`, priority: this.priorities[index % this.priorities.length] })); }
  private async timedRender(count: number): Promise<void> { this.tasks = []; await this.settle(); const start = performance.now(); this.tasks = this.makeTasks(count); await this.settle(); this.record(`Initial render — ${count} tasks`, start); }
  async runSuite(): Promise<void> {
    if (this.busy) return; this.busy = true; this.message = 'Running benchmark suite…';
    try {
      for (const count of [100, 500, 1000]) await this.timedRender(count);
      const startUpdate = performance.now(); this.tasks = this.tasks.map((task, index) => index < 50 ? { ...task, name: `${task.name} *`, priority: this.priorities[(this.priorities.indexOf(task.priority) + 1) % this.priorities.length] } : task); await this.settle(); this.record('Update 50 tasks (from 1,000)', startUpdate);
      const startDelete = performance.now(); this.tasks = this.tasks.filter((_task, index) => index >= 50); await this.settle(); this.record('Delete 50 tasks (from 1,000)', startDelete);
      this.message = 'Suite finished. Repeat at least five times and use the median.';
    } catch (error) { this.message = `Benchmark failed: ${String(error)}`; }
    finally { this.busy = false; }
  }
  downloadCsv(): void { const rows: unknown[][] = [['operation', 'milliseconds', 'recorded_at'], ...this.results.map((item) => [item.label, item.ms, item.time])]; const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); const link = document.createElement('a'); link.href = url; link.download = 'angular-benchmark-results.csv'; link.click(); URL.revokeObjectURL(url); }
}
