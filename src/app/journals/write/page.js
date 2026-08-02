"use client";

import { useRouter } from "next/navigation";
import { useJournal } from "@/lib/JournalContext";
import JournalCreateForm from "@/components/journal/JournalCreateForm";
import { notify } from "@/lib/notify";

export default function CreateJournalPage() {
    const router = useRouter();
    const { templates, latestJournalStructure, handleCreateSubmit, handleDeleteTemplate } = useJournal();

    const handleCancel = () => {
        router.push("/journals");
    };

    const handleSubmit = async (data) => {
        try {
            await handleCreateSubmit(data);
            notify.success("Journal saved");
            router.push("/journals");
        } catch (err) {
            notify.error("Failed to save journal");
            throw err; // re-throw so the form's isSubmitting resets
        }
    };

    return (
        <JournalCreateForm
            templates={templates}
            latestStructure={latestJournalStructure}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            onDeleteTemplate={handleDeleteTemplate}
        />
    );
}
