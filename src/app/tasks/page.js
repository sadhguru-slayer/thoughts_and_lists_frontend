"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Search, ListTodo, X, CheckCircle2 } from "lucide-react";

import TaskInput from "@/components/tasks/TaskInput";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskDetailSheet from "@/components/tasks/TaskDetailSheet";
import Pagination from "@/components/ui/Pagination";
import { useTasks } from "@/lib/TasksContext";

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

    // On mount: read ?task= from the real URL once, strip it immediately,
    // then open the modal. Never read URL params again — state only.
    useEffect(() => {
        if (didInitRef.current) return;
        didInitRef.current = true;

        const params = new URLSearchParams(window.location.search);
        const taskId = params.get("task");
        if (!taskId) return;

        // Strip query from address bar immediately so Next.js cache won't restore it
        params.delete("task");
        const qs = params.toString();
        window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);

        // Find in already-loaded list or fetch
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

    const handleOpen = useCallback((task) => {
        setSelectedTask(task);
    }, []);

    const handleClose = useCallback(() => {
        setSelectedTask(null);
    }, []);

    const handleToggleComplete = useCallback(async (task) => {
        const isCompleted = task.completed || task.status === "COMPLETED";
        if (isCompleted) {
            await uncompleteTask(task.id);
        } else {
            await completeTask(task.id);
        }
    }, [completeTask, uncompleteTask]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateFilters({ search: searchInput });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        if (!value.trim()) {
            updateFilters({ search: "" });
        }
    };

    const clearSearch = () => {
        setSearchInput("");
        updateFilters({ search: "" });
    };

    return (
        <div className="w-full min-h-[calc(100vh-4rem)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 pb-24 sm:pb-20">
                {/* Page Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs shrink-0">
                            <ListTodo className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Tasks
                            </h1>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Stay organized, manage priorities, and track daily progress.
                            </p>
                        </div>
                    </div>
                    {pagination?.total > 0 && (
                        <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{pagination.total} {pagination.total === 1 ? "task" : "tasks"}</span>
                        </div>
                    )}
                </header>

                {/* Quick Task Creation Input */}
                <section aria-label="Create Task">
                    <TaskInput />
                </section>

                {/* Search & Filters Controls */}
                <section className="space-y-3" aria-label="Task Filters">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                        <input
                            type="search"
                            placeholder="Search tasks by title or details…"
                            value={searchInput}
                            onChange={handleSearchChange}
                            className="w-full text-xs sm:text-sm rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-9 py-2.5 sm:py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-400/30 dark:focus:ring-zinc-600/30 focus:border-zinc-400 dark:focus:border-zinc-600 transition-all shadow-2xs"
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
                </section>

                {/* Task List */}
                <main className="space-y-3">
                    {!loading && tasks.length > 0 && (
                        <>
                            <div className="space-y-2.5">
                                <AnimatePresence mode="popLayout">
                                    {tasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onOpen={handleOpen}
                                            onToggleComplete={handleToggleComplete}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>

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
            </div>

            {/* Task Detail / Editing Sheet */}
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
