"use client";

import { useState, useCallback, useEffect, useRef, Suspense, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2, Search, ListTodo, X, CheckCircle2 } from "lucide-react";

import TaskInput from "@/components/tasks/TaskInput";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilters, { TaskStatusPills } from "@/components/tasks/TaskFilters";
import TaskDetailSheet from "@/components/tasks/TaskDetailSheet";
import Pagination from "@/components/ui/Pagination";
import { useTasks } from "@/lib/TasksContext";
import { groupTasksByDate } from "@/lib/taskUtils";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// TaskGroup — collapsible section with a sleek date-bucket header
// ---------------------------------------------------------------------------
function TaskGroup({ group, onOpen, onToggleComplete, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="space-y-3">
            {/* Cluster Header Button */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={cn(
                    "w-full flex items-center justify-between py-1.5 px-1 text-left transition-colors cursor-pointer group select-none"
                )}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <motion.div
                        animate={{ rotate: open ? 0 : -90 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors"
                    >
                        <ChevronDown className="w-4 h-4 shrink-0 stroke-[2.2]" />
                    </motion.div>

                    <span className="text-sm leading-none" aria-hidden="true">{group.emoji}</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        {group.label}
                    </h3>
                    {group.badgeStyle && (
                        <span className={cn(
                            "hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                            group.badgeStyle
                        )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", group.dotColor)} />
                            {group.label}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tabular-nums bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                        {group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}
                    </span>
                </div>
            </button>

            {/* Cards Container */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="cards"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-2.5 overflow-hidden"
                    >
                        <AnimatePresence mode="popLayout">
                            {group.tasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onOpen={onOpen}
                                    onToggleComplete={onToggleComplete}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
function TasksPageInner() {
    const {
        tasks,
        loading,
        filters,
        page,
        perPage,
        pagination,
        changePage,
        updateFilters,
        completeTask,
        uncompleteTask,
        fetchTaskById,
    } = useTasks();

    const [selectedTask, setSelectedTask] = useState(null);
    const [searchInput, setSearchInput] = useState(filters.search || "");
    const didInitRef = useRef(false);

    // Derive date-bucketed groups from the current page of tasks
    const groups = useMemo(() => groupTasksByDate(tasks), [tasks]);

    // On mount: read ?task= from URL once, strip it, then open modal.
    useEffect(() => {
        if (didInitRef.current) return;
        didInitRef.current = true;

        const params = new URLSearchParams(window.location.search);
        const taskId = params.get("task");
        if (!taskId) return;

        params.delete("task");
        const qs = params.toString();
        window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);

        const found = tasks.find((t) => String(t.id) === String(taskId));
        if (found) {
            setSelectedTask(found);
        } else {
            fetchTaskById(taskId)
                .then((data) => { if (data) setSelectedTask(data); })
                .catch(() => {});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpen = useCallback((task) => setSelectedTask(task), []);
    const handleClose = useCallback(() => setSelectedTask(null), []);

    const handleToggleComplete = useCallback(async (task) => {
        const isCompleted = task.completed || task.status === "COMPLETED";
        if (isCompleted) await uncompleteTask(task.id);
        else await completeTask(task.id);
    }, [completeTask, uncompleteTask]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateFilters({ search: searchInput });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        if (!value.trim()) updateFilters({ search: "" });
    };

    const clearSearch = () => {
        setSearchInput("");
        updateFilters({ search: "" });
    };

    const totalTasksCount = pagination?.total ?? tasks.length;

    return (
        <div className="w-full space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* Page Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <ListTodo className="w-6 h-6 text-zinc-700 dark:text-zinc-300 shrink-0" />
                        Tasks
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Stay organized, manage priorities, and track daily progress.
                    </p>
                </div>
                {totalTasksCount > 0 && (
                    <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/60 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                        <span>{totalTasksCount} {totalTasksCount === 1 ? "task" : "tasks"}</span>
                    </div>
                )}
            </header>

            {/* Quick Task Creation */}
            <section aria-label="Create Task">
                <TaskInput />
            </section>

            {/* Search & Filters */}
            <section className="space-y-3" aria-label="Task Filters">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                        <input
                            type="search"
                            placeholder="Search tasks by title or details…"
                            value={searchInput}
                            onChange={handleSearchChange}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition-all dark:text-zinc-200 placeholder:text-zinc-400 shadow-2xs"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors cursor-pointer"
                                aria-label="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </form>
                    <TaskFilters />
                </div>
                <TaskStatusPills />
            </section>

                {/* Task List — grouped by date bucket */}
                <main className="space-y-5">
                    {!loading && tasks.length > 0 && (
                        <>
                            {groups.map(group => (
                                <TaskGroup
                                    key={group.key}
                                    group={group}
                                    onOpen={handleOpen}
                                    onToggleComplete={handleToggleComplete}
                                    // Collapse completed by default — hides old recurring instances
                                    defaultOpen={group.key !== "completed"}
                                />
                            ))}
                            <Pagination
                                currentPage={page}
                                totalPages={pagination?.totalPages ?? 1}
                                totalItems={pagination?.total ?? tasks.length}
                                perPage={perPage}
                                onPageChange={changePage}
                                className="mt-6"
                            />
                        </>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <p className="text-xs font-medium">Loading tasks…</p>
                        </div>
                    )}

                    {!loading && tasks.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-3xl bg-white/50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 space-y-2"
                        >
                            <ListTodo className="w-8 h-8 text-zinc-300 dark:text-zinc-600 stroke-[1.5]" />
                            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                {filters.archived
                                    ? "No archived tasks"
                                    : filters.search
                                        ? "No tasks found"
                                        : "All caught up!"}
                            </p>
                            <p className="text-xs text-zinc-400 max-w-xs">
                                {filters.archived
                                    ? "Archived tasks will appear here when you archive them."
                                    : filters.search
                                        ? `No tasks matched "${filters.search}". Try adjusting your filters.`
                                        : "You have no active tasks. Add a task above to get started!"}
                            </p>
                        </motion.div>
                    )}
                </main>

            {/* Task Detail Sheet */}
            <AnimatePresence>
                {selectedTask && (
                    <TaskDetailSheet task={selectedTask} onClose={handleClose} />
                )}
            </AnimatePresence>
        </div>
    );
}

export default function TasksPage() {
    return (
        <Suspense>
            <TasksPageInner />
        </Suspense>
    );
}
