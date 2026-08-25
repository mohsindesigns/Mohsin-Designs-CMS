"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";
import NewAboutEditor from "@/components/admin/editors/NewAboutEditor";

export default function AdminNewAboutPage() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((json) => {
        const d = { ...json };
        if (!d.newAboutPage) d.newAboutPage = {};
        setData(d);
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
        setMessage("New About page content saved successfully!");
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
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/pages" className="hover:text-gray-900 transition-colors">Pages</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900">New About Page</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Edit New About Page</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 hover:bg-primary/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.includes("successfully") ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"}`}>
          {message}
        </div>
      )}

      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
        <NewAboutEditor
          pageId="new-about"
          data={data.newAboutPage || {}}
          setData={(newAbout) => {
            setData((prev: any) => ({
              ...prev,
              newAboutPage: typeof newAbout === "function" ? newAbout(prev.newAboutPage || {}) : newAbout
            }));
          }}
        />
      </div>
    </div>
  );
}
