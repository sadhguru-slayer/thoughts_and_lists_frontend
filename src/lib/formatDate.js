/** Fixed locale so SSR and browser produce identical strings (avoids hydration mismatch). */
const LOCALE = "en-US";

export function formatJournalListDate(iso) {
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      weekday: "short",
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

export function formatJournalDetailDate(iso) {
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatNoteDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const timeStr = new Intl.DateTimeFormat(LOCALE, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);

    if (isToday) return `Today, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;
    
    const isThisYear = d.getFullYear() === now.getFullYear();
    if (isThisYear) {
      return new Intl.DateTimeFormat(LOCALE, {
        month: "short",
        day: "numeric",
      }).format(d);
    }
    
    return new Intl.DateTimeFormat(LOCALE, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}
