"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    AlertTriangle, 
    Trash2, 
    CheckCircle2, 
    AlertOctagon, 
    Info, 
    ShieldAlert, 
    ShieldCheck, 
    X, 
    Loader2, 
    Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

export const MODAL_VARIANTS = {
    // 1. Destructive / Danger
    danger: {
        icon: Trash2,
        iconBg: "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/50",
        confirmBtn: "bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-500 shadow-red-500/10",
        defaultConfirmText: "Delete",
    },
    // 2. Warning / Caution
    warning: {
        icon: AlertTriangle,
        iconBg: "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50",
        confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500 shadow-amber-500/10",
        defaultConfirmText: "Proceed",
    },
    // 3. Success / Completed
    success: {
        icon: CheckCircle2,
        iconBg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50",
        confirmBtn: "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-emerald-500/10",
        defaultConfirmText: "Got it",
    },
    // 4. Error / Failure
    error: {
        icon: AlertOctagon,
        iconBg: "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50",
        confirmBtn: "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900",
        defaultConfirmText: "Okay",
    },
    // 5. Permission / Access
    permission: {
        icon: ShieldAlert,
        iconBg: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50",
        confirmBtn: "bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-indigo-500/10",
        defaultConfirmText: "Grant Access",
    },
    // 6. Info / General
    info: {
        icon: Info,
        iconBg: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50",
        confirmBtn: "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900",
        defaultConfirmText: "Continue",
    },
};

export default function ActionModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    description,
    confirmText,
    cancelText = "Cancel",
    variant = "danger", // "danger" | "warning" | "success" | "error" | "permission" | "info"
    isLoading = false,
    showCancel = true,
    icon: CustomIcon,
    children,
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const config = MODAL_VARIANTS[variant] || MODAL_VARIANTS.info;
    const IconComponent = CustomIcon || config.icon;
    const finalConfirmText = confirmText || config.defaultConfirmText;

    return (
        <AnimatePresence>
            {isOpen && (
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
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-2xl space-y-4 overflow-hidden"
                    >
                        {/* Top bar with Icon & Close button */}
                        <div className="flex items-start justify-between gap-3">
                            <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs", config.iconBg)}>
                                <IconComponent className="w-5 h-5" />
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                aria-label="Close modal"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1.5">
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
                                {title}
                            </h3>
                            {description && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Custom Body / Children if provided */}
                        {children && (
                            <div className="py-1 text-xs text-zinc-700 dark:text-zinc-300">
                                {children}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                            {showCancel && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                            )}
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
                                {finalConfirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
