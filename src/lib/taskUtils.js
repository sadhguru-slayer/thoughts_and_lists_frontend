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
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const startOfDayAfterTomorrow = new Date(startOfTomorrow);
    startOfDayAfterTomorrow.setDate(startOfDayAfterTomorrow.getDate() + 1);
    const startOfNextWeek = new Date(startOfToday);
    startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);

    const groups = [
        { 
            key: "overdue",   
            label: "Overdue",     
            emoji: "🔴", 
            badgeStyle: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 dark:border-red-500/30",
            dotColor: "bg-red-500",
            tasks: [] 
        },
        { 
            key: "today",     
            label: "Today",        
            emoji: "📅", 
            badgeStyle: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30",
            dotColor: "bg-amber-500",
            tasks: [] 
        },
        { 
            key: "tomorrow",  
            label: "Tomorrow",     
            emoji: "🌅", 
            badgeStyle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30",
            dotColor: "bg-blue-500",
            tasks: [] 
        },
        { 
            key: "this_week", 
            label: "This Week",    
            emoji: "📆", 
            badgeStyle: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 dark:border-indigo-500/30",
            dotColor: "bg-indigo-500",
            tasks: [] 
        },
        { 
            key: "later",     
            label: "Later",        
            emoji: "🗓️",  
            badgeStyle: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20 dark:border-zinc-500/30",
            dotColor: "bg-zinc-400",
            tasks: [] 
        },
        { 
            key: "no_date",   
            label: "No Due Date",  
            emoji: "📋", 
            badgeStyle: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20 dark:border-zinc-500/30",
            dotColor: "bg-zinc-400",
            tasks: [] 
        },
        { 
            key: "completed", 
            label: "Completed",    
            emoji: "✅", 
            badgeStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30",
            dotColor: "bg-emerald-500",
            tasks: [] 
        },
    ];

    for (const task of tasks) {
        const isDone = task.completed || task.status === "COMPLETED" || task.status === "CANCELLED";

        if (isDone) {
            groups.find(g => g.key === "completed").tasks.push(task);
            continue;
        }

        if (!task.due_date) {
            groups.find(g => g.key === "no_date").tasks.push(task);
            continue;
        }

        const due = new Date(task.due_date);

        if (due < startOfToday) {
            groups.find(g => g.key === "overdue").tasks.push(task);
        } else if (due < startOfTomorrow) {
            groups.find(g => g.key === "today").tasks.push(task);
        } else if (due < startOfDayAfterTomorrow) {
            groups.find(g => g.key === "tomorrow").tasks.push(task);
        } else if (due < startOfNextWeek) {
            groups.find(g => g.key === "this_week").tasks.push(task);
        } else {
            groups.find(g => g.key === "later").tasks.push(task);
        }
    }

    return groups.filter(g => g.tasks.length > 0);
}
