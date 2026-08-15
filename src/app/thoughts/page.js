"use client";

import { useState, useCallback, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ThoughtInput from "@/components/thoughts/ThoughtInput";
import ThoughtCard from "@/components/thoughts/ThoughtCard";
import ThoughtPreview from "@/components/thoughts/ThoughtPreview";
import Pagination from "@/components/ui/Pagination";
import { useThoughts } from "@/lib/ThoughtsContext";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, CheckSquare, X, Loader2, StickyNote, Search, Pin, ListFilter, ArrowUpDown } from "lucide-react";
import { notify } from "@/lib/notify";

function ThoughtsPageInner() {
    const { thoughts, loading, deleteThoughts, fetchThoughtById, page, perPage, pagination, changePage, searchQuery, handleSearch } = useThoughts();
    const [selectedIds, setSelectedIds] = useState([]);
    const [previewThought, setPreviewThought] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filterType, setFilterType] = useState("all"); // "all" | "pinned" | "starred"
    const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest" | "title"
    const searchParams = useSearchParams();

    const isSelectMode = selectedIds.length > 0;

    const processedThoughts = useMemo(() => {
        let result = [...thoughts];

        if (filterType === "pinned") {
            result = result.filter(t => t.is_pinned);
        } else if (filterType === "starred") {
            result = result.filter(t => t.is_starred);
        }

        result.sort((a, b) => {
            if (sortOrder === "title") {
                return (a.title || "").localeCompare(b.title || "");
            }
            const aTime = new Date(a.created_at || a.updated_at || 0).getTime();
            const bTime = new Date(b.created_at || b.updated_at || 0).getTime();
            return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
        });

        return result;
    }, [thoughts, filterType, sortOrder]);

    const pinnedThoughts = useMemo(() => {
        if (filterType !== "all") return [];
        return processedThoughts.filter(t => t.is_pinned);
    }, [processedThoughts, filterType]);

    const otherThoughts = useMemo(() => {
        if (filterType !== "all") return processedThoughts;
        return processedThoughts.filter(t => !t.is_pinned);
    }, [processedThoughts, filterType]);

    const handleSelect = useCallback((id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }, []);

    const handleSelectAll = () => {
        if (selectedIds.length === thoughts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(thoughts.map((t) => t.id));
        }
    };

    const handleBulkDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteThoughts(selectedIds);
            notify.success(`${selectedIds.length} note${selectedIds.length > 1 ? "s" : ""} deleted`);
            setSelectedIds([]);
        } catch (err) {
            notify.error("Failed to delete notes");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelSelect = () => setSelectedIds([]);

    useEffect(() => {
        const thoughtId = searchParams.get("thought");
        if (!thoughtId) {
            setPreviewThought(null);
            return;
        }

        if (previewThought && String(previewThought.id) === String(thoughtId)) {
            return;
        }

        const found = thoughts.find((t) => String(t.id) === String(thoughtId));
        if (found) {
            setPreviewThought(found);
        } else if (!loading) {
            fetchThoughtById(thoughtId)
                .then((data) => { if (data) setPreviewThought(data); })
                .catch(() => {});
        }
    }, [searchParams, thoughts, loading, fetchThoughtById, previewThought]);

    const handleOpen = useCallback((thought) => {
        setPreviewThought(thought);
        const url = new URL(window.location.href);
        url.searchParams.set("thought", thought.id);
        window.history.replaceState(null, "", url.pathname + "?" + url.searchParams.toString());
    }, []);

    const handleClosePreview = useCallback(() => {
        setPreviewThought(null);
        const url = new URL(window.location.href);
        url.searchParams.delete("thought");
        const qs = url.searchParams.toString();
        window.history.replaceState(null, "", qs ? url.pathname + "?" + qs : url.pathname);
    }, []);

    const handleEnterSelectMode = useCallback((id) => {
        setSelectedIds([id]);
    }, []);

    return (
        <>
            <div className="max-w-5xl mx-auto space-y-6 pt-4 pb-20">

                {/* Header Greeting / Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                            <StickyNote className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                            Notes
                        </h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Capture quick thoughts, ideas, and structured reflections.
                        </p>
                    </div>
                </div>

                {/* Thought Input */}
                <ThoughtInput />

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition-all dark:text-zinc-200 placeholder:text-zinc-400 shadow-2xs"
                        />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Filter Dropdown */}
                        <div className="relative flex items-center shrink-0">
                            <ListFilter className="absolute left-2.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer appearance-none shadow-2xs"
                            >
                                <option value="all">All Notes</option>
                                <option value="pinned">Pinned Only</option>
                                <option value="starred">Starred Only</option>
                            </select>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative flex items-center shrink-0">
                            <ArrowUpDown className="absolute left-2.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer appearance-none shadow-2xs"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="title">Title (A-Z)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Multi-select toolbar */}
                <AnimatePresence>
                    {isSelectMode && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-3 px-1"
                        >
                            <button
                                onClick={handleSelectAll}
                                className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                <CheckSquare className="w-3.5 h-3.5" />
                                {selectedIds.length === thoughts.length ? "Deselect All" : "Select All"}
                            </button>

                            <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                {selectedIds.length} selected
                            </span>

                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    onClick={handleCancelSelect}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    aria-label="Cancel selection"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all active:scale-95 shadow-2xs disabled:opacity-60"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    {isDeleting ? "Deleting…" : `Delete ${selectedIds.length}`}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notes grid */}
                {!loading && (
                    <div className="space-y-8">
                        {pinnedThoughts.length > 0 && (
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
                                    <Pin className="w-3.5 h-3.5" /> Pinned
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {pinnedThoughts.map((thought) => (
                                        <ThoughtCard
                                            key={thought.id}
                                            thought={thought}
                                            isSelected={selectedIds.includes(thought.id)}
                                            onSelect={handleSelect}
                                            onOpen={handleOpen}
                                            isSelectMode={isSelectMode}
                                            onEnterSelectMode={handleEnterSelectMode}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {otherThoughts.length > 0 && (
                            <div>
                                {pinnedThoughts.length > 0 && (
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
                                        Others
                                    </h3>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {otherThoughts.map((thought) => (
                                        <ThoughtCard
                                            key={thought.id}
                                            thought={thought}
                                            isSelected={selectedIds.includes(thought.id)}
                                            onSelect={handleSelect}
                                            onOpen={handleOpen}
                                            isSelectMode={isSelectMode}
                                            onEnterSelectMode={handleEnterSelectMode}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <Pagination
                            currentPage={page}
                            totalPages={pagination?.totalPages ?? 1}
                            totalItems={pagination?.total ?? thoughts.length}
                            perPage={perPage}
                            onPageChange={changePage}
                            className="mt-6"
                        />
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <p className="text-xs font-medium">Loading notes…</p>
                    </div>
                )}

                {!loading && processedThoughts.length === 0 && (
                    <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 text-xs italic border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        {searchQuery || filterType !== "all" ? "No matching notes found." : "No notes yet. Create one above to get started!"}
                    </div>
                )}
            </div>

            {/* Bottom preview sheet */}
            <AnimatePresence>
                {previewThought && (
                    <ThoughtPreview
                        thought={previewThought}
                        onClose={handleClosePreview}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export default function ThoughtsPage() {
    return (
        <Suspense>
            <ThoughtsPageInner />
        </Suspense>
    );
}
