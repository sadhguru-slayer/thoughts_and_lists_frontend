"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

const TITLE_MAX = 60;
const CONTENT_MAX = 120;

function truncate(str, max) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
}

function stripHtml(html) {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
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
        <div
            onClick={handleClick}
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
            onTouchMove={cancelLongPress}
            className={cn(
                "group relative flex flex-col gap-2.5 rounded-2xl border p-4 shadow-xs transition-all duration-200 cursor-pointer select-none overflow-hidden",
                isSelected
                    ? "border-violet-500 bg-violet-50/60 dark:bg-violet-950/30 dark:border-violet-500 ring-2 ring-violet-400 dark:ring-violet-600"
                    : "border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/80 dark:hover:border-zinc-700"
            )}
        >
            {/* Soft accent top line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500/20 via-sky-500/20 to-emerald-500/20 group-hover:from-violet-500 group-hover:via-sky-500 group-hover:to-emerald-500 transition-all duration-300" />

            {/* Checkbox */}
            <div
                onClick={handleCheckbox}
                className={cn(
                    "absolute top-3.5 left-3 z-10 transition-all",
                    isSelectMode
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                )}
            >
                <div
                    className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shadow-xs",
                        isSelected
                            ? "bg-violet-600 border-violet-600"
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
            <div className={cn("flex flex-col gap-1.5 transition-all pt-1", isSelectMode ? "pl-7" : "pl-0")}>
                {thought.title && (
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug break-words overflow-wrap-anywhere">
                        {truncate(thought.title, TITLE_MAX)}
                    </h3>
                )}
                {(thought.content_preview || thought.content) && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed break-words overflow-wrap-anywhere">
                        {truncate(stripHtml(thought.content_preview || thought.content), CONTENT_MAX)}
                    </p>
                )}
            </div>
        </div>
    );
}
