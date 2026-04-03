"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TITLE_MAX = 60;
const CONTENT_MAX = 120;

function truncate(str, max) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
}

export default function ThoughtCard({ thought, isSelected, onSelect, onOpen, isSelectMode, onEnterSelectMode }) {
    const longPressTimer = useRef(null);
    const didLongPress = useRef(false);

    const startLongPress = useCallback(() => {
        didLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            didLongPress.current = true;
            onEnterSelectMode(thought.id);
        }, 500);
    }, [thought.id, onEnterSelectMode]);

    const cancelLongPress = useCallback(() => {
        clearTimeout(longPressTimer.current);
    }, []);

    const handleClick = useCallback(() => {
        if (didLongPress.current) return; // long-press already handled
        if (isSelectMode) {
            onSelect(thought.id);
        } else {
            onOpen(thought);
        }
    }, [isSelectMode, thought, onSelect, onOpen]);

    const handleCheckbox = (e) => {
        e.stopPropagation();
        onSelect(thought.id);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClick}
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
            onTouchMove={cancelLongPress}
            className={cn(
                "group relative flex flex-col gap-2 rounded-2xl border p-4 shadow-sm transition-all cursor-pointer select-none",
                isSelected
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-500 ring-2 ring-blue-300 dark:ring-blue-600"
                    : "border-zinc-200 bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            )}
        >
            {/* Checkbox */}
            <div
                onClick={handleCheckbox}
                className={cn(
                    "absolute top-2.5 left-2.5 z-10 transition-all",
                    isSelectMode
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                )}
            >
                <div
                    className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600"
                    )}
                >
                    {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className={cn("flex flex-col gap-1 transition-all", isSelectMode ? "pl-7" : "pl-0")}>
                {thought.title && (
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
                        {truncate(thought.title, TITLE_MAX)}
                    </h3>
                )}
                {thought.content && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {truncate(thought.content, CONTENT_MAX)}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
