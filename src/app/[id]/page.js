"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// Legacy redirect shim: /[id] → /journals/[id]
export default function JournalDetailRedirect() {
    const router = useRouter();
    const { id } = useParams();
    useEffect(() => {
        if (id) router.replace(`/journals/${id}`);
    }, [router, id]);
    return null;
}
