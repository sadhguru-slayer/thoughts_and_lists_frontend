"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, Info, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANT_CONFIGS = {
    danger: {
        icon: Trash2,
        iconBg: "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400",
        confirmBtn: "bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-500",
    },
    warn: {
        icon: AlertTriangle,
        iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
        confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500",
    },
    default: {
        icon: Info,
        iconBg: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
        confirmBtn: "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900",
    },
};

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    isLoading = false,
    icon: CustomIcon,
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!open) return;
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.default;
    const IconComponent = CustomIcon || config.icon;

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, ease: "linear" }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-2xl space-y-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className={cn("p-2.5 rounded-2xl shrink-0", config.iconBg)}>
                                <IconComponent className="w-5 h-5" />
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                {title}
                            </h3>
                            {description && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all active:scale-[0.98] shadow-2xs disabled:opacity-50",
                                    config.confirmBtn
                                )}
                            >
                                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
