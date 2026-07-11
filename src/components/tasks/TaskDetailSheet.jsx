"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Archive, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useTasks } from "@/lib/TasksContext";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/taskUtils";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES = ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function TaskDetailSheet({ task, onClose }) {
    const { fetchTaskById, editTask, deleteTask, completeTask, uncompleteTask, archiveTask } = useTasks();

    const [fullTask, setFullTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [status, setStatus] = useState("TODO");
    const [dueDate, setDueDate] = useState("");

    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    useEffect(() => {
        if (!task?.id) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchTaskById(task.id)
            .then((data) => {
                if (cancelled) return;
                setFullTask(data);
                setTitle(data.title || "");
                setDescription(data.description || "");
                setPriority(data.priority || "MEDIUM");
                setStatus(data.status || "TODO");
                setDueDate(toDatetimeLocalValue(data.due_date));
            })
            .catch(() => {
                if (!cancelled) setError("Failed to load task.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [task?.id, fetchTaskById]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await editTask(task.id, {
                title: title.trim(),
                description: description.trim() || null,
                priority,
                status,
                due_date: fromDatetimeLocalValue(dueDate),
            });
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        await deleteTask(task.id);
        onClose();
    };

    const handleArchive = async () => {
        await archiveTask(task.id);
        onClose();
    };

    const handleToggleComplete = async () => {
        const isCompleted = fullTask?.completed || fullTask?.status === "COMPLETED";
        if (isCompleted) {
            await uncompleteTask(task.id);
        } else {
            await completeTask(task.id);
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {task && (
                <>
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        key="sheet"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col max-h-[90dvh] max-w-2xl mx-auto rounded-t-3xl bg-white dark:bg-zinc-900 shadow-2xl border-t border-zinc-200 dark:border-zinc-800"
                    >
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        </div>

                        <div className="flex items-center justify-between px-5 pt-2 pb-3">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Task details</h2>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-12 text-zinc-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                            ) : error ? (
                                <p className="text-red-400 text-sm">{error}</p>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1 block">Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full text-base font-semibold bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 outline-none text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1 block">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={4}
                                            placeholder="Add details..."
                                            className="w-full text-sm bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 outline-none resize-none text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1 block">Priority</label>
                                            <select
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value)}
                                                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2.5 outline-none text-zinc-700 dark:text-zinc-200"
                                            >
                                                {PRIORITIES.map((p) => (
                                                    <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1 block">Status</label>
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2.5 outline-none text-zinc-700 dark:text-zinc-200"
                                            >
                                                {STATUSES.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s.replace("_", " ").charAt(0) + s.replace("_", " ").slice(1).toLowerCase()}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1 block">Due date</label>
                                        <input
                                            type="datetime-local"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2.5 outline-none text-zinc-700 dark:text-zinc-200"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                                onClick={handleSave}
                                disabled={loading || saving || !title.trim()}
                                className="flex items-center justify-center gap-2 w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold py-3 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save changes
                            </button>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={handleToggleComplete}
                                    disabled={loading}
                                    className="text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-zinc-700 dark:text-zinc-200 hover:border-green-400 hover:text-green-600 transition-colors disabled:opacity-50"
                                >
                                    {fullTask?.completed ? "Undo" : "Done"}
                                </button>
                                <button
                                    onClick={handleArchive}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-1 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-zinc-700 dark:text-zinc-200 hover:border-amber-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                                >
                                    <Archive className="w-3.5 h-3.5" />
                                    Archive
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-1 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-zinc-700 dark:text-zinc-200 hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
