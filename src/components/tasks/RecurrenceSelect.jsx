"use client";

import { Repeat, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatFriendlyDateTime } from "@/lib/taskUtils";

const RECURRENCE_OPTIONS = [
    { value: "NONE", label: "Does not repeat", hint: null },
    { value: "DAILY", label: "Daily", hint: "Repeats every day at your set time" },
    { value: "WEEKLY", label: "Weekly", hint: "Repeats every week on the same day & time" },
    { value: "MONTHLY", label: "Monthly", hint: "Repeats every month on the same date & time" },
    // { value: "TESTING_SEC", label: "Testing (1m)", hint: "Repeats every 1 minute for testing" },
];

export default function RecurrenceSelect({ value = "NONE", onChange, dueDate, disabled = false }) {
    const selectedOption = RECURRENCE_OPTIONS.find((opt) => opt.value === value);

    return (
        <div className="space-y-2">
            <div className="relative flex items-center gap-2">
                <div className="absolute left-3 z-10 pointer-events-none text-zinc-400">
                    <Repeat className="w-4 h-4" />
                </div>
                <Select value={value} onValueChange={onChange} disabled={disabled}>
                    <SelectTrigger className="w-full pl-9 pr-3 py-2.5 h-auto text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 transition-all hover:border-zinc-300 dark:hover:border-zinc-600 focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600">
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
                {value !== "NONE" && (
                    <span className="absolute right-9 z-10 pointer-events-none text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shrink-0">
                        {value.charAt(0) + value.slice(1).toLowerCase()}
                    </span>
                )}
            </div>

            {/* Recurrence Explanation Banner */}
            {value !== "NONE" && selectedOption?.hint && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <p className="font-semibold">{selectedOption.hint}</p>
                        <p className="text-[11px] opacity-90">
                            {dueDate ? (
                                <>First occurrence starts on <strong>{formatFriendlyDateTime(dueDate)}</strong>. Marking it complete automatically schedules the next occurrence.</>
                            ) : (
                                <>Please pick a start date & time above so the system knows when to trigger the first reminder.</>
                            )}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
