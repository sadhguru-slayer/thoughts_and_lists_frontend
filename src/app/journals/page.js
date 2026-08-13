"use client";

import { useJournal } from "@/lib/JournalContext";
import JournalList from "@/components/journal/JournalList";
import Pagination from "@/components/ui/Pagination";

export default function JournalsPage() {
  const { journals, page, perPage, pagination, changePage } = useJournal();

  return (
    <div className="space-y-6 pt-6 pb-20">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Your Journals</h1>
      </div>
      <JournalList journals={journals} />
      <Pagination
        currentPage={page}
        totalPages={pagination?.totalPages ?? 1}
        totalItems={pagination?.total ?? journals.length}
        perPage={perPage}
        onPageChange={changePage}
      />
    </div>
  );
}
