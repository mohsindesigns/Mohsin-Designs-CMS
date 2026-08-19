"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Phone, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import ContactEditor from "@/components/admin/editors/ContactEditor";

export default function ContactAdminPage() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [pageId, setPageId] = useState<string>("");

  useEffect(() => {
    // First try fetching page from /api/admin/pages for slug 'contact'
    fetch("/api/admin/pages")
      .then(res => res.json())
      .then(json => {
        const pages = json.pages || json || [];
        const contactPage = pages.find((p: any) => p.slug === "contact" || p.slug === "/contact");
        if (contactPage) {
          setPageId(contactPage._id || contactPage.id || "");
          setData(contactPage.content || {});
        } else {
          // Fallback to /api/content
          fetch("/api/content")
            .then(res => res.json())
            .then(cData => setData(cData))
            .catch(() => setData({}));
        }
      })
      .catch(() => {
        fetch("/api/content")
          .then(res => res.json())
          .then(cData => setData(cData))
          .catch(() => setData({}));
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      if (pageId) {
        const res = await fetch(`/api/admin/pages/${pageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: data }),
        });
        if (!res.ok) throw new Error("Failed to save page");
      } else {
        const res = await fetch("/api/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to save content");
      }

      setMessage("Saved successfully!");
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      console.error(err);
      setMessage("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2271b1]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-4">
      {/* WordPress Top Action Bar */}
      <div className="flex items-center justify-between bg-white border border-[#c3c4c7] px-4 py-3 rounded-[3px] shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="text-[#2271b1] hover:text-[#135e96] flex items-center gap-1 text-xs font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Pages</span>
          </Link>
          <span className="text-[#c3c4c7]">|</span>
          <h1 className="text-base font-bold text-[#1d2327]">Contact Page Editor</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            target="_blank"
            className="inline-flex items-center gap-1 border border-[#c3c4c7] text-[#2271b1] hover:bg-[#f6f7f7] px-3 py-1.5 rounded-[3px] text-xs font-semibold transition-all"
          >
            <span>Preview Live</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white px-4 py-1.5 rounded-[3px] text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving..." : "Update Page"}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-[3px] text-xs font-bold border ${message.includes("Error") ? "bg-[#fcf0f1] border-[#d63638] text-[#d63638]" : "bg-[#edfaef] border-[#00a32a] text-[#00a32a]"}`}>
          {message}
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white border border-[#c3c4c7] rounded-[3px] shadow-sm p-5 sm:p-6">
        <ContactEditor pageId={pageId} data={data} setData={setData} />
      </div>
    </div>
  );
}
