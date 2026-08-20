"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Archive, Loader2, Save, Bell, CheckCircle2, RotateCcw, Calendar, Flag, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { useTasks } from "@/lib/TasksContext";
import { notify } from "@/lib/notify";
import DateTimePicker from "./DateTimePicker";
import ReminderPicker from "./ReminderPicker";
import RecurrenceSelect from "./RecurrenceSelect";
import { toDatetimeLocalValue } from "@/lib/taskUtils";

const PRIORITIES = [
    { id: "LOW", label: "Low", cls: "hover:bg-zinc-100 dark:hover:bg-zinc-800" },
    { id: "MEDIUM", label: "Medium", cls: "hover:bg-amber-50 dark:hover:bg-amber-950/40" },
    { id: "HIGH", label: "High", cls: "hover:bg-orange-50 dark:hover:bg-orange-950/40" },
    { id: "URGENT", label: "Urgent", cls: "hover:bg-red-50 dark:hover:bg-red-950/40" },
];

const STATUSES = [
    { id: "TODO", label: "To Do" },
    { id: "IN_PROGRESS", label: "In Progress" },
    { id: "COMPLETED", label: "Completed" },
    { id: "CANCELLED", label: "Cancelled" },
];

const fieldClass = "w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2.5 outline-none text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition-all shadow-2xs";
const labelClass = "text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1.5";

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
    const [reminderAt, setReminderAt] = useState("");
    const [recurrence, setRecurrence] = useState("NONE");

    const handleClose = () => {
        onClose();
    };

    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") handleClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
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
            const reminderAtISO = reminderAt
                ? new Date(reminderAt).toISOString()
                : dueDateISO;

            await editTask(task.id, {
                title: title.trim(),
                description: description.trim() || null,
                priority,
                status,
                due_date: dueDateISO,
                reminder_at: reminderAtISO,
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
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "linear" }}
                        onClick={handleClose}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
                    />
                    
                    {/* Morphing Sheet Panel */}
                    <motion.div
                        key="sheet"
                        layout
                        initial={{ y: "100%", opacity: 0.9 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col max-h-[90dvh] max-w-xl mx-auto rounded-t-3xl bg-white dark:bg-zinc-900 shadow-2xl border-t border-zinc-200 dark:border-zinc-800 overflow-hidden"
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1 shrink-0">
                            <div className="w-10 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                Edit Task
                            </h2>
                            <button
                                onClick={handleClose}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-16 text-zinc-400 gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs">Loading task details…</span>
                                </div>
                            ) : error ? (
                                <p className="text-red-500 text-xs text-center py-8">{error}</p>
                            ) : (
                                <>
                                    {/* Title Input */}
                                    <div>
                                        <label className={labelClass}>Task Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="What needs to be done?"
                                            className={`${fieldClass} text-sm font-semibold`}
                                        />
                                    </div>

                                    {/* Status Selector */}
                                    <div>
                                        <label className={labelClass}>Status</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                            {STATUSES.map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => setStatus(s.id)}
                                                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                                                        status === s.id
                                                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-2xs"
                                                            : "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                    }`}
                                                >
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Priority Selector */}
                                    <div>
                                        <label className={labelClass}>
                                            <Flag className="w-3 h-3 text-zinc-400" /> Priority
                                        </label>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {PRIORITIES.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => setPriority(p.id)}
                                                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                                                        priority === p.id
                                                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-2xs"
                                                            : "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-800 " + p.cls
                                                    }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description Input */}
                                    <div>
                                        <label className={labelClass}>Description / Notes</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            placeholder="Add details, links, or sub-context…"
                                            className={`${fieldClass} resize-none`}
                                        />
                                    </div>

                                    {/* Date & Reminder pickers */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>
                                                <Calendar className="w-3 h-3 text-zinc-400" /> Due Date
                                            </label>
                                            <DateTimePicker
                                                value={dueDate}
                                                onChange={(val) => {
                                                    setDueDate(val);
                                                    if (!reminderAt || reminderAt === dueDate) {
                                                        setReminderAt(val);
                                                    }
                                                }}
                                                placeholder="No due date"
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>
                                                <Bell className="w-3 h-3 text-zinc-400" /> Reminder
                                            </label>
                                            <ReminderPicker
                                                dueDate={dueDate}
                                                value={reminderAt}
                                                onChange={setReminderAt}
                                            />
                                        </div>
                                    </div>

                                    {/* Recurrence */}
                                    <div>
                                        <label className={labelClass}>
                                            <RefreshCw className="w-3 h-3 text-zinc-400" /> Repeat Interval
                                        </label>
                                        <RecurrenceSelect
                                            value={recurrence}
                                            onChange={setRecurrence}
                                            dueDate={dueDate}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 shrink-0">
                            <button
                                onClick={handleSave}
                                disabled={loading || saving || !title.trim()}
                                className="flex items-center justify-center gap-2 w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold py-2.5 transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-40 shadow-2xs"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                Save Changes
                            </button>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={handleToggleComplete}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 py-2 px-1 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
                                >
                                    {isCompleted
                                        ? <><RotateCcw className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Pending</span></>
                                        : <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Done</span></>
                                    }
                                </button>
                                <button
                                    onClick={handleArchive}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 py-2 px-1 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
                                >
                                    <Archive className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">Archive</span>
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 py-2 px-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40 cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">Delete</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
