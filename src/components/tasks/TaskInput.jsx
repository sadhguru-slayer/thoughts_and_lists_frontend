"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks } from "@/lib/TasksContext";
import { notify } from "@/lib/notify";
import { Plus, Loader2, Calendar, Bell, Repeat, Flag, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import DateTimePicker from "./DateTimePicker";
import ReminderPicker from "./ReminderPicker";
import RecurrenceSelect from "./RecurrenceSelect";
import { formatFriendlyDateTime } from "@/lib/taskUtils";

const PRIORITIES = [
    { value: "LOW", label: "Low", color: "bg-blue-500" },
    { value: "MEDIUM", label: "Medium", color: "bg-amber-500" },
    { value: "HIGH", label: "High", color: "bg-orange-500" },
    { value: "URGENT", label: "Urgent", color: "bg-red-500" },
];

export default function TaskInput() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [dueDate, setDueDate] = useState("");
    const [reminderAt, setReminderAt] = useState("");
    const [recurrence, setRecurrence] = useState("NONE");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Active sub-panel state: null | 'date' | 'reminder' | 'priority' | 'repeat'
    const [activeTab, setActiveTab] = useState(null);

    const titleInputRef = useRef(null);
    const { addTask } = useTasks();

    useEffect(() => {
        if (isExpanded && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isExpanded]);

    const reset = () => {
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        setDueDate("");
        setReminderAt("");
        setRecurrence("NONE");
        setIsExpanded(false);
        setActiveTab(null);
    };

    const handleDueDateChange = (newDueDate) => {
        setDueDate(newDueDate);
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

    const toggleTab = (tab) => {
        setActiveTab((prev) => (prev === tab ? null : tab));
    };

    const currentPriorityObj = PRIORITIES.find((p) => p.value === priority);

    return (
        <div className="w-full mb-6">
            <form
                onSubmit={handleSubmit}
                className={cn(
                    "bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs transition-all duration-200",
                    isExpanded && "ring-1 ring-zinc-400/30 dark:ring-zinc-700/50 shadow-md"
                )}
            >
                {/* Collapsed view / Main Title Bar */}
                <div className="flex items-center gap-3 px-4 py-3">
                    <input
                        ref={titleInputRef}
                        type="text"
                        placeholder="Add a new task…"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                        disabled={isSubmitting}
                        className="flex-1 text-sm sm:text-base font-semibold bg-transparent border-none outline-none placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100"
                    />
                    {!isExpanded && (
                        <button
                            type="button"
                            onClick={() => setIsExpanded(true)}
                            className="p-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-colors shrink-0 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New Task</span>
                        </button>
                    )}
                </div>

                {/* Expanded Details Form */}
                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="px-4 pb-4 space-y-3.5 border-t border-zinc-100 dark:border-zinc-800/80 pt-3 overflow-hidden"
                        >
                            {/* Optional Description */}
                            <textarea
                                placeholder="Add notes or sub-details (optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isSubmitting}
                                rows={2}
                                className="w-full text-xs sm:text-sm bg-zinc-50/70 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 outline-none resize-none placeholder:text-zinc-400 text-zinc-800 dark:text-zinc-200 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all"
                            />

                            {/* Toolbar Buttons Row */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Date & Time Pill Button */}
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => toggleTab("date")}
                                    className={cn(
                                        "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer",
                                        dueDate || activeTab === "date"
                                            ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                                    )}
                                >
                                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                                    <span>
                                        {dueDate ? formatFriendlyDateTime(dueDate) : "Due Date & Time"}
                                    </span>
                                    <ChevronDown className={cn("w-3 h-3 transition-transform", activeTab === "date" && "rotate-180")} />
                                </button>

                                {/* Reminder Pill Button */}
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => toggleTab("reminder")}
                                    className={cn(
                                        "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer",
                                        reminderAt || activeTab === "reminder"
                                            ? "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300"
                                            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                                    )}
                                >
                                    <Bell className="w-3.5 h-3.5 shrink-0" />
                                    <span>
                                        {reminderAt ? "Reminder set" : "Reminder"}
                                    </span>
                                    <ChevronDown className={cn("w-3 h-3 transition-transform", activeTab === "reminder" && "rotate-180")} />
                                </button>

                                {/* Priority Pill Button */}
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => toggleTab("priority")}
                                    className={cn(
                                        "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer",
                                        priority !== "MEDIUM" || activeTab === "priority"
                                            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                                            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                                    )}
                                >
                                    <Flag className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                                    <div className="flex items-center gap-1.5">
                                        <span className={cn("w-2 h-2 rounded-full shrink-0", currentPriorityObj?.color)} />
                                        <span>{currentPriorityObj?.label} Priority</span>
                                    </div>
                                    <ChevronDown className={cn("w-3 h-3 transition-transform", activeTab === "priority" && "rotate-180")} />
                                </button>

                                {/* Recurrence Pill Button */}
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => toggleTab("repeat")}
                                    className={cn(
                                        "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer",
                                        recurrence !== "NONE" || activeTab === "repeat"
                                            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                                            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                                    )}
                                >
                                    <Repeat className="w-3.5 h-3.5 shrink-0" />
                                    <span>
                                        {recurrence !== "NONE" ? recurrence.charAt(0) + recurrence.slice(1).toLowerCase() : "Repeat"}
                                    </span>
                                    <ChevronDown className={cn("w-3 h-3 transition-transform", activeTab === "repeat" && "rotate-180")} />
                                </button>
                            </div>

                            {/* Active Tab Sub-Panel */}
                            <AnimatePresence mode="wait">
                                {activeTab === "date" && (
                                    <motion.div
                                        key="date"
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Set Due Date & Time</span>
                                            <button type="button" onClick={() => setActiveTab(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <DateTimePicker
                                            value={dueDate}
                                            onChange={handleDueDateChange}
                                            disabled={isSubmitting}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === "reminder" && (
                                    <motion.div
                                        key="reminder"
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Set Reminder</span>
                                            <button type="button" onClick={() => setActiveTab(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <ReminderPicker
                                            dueDate={dueDate}
                                            value={reminderAt}
                                            onChange={setReminderAt}
                                            disabled={isSubmitting}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === "priority" && (
                                    <motion.div
                                        key="priority"
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Select Priority</span>
                                            <button type="button" onClick={() => setActiveTab(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                            {PRIORITIES.map((p) => (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    disabled={isSubmitting}
                                                    onClick={() => {
                                                        setPriority(p.value);
                                                        setActiveTab(null);
                                                    }}
                                                    className={cn(
                                                        "flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                                                        priority === p.value
                                                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs"
                                                            : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                                    )}
                                                >
                                                    <span className={cn("w-2 h-2 rounded-full shrink-0", p.color)} />
                                                    <span>{p.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "repeat" && (
                                    <motion.div
                                        key="repeat"
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Repeat Interval</span>
                                            <button type="button" onClick={() => setActiveTab(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <RecurrenceSelect
                                            value={recurrence}
                                            onChange={setRecurrence}
                                            dueDate={dueDate}
                                            disabled={isSubmitting}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                                <button
                                    type="button"
                                    onClick={reset}
                                    disabled={isSubmitting}
                                    className="text-xs font-semibold px-3 py-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !title.trim()}
                                    className="flex items-center gap-2 text-xs font-bold px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 shadow-xs cursor-pointer"
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
}
