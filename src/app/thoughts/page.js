"use client";

import { useState, useCallback } from "react";
import ThoughtInput from "@/components/thoughts/ThoughtInput";
import ThoughtCard from "@/components/thoughts/ThoughtCard";
import ThoughtPreview from "@/components/thoughts/ThoughtPreview";
import { useThoughts } from "@/lib/ThoughtsContext";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, CheckSquare, X } from "lucide-react";

export default function ThoughtsPage() {
    const { thoughts, deleteThoughts } = useThoughts();
    const [selectedIds, setSelectedIds] = useState([]);
    const [previewThought, setPreviewThought] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
            setSelectedIds([]);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelSelect = () => setSelectedIds([]);

    const handleOpen = useCallback((thought) => {
        setPreviewThought(thought);
    }, []);

    const handleClosePreview = useCallback(() => {
        setPreviewThought(null);
    }, []);

    const handleEnterSelectMode = useCallback((id) => {
        setSelectedIds([id]);
    }, []);

    return (
        <>
            <div className="w-full flex-1 pt-6 px-4 md:px-0 pb-28">
                <ThoughtInput />

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
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                    <AnimatePresence>
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
                    </AnimatePresence>
                </div>

                {thoughts.length === 0 && (
                    <div className="text-center mt-20 text-zinc-500 dark:text-zinc-400 font-medium">
                        Take a moment to jot down a thought.
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
