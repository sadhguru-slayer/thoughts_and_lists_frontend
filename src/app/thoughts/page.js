"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ThoughtInput from "@/components/thoughts/ThoughtInput";
import ThoughtCard from "@/components/thoughts/ThoughtCard";
import ThoughtPreview from "@/components/thoughts/ThoughtPreview";
import Pagination from "@/components/ui/Pagination";
import { useThoughts } from "@/lib/ThoughtsContext";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, CheckSquare, X, Loader2, StickyNote, Search } from "lucide-react";
import { notify } from "@/lib/notify";

function ThoughtsPageInner() {
    const { thoughts, loading, deleteThoughts, fetchThoughtById, page, perPage, pagination, changePage, searchQuery, handleSearch } = useThoughts();
    const [selectedIds, setSelectedIds] = useState([]);
    const [previewThought, setPreviewThought] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const isSelectMode = selectedIds.length > 0;

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

    // Sync preview with URL param: ?thought=<uuid>
    useEffect(() => {
        const thoughtId = searchParams.get("thought");
        if (!thoughtId) {
            setPreviewThought(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, thoughts.length, loading]);

    const handleOpen = useCallback((thought) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("thought", thought.id);
        router.push(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    const handleClosePreview = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("thought");
        const query = params.toString();
        router.push(query ? `?${query}` : "?", { scroll: false });
    }, [router, searchParams]);

    const handleEnterSelectMode = useCallback((id) => {
        setSelectedIds([id]);
    }, []);

    return (
        <>
            <div className="w-full flex-1 pt-6 px-4 md:px-0 pb-28">
                <ThoughtInput />

                {/* Search Bar */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all dark:text-zinc-200 placeholder:text-zinc-400"
                    />
                </div>

                {/* Multi-select toolbar */}
                <AnimatePresence>
                    {isSelectMode && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-3 mb-4 px-1"
                        >
                            <button
                                onClick={handleSelectAll}
                                className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                <CheckSquare className="w-4 h-4" />
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
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm disabled:opacity-60"
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
                    <>
                        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                            {thoughts.map((thought) => (
                                <div key={thought.id} className="break-inside-avoid">
                                    <ThoughtCard
                                        thought={thought}
                                        isSelected={selectedIds.includes(thought.id)}
                                        onSelect={handleSelect}
                                        onOpen={handleOpen}
                                        isSelectMode={isSelectMode}
                                        onEnterSelectMode={handleEnterSelectMode}
                                    />
                                </div>
                            ))}
                        </div>
                        <Pagination
                            currentPage={page}
                            totalPages={pagination?.totalPages ?? 1}
                            totalItems={pagination?.total ?? thoughts.length}
                            perPage={perPage}
                            onPageChange={changePage}
                            className="mt-6"
                        />
                    </>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center gap-3 mt-20 text-zinc-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <p className="text-sm">Loading notes…</p>
                    </div>
                )}

                {!loading && thoughts.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 mt-24 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <StickyNote className="w-6 h-6 text-zinc-400" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            {searchQuery ? "No notes found" : "No notes yet"}
                        </p>
                        <p className="text-xs text-zinc-400 max-w-[200px]">
                            {searchQuery ? "Try adjusting your search terms." : "Start capturing your thoughts above."}
                        </p>
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

// Wrap in Suspense because useSearchParams requires it in Next.js App Router
export default function ThoughtsPage() {
    return (
        <Suspense>
            <ThoughtsPageInner />
        </Suspense>
    );
}
