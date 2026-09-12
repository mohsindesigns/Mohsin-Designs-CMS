"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This standalone homepage editor is superseded by the real Page editor
// (/admin/pages/[id]) and was never linked from the admin nav. Its save path
// wrote to a "home" section that /api/content silently discards, so any edit
// made here never persisted. Kept as a redirect (rather than deleted outright)
// in case it was bookmarked.
export default function LegacyHomeEditorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/pages");
  }, [router]);

  return null;
}
