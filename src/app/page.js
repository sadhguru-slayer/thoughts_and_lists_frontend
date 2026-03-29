"use client";

import { useJournal } from "@/lib/JournalContext";
import JournalList from "@/components/journal/JournalList";
import JournalAnalytics from "@/components/journal/JournalAnalytics";

export default function Home() {
  const { journals } = useJournal();

  return (
    <div className="space-y-6">
      <JournalAnalytics />
      <JournalList journals={journals} />
    </div>
  );
}
