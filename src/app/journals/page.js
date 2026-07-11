"use client";

import { useJournal } from "@/lib/JournalContext";
import JournalList from "@/components/journal/JournalList";

export default function JournalsPage() {
  const { journals } = useJournal();

  return (
    <div className="space-y-6 pt-6 pb-20">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Your Journals</h1>
      </div>
      <JournalList journals={journals} />
    </div>
  );
}
