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
        // Strip out empty tags to see if there's actual content
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
                // If they click outside, do NOT auto-save. Just close if empty, or keep open if there's content so they don't lose it.
                // We'll just keep it open if there's content so they have to explicitly close or save.
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
        // If they click close, we just discard and shrink
        setTitle("");
        setContent("");
        setIsExpanded(false);
    };

    return (
        <div className="w-full max-w-xl mx-auto mb-8 relative z-10" ref={formRef}>
            <motion.div
                layout
                className={cn(
                    "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden transition-all",
                    isExpanded
                        ? "shadow-xl ring-1 ring-zinc-300 dark:ring-zinc-700"
                        : "hover:shadow-md dark:hover:border-zinc-700 cursor-text"
                )}
                onClick={() => {
                    if (!isExpanded) setIsExpanded(true);
                }}
            >
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
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

                <div className="flex items-start px-5 py-4">
                    {isExpanded ? (
                        <TiptapEditor 
                            content={content} 
                            onChange={setContent} 
                            disabled={isSubmitting} 
                            autoFocus={false}
                        />
                    ) : (
                        <div className="flex w-full items-center">
                            <span className="text-sm text-zinc-500 flex-1">Take a note...</span>
                            <button
                                type="button"
                                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors ml-2 shrink-0"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-end items-center px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur gap-3 border-t border-zinc-100 dark:border-zinc-800"
                        >
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="text-sm font-semibold tracking-wide text-zinc-600 dark:text-zinc-400 px-4 py-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={handleAddNote}
                                disabled={isSubmitting || (!title.trim() && !content.replace(/<[^>]*>?/gm, '').trim())}
                                className="flex items-center gap-2 text-sm font-bold tracking-wide text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 px-5 py-2 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Note"}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
