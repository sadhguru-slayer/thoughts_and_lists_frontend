"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Edit2, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useThoughts } from "@/lib/ThoughtsContext";
import { useEffect, useState } from "react";

export default function ThoughtPreview({ thought, onClose }) {
    const router = useRouter();
    const { deleteThought, fetchThoughtById } = useThoughts();
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
        if (!thought?.id) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchThoughtById(thought.id)
            .then((data) => {
                if (!cancelled) setFullThought(data);
            })
            .catch(() => {
                if (!cancelled) setError("Failed to load thought.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [thought?.id, fetchThoughtById]);

    const displayThought = fullThought || thought;

    const handleDelete = async () => {
        await deleteThought(thought.id);
        onClose();
    };

    const handleEdit = () => {
        router.push(`/thoughts/${thought.id}`);
        onClose();
    };

    return (
        <AnimatePresence>
            {thought && (
                <>
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        key="sheet"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col max-h-[85dvh] max-w-2xl mx-auto rounded-t-3xl bg-white dark:bg-zinc-900 shadow-2xl border-t border-zinc-200 dark:border-zinc-800"
                    >
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        </div>

                        <div className="flex items-start justify-between px-5 pt-3 pb-2 gap-4">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug tracking-tight flex-1">
                                {displayThought.title || "Untitled"}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0 mt-0.5"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {loading ? (
                                <div className="flex items-center justify-center py-8 text-zinc-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                            ) : error ? (
                                <span className="text-red-400">{error}</span>
                            ) : displayThought.content ? (
                                displayThought.content
                            ) : (
                                <span className="text-zinc-400 italic">No content.</span>
                            )}
                        </div>

                        <div className="flex gap-3 px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                                onClick={handleEdit}
                                disabled={loading}
                                className="flex items-center gap-2 flex-1 justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-200 py-3 transition-all hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 disabled:opacity-50"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex items-center gap-2 flex-1 justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-200 py-3 transition-all hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 active:scale-95 disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
