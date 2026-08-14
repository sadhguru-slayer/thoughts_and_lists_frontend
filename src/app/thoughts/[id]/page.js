"use client";

import { useParams, useRouter } from "next/navigation";
import { useThoughts } from "@/lib/ThoughtsContext";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2, StickyNote } from "lucide-react";
import { motion } from "framer-motion";
import TiptapEditor from "@/components/thoughts/TiptapEditor";

export default function ThoughtEditPage() {
    const { id } = useParams();
    const router = useRouter();
    const { editThought, fetchThoughtById } = useThoughts();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetchThoughtById(id)
            .then((thought) => {
                if (cancelled) return;
                setTitle(thought.title || "");
                setContent(thought.content || "");
            })
            .catch(() => {
                if (!cancelled) setNotFound(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [id, fetchThoughtById]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await editThought(id, { title, content });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full py-24 text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-24 gap-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Note not found.</p>
                <button
                    onClick={() => router.push("/thoughts")}
                    className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
                >
                    Back to Notes
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-6 pt-4 pb-20"
        >
            <div className="flex items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/thoughts")}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        aria-label="Back to Notes"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <StickyNote className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        Edit Note
                    </h1>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-2xs ${
                        saved
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90"
                    }`}
                >
                    {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Save className="w-3.5 h-3.5" />
                    )}
                    {saved ? "Saved!" : "Save Note"}
                </button>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs p-4 space-y-4">
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 block">
                        Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note title..."
                        className="w-full text-base font-bold bg-transparent border-b border-zinc-200 dark:border-zinc-800 pb-2 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 block">
                        Content
                    </label>
                    <TiptapEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Write your note here..."
                        disabled={saving}
                        autoFocus={true}
                    />
                </div>
            </div>
        </motion.div>
    );
}
