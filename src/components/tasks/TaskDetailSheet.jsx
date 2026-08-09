"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Archive, Loader2, Save, Bell, CheckCircle2, RotateCcw, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/lib/TasksContext";
import { notify } from "@/lib/notify";
import DateTimePicker from "./DateTimePicker";
import RecurrenceSelect from "./RecurrenceSelect";
import { toDatetimeLocalValue } from "@/lib/taskUtils";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES = ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const fieldClass = "w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2.5 outline-none text-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition-shadow";
const labelClass = "text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 block";

export default function TaskDetailSheet({ task, onClose }) {
    const router = useRouter();
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
    const [reminderAt, setReminderAt] = useState("");
    const [recurrence, setRecurrence] = useState("NONE");

    const handleClose = () => {
        router.replace("/tasks", { scroll: false });
        onClose();
    };


    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") handleClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                const reminderVal = toDatetimeLocalValue(data.reminder_at);
                const dueDateVal = toDatetimeLocalValue(data.due_date);
                setReminderAt(reminderVal !== dueDateVal ? reminderVal : "");
                setRecurrence(data.recurrence_interval ?? "NONE");
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
            const dueDateISO = dueDate ? new Date(dueDate).toISOString() : null;
            await editTask(task.id, {
                title: title.trim(),
                description: description.trim() || null,
                priority,
                status,
                due_date: dueDateISO,
                reminder_at: reminderAt ? new Date(reminderAt).toISOString() : null,
                recurrence_interval: recurrence,
            });
            notify.success("Task updated");
            handleClose();
        } catch (err) {
            notify.error("Failed to save task");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTask(task.id);
            notify.success("Task deleted");
            handleClose();
        } catch (err) {
            notify.error("Failed to delete task");
        }
    };

    const handleArchive = async () => {
        try {
            await archiveTask(task.id);
            notify.success("Task archived");
            handleClose();
        } catch (err) {
            notify.error("Failed to archive task");
        }
    };

    const handleToggleComplete = async () => {
        const isCompleted = fullTask?.completed || fullTask?.status === "COMPLETED";
        try {
            if (isCompleted) {
                await uncompleteTask(task.id);
                notify.success("Task marked as pending");
            } else {
                await completeTask(task.id);
                notify.success("Task completed! 🎉");
            }
            handleClose();
        } catch (err) {
            notify.error("Failed to update task status");
        }
    };

    const isCompleted = fullTask?.completed || fullTask?.status === "COMPLETED";

    return (
        <AnimatePresence>
            {task && (
                <>
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
                    />
                    <motion.div
                        key="sheet"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col max-h-[92dvh] max-w-2xl mx-auto rounded-t-3xl bg-white dark:bg-zinc-900 shadow-2xl border-t border-zinc-100 dark:border-zinc-800"
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                        </div>

                    {/* Header */}
                        <div className="flex items-start justify-between px-5 pt-2 pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-3">
                            <div className="min-w-0 flex-1">
                                {loading ? (
                                    <div className="h-6 w-40 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                                ) : (
                                    <>
                                        <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug truncate">
                                            {title || task.title}
                                        </h2>
                                        <span className={`mt-1 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                            {
                                                LOW: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
                                                MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
                                                HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
                                                URGENT: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
                                            }[priority] ?? "bg-zinc-100 text-zinc-500"
                                        }`}>
                                            {priority?.charAt(0) + priority?.slice(1).toLowerCase()}
                                        </span>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                            {loading ? (
                                <div className="flex items-center justify-center py-16 text-zinc-400 gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Loading…</span>
                                </div>
                            ) : error ? (
                                <p className="text-red-500 text-sm text-center py-8">{error}</p>
                            ) : (
                                <>
                                    <div>
                                        <label className={labelClass}>Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className={`${fieldClass} text-base font-semibold`}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            placeholder="Add details…"
                                            className={`${fieldClass} resize-none placeholder:text-zinc-400`}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Priority</label>
                                            <div className="relative">
                                                <select
                                                    value={priority}
                                                    onChange={(e) => setPriority(e.target.value)}
                                                    className={`${fieldClass} appearance-none pr-8`}
                                                >
                                                    {PRIORITIES.map((p) => (
                                                        <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Status</label>
                                            <div className="relative">
                                                <select
                                                    value={status}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                    className={`${fieldClass} appearance-none pr-8`}
                                                >
                                                    {STATUSES.map((s) => (
                                                        <option key={s} value={s}>
                                                            {s.replace("_", " ").charAt(0) + s.replace("_", " ").slice(1).toLowerCase()}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Due date</label>
                                        <DateTimePicker
                                            value={dueDate}
                                            onChange={setDueDate}
                                            placeholder="No due date"
                                        />
                                    </div>
                                    <div>
                                        <label className={`${labelClass} flex items-center gap-1`}>
                                            <Bell className="w-3 h-3" /> Reminder
                                        </label>
                                        <DateTimePicker
                                            value={reminderAt}
                                            onChange={setReminderAt}
                                            placeholder="Defaults to due date"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Repeat</label>
                                        <RecurrenceSelect
                                            value={recurrence}
                                            onChange={setRecurrence}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer actions */}
                        <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                            <button
                                onClick={handleSave}
                                disabled={loading || saving || !title.trim()}
                                className="flex items-center justify-center gap-2 w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold py-3 transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-40"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save changes
                            </button>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={handleToggleComplete}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-zinc-700 dark:text-zinc-200 hover:border-green-400 hover:text-green-600 dark:hover:border-green-600 dark:hover:text-green-400 transition-colors disabled:opacity-40"
                                >
                                    {isCompleted
                                        ? <><RotateCcw className="w-3.5 h-3.5" /> Undo</>
                                        : <><CheckCircle2 className="w-3.5 h-3.5" /> Done</>
                                    }
                                </button>
                                <button
                                    onClick={handleArchive}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-zinc-700 dark:text-zinc-200 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-colors disabled:opacity-40"
                                >
                                    <Archive className="w-3.5 h-3.5" />
                                    Archive
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-zinc-700 dark:text-zinc-200 hover:border-red-400 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-40"
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
