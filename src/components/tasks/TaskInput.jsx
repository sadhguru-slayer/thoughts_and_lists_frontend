"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks } from "@/lib/TasksContext";
import { notify } from "@/lib/notify";
import { Plus, Loader2, Calendar, Bell, Repeat, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import DateTimePicker from "./DateTimePicker";
import ReminderPicker from "./ReminderPicker";
import RecurrenceSelect from "./RecurrenceSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRIORITY_CONFIG } from "@/lib/taskUtils";

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

    const handleDueDateChange = (newDueDate) => {
        setDueDate(newDueDate);
        // If reminder wasn't customized or was empty, sync reminder with due date
        if (!reminderAt || reminderAt === dueDate) {
            setReminderAt(newDueDate);
        }
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

            // If recurrence is set but no due date, default due date to today 9 AM or 1hr from now
            let finalDueDate = dueDate;
            let finalReminderAt = reminderAt;

            if (recurrence !== "NONE" && !finalDueDate) {
                const now = new Date();
                const defaultTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0);
                if (defaultTarget < now) defaultTarget.setTime(now.getTime() + 60 * 60 * 1000);
                finalDueDate = defaultTarget.toISOString();
                if (!finalReminderAt) finalReminderAt = finalDueDate;
            }

            await notify.promise(
                addTask({
                    title: title.trim(),
                    description: description.trim() || null,
                    priority,
                    due_date: finalDueDate ? new Date(finalDueDate).toISOString() : null,
                    reminder_at: finalReminderAt ? new Date(finalReminderAt).toISOString() : null,
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
            <form
                onSubmit={handleSubmit}
                className={cn(
                    "bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs transition-colors duration-150",
                    isExpanded && "ring-1 ring-zinc-300 dark:ring-zinc-700"
                )}
            >
                <div className="flex items-center gap-3 px-4 py-3.5">
                    <input
                        type="text"
                        placeholder="Add a task… (e.g. 'Daily team sync at 9:00 AM')"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                        disabled={isSubmitting}
                        className="flex-1 text-sm font-semibold bg-transparent border-none outline-none placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100"
                    />
                    {!isExpanded && (
                        <button
                            type="button"
                            onClick={() => setIsExpanded(true)}
                            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0 flex items-center gap-1.5 text-xs font-bold"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New Task</span>
                        </button>
                    )}
                </div>

                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="px-4 pb-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800/80 pt-3 overflow-hidden"
                        >
                            {/* Optional Description */}
                            <textarea
                                placeholder="Description or notes (optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isSubmitting}
                                rows={2}
                                className="w-full text-xs sm:text-sm bg-zinc-50/60 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 outline-none resize-none placeholder:text-zinc-400 text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition-all"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Priority & Repeat */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Priority</label>
                                        <div className="flex items-center gap-1.5">
                                            {PRIORITIES.map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    disabled={isSubmitting}
                                                    onClick={() => setPriority(p)}
                                                    className={`flex-1 text-xs font-bold py-2 rounded-xl border transition-all ${
                                                        priority === p
                                                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                                                            : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                                                    }`}
                                                >
                                                    {p.charAt(0) + p.slice(1).toLowerCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Repeat Pattern</label>
                                        <RecurrenceSelect
                                            value={recurrence}
                                            onChange={setRecurrence}
                                            dueDate={dueDate}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                {/* Due Date & Reminder */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-zinc-400" /> Start / Due Date
                                        </label>
                                        <DateTimePicker
                                            value={dueDate}
                                            onChange={handleDueDateChange}
                                            placeholder="Set due date & time"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1">
                                            <Bell className="w-3 h-3 text-violet-500" /> Notification Reminder
                                        </label>
                                        <ReminderPicker
                                            dueDate={dueDate}
                                            value={reminderAt}
                                            onChange={setReminderAt}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                                <button
                                    type="button"
                                    onClick={reset}
                                    disabled={isSubmitting}
                                    className="text-xs font-semibold px-3 py-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                                >
                                    Cancel
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !title.trim()}
                                        className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 shadow-xs"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Creating…
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Create Task
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
}
