"use client";

import { Repeat, ChevronDown } from "lucide-react";

const RECURRENCE_OPTIONS = [
    { value: "NONE",    label: "Does not repeat" },
    { value: "DAILY",   label: "Daily" },
    { value: "WEEKLY",  label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
];

export default function RecurrenceSelect({ value = "NONE", onChange, disabled = false }) {
    return (
        <div className="relative flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2.5 transition-all hover:border-zinc-300 dark:hover:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-300 dark:focus-within:ring-zinc-600">
            <Repeat className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className="flex-1 text-sm font-medium bg-transparent border-none outline-none text-zinc-800 dark:text-zinc-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-5"
            >
                {RECURRENCE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {value !== "NONE" && (
                <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shrink-0">
                    {value.charAt(0) + value.slice(1).toLowerCase()}
                </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 pointer-events-none" />
        </div>
    );
}
