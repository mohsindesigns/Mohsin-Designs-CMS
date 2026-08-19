"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, ChevronRight } from "lucide-react";
import Link from "next/link";
import LocationEditor from "@/components/admin/editors/LocationEditor";

export default function AdminLocationsPage() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
      })
      .catch((err) => console.error("Failed to load content:", err));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setMessage("Locations page content saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save content.");
      }
    } catch (err) {
      setMessage("Error saving content.");
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#2271b1] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* WordPress-style Top Action Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#dcdcde]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#50575e] mb-1 font-medium">
            <Link href="/admin/pages" className="hover:text-[#135e96] text-[#2271b1]">Pages</Link>
            <ChevronRight className="w-3 h-3 text-[#8c8f94]" />
            <span className="text-[#1d2327]">Locations Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1d2327]">Edit Locations Hub Page</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#2271b1] text-white px-5 py-2 rounded-[3px] font-bold text-xs hover:bg-[#135e96] transition-all disabled:opacity-50 shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-[3px] mb-6 text-xs font-bold ${message.includes("success") ? "bg-[#edfaef] text-[#1a7f37] border border-[#4ac06b]" : "bg-[#fcf0f1] text-[#d63638] border border-[#d63638]"}`}>
          {message}
        </div>
      )}

      <LocationEditor
        pageId="locations-global"
        data={data}
        setData={setData}
      />
    </div>
  );
}
