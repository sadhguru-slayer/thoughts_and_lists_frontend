"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Edit2, Trash2, Loader2, Star, Pin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useThoughts } from "@/lib/ThoughtsContext";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ThoughtPreview({ thought, onClose }) {
    const router = useRouter();
    const { deleteThought, fetchThoughtById, togglePin, toggleStar } = useThoughts();
    const [fullThought, setFullThought] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    useEffect(() => {
        if (!thought?.id && !thought?.uuid) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        const targetId = thought.uuid || thought.id;
        fetchThoughtById(targetId)
            .then((data) => {
                if (!cancelled) setFullThought(data);
            })
            .catch(() => {
                if (!cancelled) setError("Failed to load note.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [thought?.id, thought?.uuid, fetchThoughtById]);

    const displayThought = fullThought || thought;

    const handleDelete = async () => {
        const targetId = displayThought.uuid || displayThought.id || thought.uuid || thought.id;
        await deleteThought(targetId);
        onClose();
    };

    const handleEdit = () => {
        const targetId = displayThought.uuid || displayThought.id || thought.uuid || thought.id;
        if (targetId) {
            // Directly push to the note edit page without triggering query clear
            router.push(`/thoughts/${targetId}`);
        }
    };

    return (
        <AnimatePresence>
            {thought && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "linear" }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
                    />
                    
                    {/* Smooth Morphing Sheet */}
                    <motion.div
                        key="sheet"
                        layout
                        initial={{ y: "100%", opacity: 0.9 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col max-h-[85dvh] max-w-2xl mx-auto rounded-t-3xl bg-white dark:bg-zinc-900 shadow-2xl border-t border-zinc-200 dark:border-zinc-800 overflow-hidden"
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1 shrink-0">
                            <div className="w-10 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        </div>

                        {/* Top bar header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800/80 gap-3 shrink-0">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                                    {displayThought.title || "Untitled Note"}
                                </h2>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => toggleStar(displayThought.uuid || displayThought.id, displayThought.is_starred)}
                                    className={cn("p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors", displayThought.is_starred ? "text-amber-500" : "text-zinc-400")}
                                    title={displayThought.is_starred ? "Unstar note" : "Star note"}
                                >
                                    <Star className="w-4 h-4" fill={displayThought.is_starred ? "currentColor" : "none"} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => togglePin(displayThought.uuid || displayThought.id, displayThought.is_pinned)}
                                    className={cn("p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors", displayThought.is_pinned ? "text-blue-500" : "text-zinc-400")}
                                    title={displayThought.is_pinned ? "Unpin note" : "Pin note"}
                                >
                                    <Pin className="w-4 h-4" fill={displayThought.is_pinned ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-1"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Note Body Preview */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed preview-content">
                            {loading ? (
                                <div className="flex items-center justify-center py-12 text-zinc-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                            ) : error ? (
                                <span className="text-red-500 font-medium">{error}</span>
                            ) : displayThought.content ? (
                                <div dangerouslySetInnerHTML={{ __html: displayThought.content }} />
                            ) : (
                                <span className="text-zinc-400 italic">No content in this note.</span>
                            )}
                            <style jsx global>{`
                                .preview-content p {
                                    margin-bottom: 0.5rem;
                                }
                                .preview-content strong {
                                    font-weight: 700;
                                }
                                .preview-content pre {
                                    background: #f4f4f5;
                                    border-radius: 0.5rem;
                                    padding: 0.75rem 1rem;
                                    color: #27272a;
                                    font-family: monospace;
                                    font-size: 0.75rem;
                                    overflow-x: auto;
                                    margin-top: 0.5rem;
                                    margin-bottom: 0.5rem;
                                }
                                .preview-content code {
                                    background: #f4f4f5;
                                    padding: 0.15rem 0.3rem;
                                    border-radius: 0.25rem;
                                    font-family: monospace;
                                    font-size: 0.75rem;
                                }
                                .dark .preview-content pre, .dark .preview-content code {
                                    background: #27272a;
                                    color: #e4e4e7;
                                }
                            `}</style>
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="flex gap-2 px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/80 shrink-0">
                            <button
                                onClick={handleEdit}
                                disabled={loading}
                                className="flex items-center gap-2 flex-1 justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold py-2.5 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-2xs"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit Note
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex items-center gap-2 flex-1 justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-red-600 dark:text-red-400 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Note
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
