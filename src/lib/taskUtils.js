const LOCALE = "en-US";

export const PRIORITY_CONFIG = {
    LOW: { label: "Low", className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
    MEDIUM: { label: "Medium", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" },
    HIGH: { label: "High", className: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300" },
    URGENT: { label: "Urgent", className: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300" },
};

export const STATUS_CONFIG = {
    TODO: { label: "To do", className: "text-zinc-500 dark:text-zinc-400" },
    IN_PROGRESS: { label: "In progress", className: "text-blue-600 dark:text-blue-400" },
    COMPLETED: { label: "Completed", className: "text-green-600 dark:text-green-400" },
    CANCELLED: { label: "Cancelled", className: "text-zinc-400 dark:text-zinc-500" },
};

export function formatTaskDate(iso) {
    if (!iso) return null;
    try {
        return new Intl.DateTimeFormat(LOCALE, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

export function formatFriendlyDateTime(value) {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));

    const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });

    if (diffDays === 0) return `Today at ${timeStr}`;
    if (diffDays === 1) return `Tomorrow at ${timeStr}`;
    if (diffDays === -1) return `Yesterday at ${timeStr}`;
    if (diffDays > 1 && diffDays < 7) {
        const weekday = d.toLocaleDateString([], { weekday: "short" });
        return `${weekday} at ${timeStr}`;
    }

    const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
    return `${dateStr} at ${timeStr}`;
}

export function toDatetimeLocalValue(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value) {
    if (!value) return null;
    return new Date(value).toISOString();
}

export function isOverdue(task) {
    if (!task?.due_date || task.completed || task.status === "COMPLETED") return false;
    return new Date(task.due_date) < new Date();
}

export function getPresetDatetime(preset, customTime = "09:00") {
    const now = new Date();
    let target = new Date();
    const [hours, minutes] = customTime.split(":").map(Number);

    if (preset === "today") {
        target.setHours(hours, minutes, 0, 0);
        if (target < now) {
            // If today's preset time has passed, set to 1 hour from now
            target = new Date(now.getTime() + 60 * 60 * 1000);
        }
    } else if (preset === "tomorrow") {
        target.setDate(target.getDate() + 1);
        target.setHours(hours, minutes, 0, 0);
    } else if (preset === "next_week") {
        target.setDate(target.getDate() + 7);
        target.setHours(hours, minutes, 0, 0);
    } else if (preset === "in_1_hour") {
        target = new Date(now.getTime() + 60 * 60 * 1000);
    }

    return toDatetimeLocalValue(target);
}

export function groupTasksByDate(tasks) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(startOfToday);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const overdueGroup = {
        key: "overdue",
        label: "Overdue",
        emoji: "🔴",
        badgeStyle: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 dark:border-red-500/30",
        dotColor: "bg-red-500",
        tasks: [],
    };
    const olderGroup = {
        key: "older",
        label: "Older (> 1 month)",
        emoji: "📦",
        badgeStyle: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20 dark:border-zinc-500/30",
        dotColor: "bg-zinc-500",
        tasks: [],
    };
    const noDateGroup = {
        key: "no_date",
        label: "No Due Date",
        emoji: "📋",
        badgeStyle: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20 dark:border-zinc-500/30",
        dotColor: "bg-zinc-400",
        tasks: [],
    };
    const completedGroup = {
        key: "completed",
        label: "Completed",
        emoji: "✅",
        badgeStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30",
        dotColor: "bg-emerald-500",
        tasks: [],
    };

    const dateMap = new Map();

    for (const task of tasks) {
        const isDone = task.completed || task.status === "COMPLETED" || task.status === "CANCELLED";
        if (isDone) {
            completedGroup.tasks.push(task);
            continue;
        }

        if (!task.due_date) {
            noDateGroup.tasks.push(task);
            continue;
        }

        const due = new Date(task.due_date);
        const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());

        if (dueDateOnly < startOfToday) {
            if (dueDateOnly < thirtyDaysAgo) {
                olderGroup.tasks.push(task);
            } else {
                overdueGroup.tasks.push(task);
            }
        } else {
            const dateKey = `${dueDateOnly.getFullYear()}-${String(dueDateOnly.getMonth() + 1).padStart(2, '0')}-${String(dueDateOnly.getDate()).padStart(2, '0')}`;
            if (!dateMap.has(dateKey)) {
                let label = '';
                const diffDays = Math.round((dueDateOnly - startOfToday) / (1000 * 60 * 60 * 24));
                const weekday = dueDateOnly.toLocaleDateString('en-US', { weekday: 'short' });
                const monthDay = dueDateOnly.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                if (diffDays === 0) {
                    label = `Today • ${weekday}, ${monthDay}`;
                } else if (diffDays === 1) {
                    label = `Tomorrow • ${weekday}, ${monthDay}`;
                } else {
                    label = `${weekday}, ${monthDay}`;
                }

                dateMap.set(dateKey, {
                    key: `date-${dateKey}`,
                    label,
                    emoji: "📅",
                    badgeStyle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30",
                    dotColor: "bg-blue-500",
                    dateValue: dueDateOnly.getTime(),
                    tasks: [],
                });
            }
            dateMap.get(dateKey).tasks.push(task);
        }
    }

    const sortedDateGroups = Array.from(dateMap.values()).sort((a, b) => a.dateValue - b.dateValue);

    const clusterList = [];
    if (overdueGroup.tasks.length > 0) clusterList.push(overdueGroup);
    for (const dg of sortedDateGroups) {
        if (dg.tasks.length > 0) clusterList.push(dg);
    }
    if (noDateGroup.tasks.length > 0) clusterList.push(noDateGroup);
    if (olderGroup.tasks.length > 0) clusterList.push(olderGroup);
    if (completedGroup.tasks.length > 0) clusterList.push(completedGroup);

    return clusterList;
}
