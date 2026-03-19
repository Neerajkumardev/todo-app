import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const API = "/api/todos";

const PRIORITY_CONFIG = {
  high: { label: "High", color: "#ff6b6b", bg: "#fff0f0" },
  medium: { label: "Medium", color: "#f59e0b", bg: "#fffbeb" },
  low: { label: "Low", color: "#10b981", bg: "#ecfdf5" },
};

function formatDateTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${date}, ${time}`;
}

function formatDueDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return dateStr.slice(0, 10) < toLocalDateStr(new Date());
}

function getDateFilterFn(dateFilter) {
  const today = toLocalDateStr(new Date());
  const yesterday = toLocalDateStr(new Date(Date.now() - 86400000));
  const tomorrow = toLocalDateStr(new Date(Date.now() + 86400000));
  switch (dateFilter) {
    case "today":     return (t) => t.due_date && t.due_date.slice(0, 10) === today;
    case "yesterday": return (t) => t.due_date && t.due_date.slice(0, 10) === yesterday;
    case "tomorrow":  return (t) => t.due_date && t.due_date.slice(0, 10) === tomorrow;
    default:          return () => true;
  }
}

// Confirm Popup
function ConfirmPopup({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-popup" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">🗑️</div>
        <h3>Delete Task?</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// Todo Modal
function TodoModal({ todo, onClose, onSave }) {
  const [form, setForm] = useState({
    title: todo?.title || "",
    description: todo?.description || "",
    priority: todo?.priority || "medium",
    due_date: todo?.due_date ? todo.due_date.slice(0, 10) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    setLoading(true);
    setError("");
    try {
      const method = todo ? "PATCH" : "POST";
      const url = todo ? `${API}/${todo.id}` : API;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      const saved = await res.json();
      onSave(saved, !!todo);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{todo ? "Edit Task" : "New Task"}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field">
            <label>Title *</label>
            <input autoFocus value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What needs to be done?" />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Add details (optional)" rows={3} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Priority</label>
              <select value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div className="field">
              <label>Due Date</label>
              <input type="date" value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving…" : todo ? "Update Task" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Todo Card
function TodoCard({ todo, onToggle, onReopen, onEdit, onDelete }) {
  const p = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG.medium;
  const overdue = !todo.completed && isOverdue(todo.due_date);

  return (
    <div className={`todo-card ${todo.completed ? "completed" : ""} ${overdue ? "overdue" : ""}`}>
      <div className="card-left">
        <button
          className={`check-btn ${todo.completed ? "checked" : ""}`}
          onClick={() => !todo.completed && onToggle(todo)}
          style={{ cursor: todo.completed ? "default" : "pointer" }}
          title={todo.completed ? "Done" : "Mark as done"}
        >
          {todo.completed && "✓"}
        </button>
      </div>

      <div className="card-body">
        <div className="card-top">
          <span className="todo-title">{todo.title}</span>
          <span className="priority-badge" style={{ color: p.color, background: p.bg }}>
            {p.label}
          </span>
        </div>
        {todo.description && <p className="todo-desc">{todo.description}</p>}
        <div className="card-meta">
          {todo.due_date && (
            <span className={`due-date ${overdue ? "overdue-text" : ""}`}>
              {overdue ? "⚠️ Overdue · " : "📅 "}{formatDueDate(todo.due_date)}
            </span>
          )}
          <span className="created-at">
            🕐 {formatDateTime(todo.created_at)}
          </span>
        </div>
      </div>

      <div className="card-actions">
        {todo.completed && (
          <button className="icon-btn open-btn" onClick={() => onReopen(todo)} title="Reopen task">
            🔓
          </button>
        )}
        <button className="icon-btn edit-btn" onClick={() => onEdit(todo)} title="Edit">✏️</button>
        <button className="icon-btn del-btn" onClick={() => onDelete(todo)} title="Delete">🗑️</button>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dbStatus, setDbStatus] = useState("checking");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setDbStatus(d.db === "connected" ? "connected" : "error"))
      .catch(() => setDbStatus("error"));
  }, []);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to fetch");
      setTodos(await res.json());
      setError("");
    } catch (err) {
      setError("Could not load todos. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const handleToggle = async (todo) => {
    try {
      const res = await fetch(`${API}/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch {}
  };

  const handleReopen = async (todo) => {
    try {
      const res = await fetch(`${API}/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: false }),
      });
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch {}
  };

  const handleSave = (saved, isEdit) => {
    if (isEdit) {
      setTodos((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
    } else {
      setTodos((prev) => [saved, ...prev]);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    await fetch(`${API}/${confirmDelete.id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  const dateFn = getDateFilterFn(dateFilter);
  const visible = todos.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filter === "all" ||
      (filter === "active" && !t.completed) ||
      (filter === "completed" && t.completed);
    return matchSearch && matchStatus && dateFn(t);
  });

  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    done: todos.filter((t) => t.completed).length,
  };

  return (
    <div className="app">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="container">
        <header className="header">
          <div className="header-top">
            <div>
              <h1 className="app-title">My Tasks</h1>
              <p className="app-subtitle">{stats.active} remaining · {stats.done} done</p>
            </div>
            <div className="header-right">
              <span className={`db-badge ${dbStatus}`}>
                {dbStatus === "connected" ? "🟢 DB Connected" :
                  dbStatus === "error" ? "🔴 DB Offline" : "⏳ Checking…"}
              </span>
              <button className="btn-primary add-btn" onClick={() => setModal("new")}>
                + New Task
              </button>
            </div>
          </div>
          <div className="stats-bar">
            {["high", "medium", "low"].map((p) => {
              const cnt = todos.filter((t) => t.priority === p && !t.completed).length;
              const cfg = PRIORITY_CONFIG[p];
              return (
                <div key={p} className="stat-chip" style={{ borderColor: cfg.color }}>
                  <span style={{ color: cfg.color }}>{cfg.label}</span>
                  <strong style={{ color: cfg.color }}>{cnt}</strong>
                </div>
              );
            })}
          </div>
        </header>

        <div className="controls">
          <input className="search-input" placeholder="🔍 Search tasks…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="filter-row">
          <div className="filter-tabs">
            {["all", "active", "completed"].map((f) => (
              <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="filter-tabs date-filters">
            {[
              { key: "all", label: "📅 All Dates" },
              { key: "yesterday", label: "Yesterday" },
              { key: "today", label: "Today" },
              { key: "tomorrow", label: "Tomorrow" },
            ].map((f) => (
              <button key={f.key} className={`filter-tab ${dateFilter === f.key ? "active" : ""}`}
                onClick={() => setDateFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button onClick={fetchTodos}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            <p>Loading tasks…</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>{search || dateFilter !== "all" ? "No tasks match your filters" : "No tasks yet"}</h3>
            <p>{search || dateFilter !== "all" ? "Try adjusting your search or date filter" : "Click '+ New Task' to get started"}</p>
          </div>
        ) : (
          <div className="todo-list">
            {visible.map((todo) => (
              <TodoCard key={todo.id} todo={todo}
                onToggle={handleToggle}
                onReopen={handleReopen}
                onEdit={(t) => setModal(t)}
                onDelete={(t) => setConfirmDelete(t)}
              />
            ))}
          </div>
        )}

        {todos.length > 0 && (
          <footer className="app-footer">
            {stats.total} total tasks · Saved in PostgreSQL
          </footer>
        )}
      </div>

      {modal && (
        <TodoModal
          todo={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
        <ConfirmPopup
          message={`"${confirmDelete.title}" will be permanently deleted.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
