"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Legacy redirect shim: /create → /journals/write
export default function CreateRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/journals/write");
    }, [router]);
    return null;
}
