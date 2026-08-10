"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks } from "@/lib/TasksContext";
import { notify } from "@/lib/notify";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import DateTimePicker from "./DateTimePicker";
import RecurrenceSelect from "./RecurrenceSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function TaskInput() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [dueDate, setDueDate] = useState("");
    const [reminderAt, setReminderAt] = useState("");
    const [recurrence, setRecurrence] = useState("NONE");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { addTask } = useTasks();

    const reset = () => {
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        setDueDate("");
        setReminderAt("");
        setRecurrence("NONE");
        setIsExpanded(false);
    };

    const submitTask = useCallback(async () => {
        if (!title.trim()) {
            if (!description.trim()) {
                reset();
                return;
            }
        }

        try {
            setIsSubmitting(true);
            await notify.promise(
                addTask({
                    title: title.trim(),
                    description: description.trim() || null,
                    priority,
                    due_date: dueDate ? new Date(dueDate).toISOString() : null,
                    reminder_at: reminderAt ? new Date(reminderAt).toISOString() : null,
                    recurrence_interval: recurrence,
                }),
                {
                    loading: "Adding task…",
                    success: "Task added!",
                    error: "Failed to add task",
                }
            );
            reset();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }, [title, description, priority, dueDate, reminderAt, recurrence, addTask]);

    const handleSubmit = (e) => {
        e.preventDefault();
        submitTask();
    };

    return (
        <div className="w-full mb-6">
            <motion.form
                layout
                onSubmit={handleSubmit}
                className={cn(
                    "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm transition-all",
                    isExpanded && "shadow-md ring-1 ring-zinc-200 dark:ring-zinc-700"
                )}
            >
                <div className="flex items-center gap-2 px-4 py-3">
                    <input
                        type="text"
                        placeholder="Add a task…"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                        disabled={isSubmitting}
                        className="flex-1 text-sm font-medium bg-transparent border-none outline-none placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100"
                    />
                    {!isExpanded && (
                        <button
                            type="button"
                            onClick={() => setIsExpanded(true)}
                            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-4 pb-3 space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-3 overflow-visible"
                        >
                            <textarea
                                placeholder="Description (optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isSubmitting}
                                rows={2}
                                className="w-full text-sm bg-transparent border-none outline-none resize-none placeholder:text-zinc-400 text-zinc-700 dark:text-zinc-300"
                            />

                            <div className="flex flex-col gap-3">
                                {/* Priority */}
                                <div>
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1 block">Priority</label>
                                    <Select value={priority} onValueChange={setPriority} disabled={isSubmitting}>
                                        <SelectTrigger className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 py-2.5 px-3 h-auto text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PRIORITIES.map((p) => (
                                                <SelectItem key={p} value={p}>
                                                    {p.charAt(0) + p.slice(1).toLowerCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Due date */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Due date</label>
                                    <DateTimePicker
                                        value={dueDate}
                                        onChange={setDueDate}
                                        placeholder="No due date"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Reminder */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Reminder</label>
                                    <DateTimePicker
                                        value={reminderAt}
                                        onChange={setReminderAt}
                                        placeholder="Defaults to due date"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Recurrence */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Repeat</label>
                                    <RecurrenceSelect
                                        value={recurrence}
                                        onChange={setRecurrence}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={reset}
                                    disabled={isSubmitting}
                                    className="text-xs font-semibold px-3 py-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !title.trim()}
                                    className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add task"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.form>
        </div>
    );
}
