"use client";

import { useParams, useRouter } from "next/navigation";
import { useThoughts } from "@/lib/ThoughtsContext";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ThoughtEditPage() {
    const { id } = useParams();
    const router = useRouter();
    const { thoughts, editThought } = useThoughts();

    const thought = thoughts.find((t) => String(t.id) === String(id));

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (thought) {
            setTitle(thought.title || "");
            setContent(thought.content || "");
        }
    }, [thought]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await editThought(Number(id), { title, content });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    };

    if (!thought) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-24 gap-4">
                <p className="text-zinc-500 dark:text-zinc-400">Thought not found.</p>
                <button
                    onClick={() => router.push("/thoughts")}
                    className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                >
                    Go back
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex-1 pt-6 pb-10 flex flex-col gap-6"
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push("/thoughts")}
                    className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Back"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Edit Thought
                </h1>
                <div className="ml-auto">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm ${saved
                            ? "bg-green-500 text-white"
                            : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                            }`}
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saved ? "Saved!" : "Save"}
                    </button>
                </div>
            </div>

            {/* Title */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm px-4 py-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1 block">
                    Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give it a title..."
                    className="w-full text-base font-semibold bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
            </div>

            {/* Content */}
            <div className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm px-4 py-3 flex flex-col">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1 block">
                    Content
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your thought here..."
                    className="flex-1 w-full text-sm bg-transparent border-none outline-none resize-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 leading-relaxed min-h-[300px]"
                />
            </div>
        </motion.div>
    );
}
