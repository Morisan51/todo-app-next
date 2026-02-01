"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./TodoApp.module.css";

const STORAGE_KEY = "todo-app-tasks";

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [inputValue, setInputValue] = useState("");
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef(null);

  // LocalStorage から読み込み（初回のみ）
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) {
        setTasks(saved);
      }
    } catch {
      // do nothing
    }
    setLoaded(true);
  }, []);

  // tasks が変わるたびに LocalStorage へ保存
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, loaded]);

  // --- Task Operations ---
  function addTask() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: trimmed, completed: false },
    ]);
    setInputValue("");
    inputRef.current?.focus();
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }

  // --- Filtering ---
  function getFilteredTasks() {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }

  const filtered = getFilteredTasks();
  const remaining = tasks.filter((t) => !t.completed).length;

  // SSR 時は空を返す（LocalStorage はクライアントのみ）
  if (!loaded) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>My TODO</h1>
      </header>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <input
          ref={inputRef}
          type="text"
          className={styles.taskInput}
          placeholder="タスクを入力..."
          maxLength={100}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputValue.trim()) addTask();
          }}
        />
        <button
          className={styles.addBtn}
          disabled={!inputValue.trim()}
          onClick={addTask}
        >
          追加
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {[
          { key: "all", label: "すべて" },
          { key: "active", label: "未完了" },
          { key: "completed", label: "完了済み" },
        ].map((f) => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${
              filter === f.key ? styles.filterBtnActive : ""
            }`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <ul className={styles.taskList}>
        {filtered.length === 0 && (
          <li className={styles.emptyMessage}>タスクがありません</li>
        )}
        {filtered.map((task) => (
          <li key={task.id} className={styles.taskItem}>
            <button
              className={`${styles.taskCheck} ${
                task.completed ? styles.taskCheckCompleted : ""
              }`}
              aria-label={task.completed ? "未完了に戻す" : "完了にする"}
              onClick={() => toggleTask(task.id)}
            />
            <span
              className={`${styles.taskText} ${
                task.completed ? styles.taskTextCompleted : ""
              }`}
            >
              {task.text}
            </span>
            <button
              className={styles.taskDelete}
              aria-label="削除"
              onClick={() => deleteTask(task.id)}
            >
              🗑
            </button>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.taskCount}>残り {remaining}件</span>
        <button className={styles.clearCompletedBtn} onClick={clearCompleted}>
          完了済みを削除
        </button>
      </footer>
    </div>
  );
}
