"use client";

import { Repeat } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatFriendlyDateTime } from "@/lib/taskUtils";

const RECURRENCE_OPTIONS = [
    { value: "NONE", label: "Does not repeat" },
    { value: "DAILY", label: "Every day (Daily)" },
    { value: "WEEKLY", label: "Every week (Weekly)" },
    { value: "MONTHLY", label: "Every month (Monthly)" },
];

export default function RecurrenceSelect({ value = "NONE", onChange, dueDate, disabled = false }) {
    return (
        <div className="space-y-1.5">
            <div className="relative flex items-center">
                <div className="absolute left-3 z-10 pointer-events-none text-zinc-400">
                    <Repeat className="w-3.5 h-3.5" />
                </div>
                <Select value={value} onValueChange={onChange} disabled={disabled}>
                    <SelectTrigger className="w-full pl-8 pr-3 py-2 h-auto text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                        <SelectValue placeholder="Select Recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                        {RECURRENCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {value !== "NONE" && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium pl-1">
                    {dueDate ? (
                        <>First run: <strong>{formatFriendlyDateTime(dueDate)}</strong></>
                    ) : (
                        <>Pick a due date to start recurrence cycle.</>
                    )}
                </p>
            )}
        </div>
    );
}
