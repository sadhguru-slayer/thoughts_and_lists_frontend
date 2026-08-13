"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Pagination({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    perPage = 20,
    onPageChange,
    className
}) {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalItems);

    // Generate page numbers array with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push("...");
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs", className)}>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                Showing <span className="font-bold text-zinc-800 dark:text-zinc-200">{totalItems > 0 ? startItem : 0}</span> to{" "}
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{endItem}</span> of{" "}
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{totalItems}</span> results
            </p>

            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md p-1 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center justify-center p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((p, idx) =>
                    p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-zinc-400">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={cn(
                                "min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all active:scale-95",
                                p === currentPage
                                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="flex items-center justify-center p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
