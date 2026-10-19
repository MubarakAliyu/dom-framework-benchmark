import { useState } from 'react';

const priorities = ['Low', 'Medium', 'High'];
const makeTasks = (count, prefix = 'Task') => Array.from({ length: count }, (_, index) => ({
  id: index + 1,
  name: `${prefix} ${index + 1}`,
  priority: priorities[index % priorities.length],
}));
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
const afterFrame = async () => { await nextFrame(); };

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  function addTask(event) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setTasks((current) => [...current, { id: Date.now() + Math.random(), name, priority: newPriority }]);
    setNewName('');
  }
  function startEdit(task) { setEditingId(task.id); setEditName(task.name); setEditPriority(task.priority); }
  function saveEdit(id) {
    const name = editName.trim();
    if (!name) return;
    setTasks((current) => current.map((task) => task.id === id ? { ...task, name, priority: editPriority } : task));
    setEditingId(null);
  }
  function deleteTask(id) { setTasks((current) => current.filter((task) => task.id !== id)); }

  async function settle() { await afterFrame(); }
  function record(label, start) {
    const ms = Number((performance.now() - start).toFixed(3));
    setResults((current) => [...current, { label, ms, time: new Date().toLocaleTimeString() }]);
    return ms;
  }
  async function timedRender(count) {
    setTasks([]);
    await settle();
    const start = performance.now();
    setTasks(makeTasks(count));
    await settle();
    record(`Initial render — ${count} tasks`, start);
  }
  async function runSuite() {
    if (busy) return;
    setBusy(true); setMessage('Running benchmark suite…');
    try {
      for (const count of [100, 500, 1000]) await timedRender(count);
      const startUpdate = performance.now();
      setTasks((current) => current.map((task, index) => index < 50 ? {
        ...task, name: `${task.name} *`, priority: priorities[(priorities.indexOf(task.priority) + 1) % priorities.length],
      } : task));
      await settle();
      record('Update 50 tasks (from 1,000)', startUpdate);
      const startDelete = performance.now();
      setTasks((current) => current.filter((_, index) => index >= 50));
      await settle();
      record('Delete 50 tasks (from 1,000)', startDelete);
      setMessage('Suite finished. Repeat at least five times and use the median.');
    } catch (error) {
      setMessage(`Benchmark failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally { setBusy(false); }
  }
  function downloadCsv() {
    const rows = [['operation', 'milliseconds', 'recorded_at'], ...results.map((item) => [item.label, item.ms, item.time])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'react-benchmark-results.csv'; link.click(); URL.revokeObjectURL(url);
  }

  return <main className="page">
    <header><p className="eyebrow">DOM PERFORMANCE LAB · REACT</p><h1>Task Tracker</h1><p className="subtitle">Add, edit, prioritize, and delete tasks. Run the same DOM workload used in the other framework apps.</p></header>
    <section className="panel"><h2>Add a task</h2><form className="add-form" onSubmit={addTask}>
      <label>Task name<input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="e.g. Review assignment" /></label>
      <label>Priority<select value={newPriority} onChange={(event) => setNewPriority(event.target.value)}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
      <button type="submit">Add task</button>
    </form></section>
    <section className="panel"><div className="section-heading"><h2>Tasks <span className="count">{tasks.length}</span></h2><button className="secondary" onClick={() => setTasks([])}>Clear all</button></div>
      {tasks.length === 0 ? <p className="empty">No tasks yet. Add one above or run the benchmark suite.</p> : <ul className="task-list">{tasks.map((task) => <li key={task.id} className="task-row">
        {editingId === task.id ? <div className="edit-fields"><input aria-label="Edit task name" value={editName} onChange={(event) => setEditName(event.target.value)} /><select aria-label="Edit priority" value={editPriority} onChange={(event) => setEditPriority(event.target.value)}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select><button onClick={() => saveEdit(task.id)}>Save</button><button className="secondary" onClick={() => setEditingId(null)}>Cancel</button></div> : <><div className="task-text"><span>{task.name}</span><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span></div><div className="task-actions"><button className="secondary" onClick={() => startEdit(task)}>Edit</button><button className="danger" onClick={() => deleteTask(task.id)}>Delete</button></div></>}
      </li>)}</ul>}
    </section>
    <section className="panel benchmark"><div className="section-heading"><div><p className="eyebrow">REPEATABLE WORKLOAD</p><h2>DOM benchmark</h2></div><button onClick={runSuite} disabled={busy}>{busy ? 'Running…' : 'Run benchmark suite'}</button></div>
      <p className="muted">Renders 100, 500, and 1,000 tasks from empty; updates 50 tasks; then deletes 50 tasks from the 1,000-task list.</p>
      {message && <p className="status" role="status">{message}</p>}
      {results.length > 0 ? <><div className="table-wrap"><table><thead><tr><th>Operation</th><th>Time (ms)</th><th>Recorded</th></tr></thead><tbody>{results.map((item, index) => <tr key={`${item.label}-${index}`}><td>{item.label}</td><td>{item.ms.toFixed(3)}</td><td>{item.time}</td></tr>)}</tbody></table></div><div className="result-actions"><button className="secondary" onClick={downloadCsv}>Download CSV</button><button className="secondary" onClick={() => setResults([])}>Clear results</button></div></> : <p className="empty">No measurements yet.</p>}
    </section>
    <footer>Browser timings are approximate. Run at least five suites in the same environment and compare medians.</footer>
  </main>;
}
