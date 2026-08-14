"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThoughts } from "@/lib/ThoughtsContext";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import TiptapEditor from "./TiptapEditor";

export default function ThoughtInput() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { addThought } = useThoughts();
    const formRef = useRef(null);

    const submitNote = useCallback(async () => {
        const plainContent = content.replace(/<[^>]*>?/gm, '').trim();
        if (!title.trim() && !plainContent) {
            setIsExpanded(false);
            return;
        }

        try {
            setIsSubmitting(true);
            await addThought({ title, content });
            setTitle("");
            setContent("");
            setIsExpanded(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }, [title, content, addThought]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (formRef.current && !formRef.current.contains(event.target)) {
                const plainContent = content.replace(/<[^>]*>?/gm, '').trim();
                if (!title.trim() && !plainContent) {
                    setIsExpanded(false);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [title, content]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await submitNote();
    };

    const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setTitle("");
        setContent("");
        setIsExpanded(false);
    };

    return (
        <div className="w-full max-w-xl mx-auto mb-6 relative z-10" ref={formRef}>
            <motion.div
                layout
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                    "bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-2xs overflow-hidden transition-colors",
                    isExpanded
                        ? "ring-1 ring-zinc-300 dark:ring-zinc-700 shadow-md"
                        : "hover:shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 cursor-text"
                )}
                onClick={() => {
                    if (!isExpanded) setIsExpanded(true);
                }}
            >
                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="px-5 pt-4 pb-2"
                        >
                            <input
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full text-base font-bold bg-transparent border-none outline-none placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                                autoFocus
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-start px-5 py-3.5">
                    {isExpanded ? (
                        <TiptapEditor 
                            content={content} 
                            onChange={setContent} 
                            disabled={isSubmitting} 
                            autoFocus={false}
                        />
                    ) : (
                        <div className="flex w-full items-center">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-1">Take a note...</span>
                            <button
                                type="button"
                                className="p-1 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors ml-2 shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="flex justify-end items-center px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-xs gap-2 border-t border-zinc-100 dark:border-zinc-800/80"
                        >
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 px-3.5 py-1.5 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={handleAddNote}
                                disabled={isSubmitting || (!title.trim() && !content.replace(/<[^>]*>?/gm, '').trim())}
                                className="flex items-center gap-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 px-4 py-1.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs active:scale-[0.98]"
                            >
                                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add Note"}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
