"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-40 bg-white animate-pulse border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs">Loading Rich Text Editor...</div>
});

export default function ContactEditor() {
    const [data, setData] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/content")
            .then((res) => res.json())
            .then((json) => setData(json))
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

            if (!res.ok) throw new Error("Failed to save");
            setMessage("Saved successfully!");
            setTimeout(() => setMessage(""), 3000);
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
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pages" className="p-3 bg-white border border-gray-100 hover:border-primary/30 rounded-2xl transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact Page Editor</h1>
                        <p className="text-slate-500 text-sm font-medium">Manage header, description, and receiver email.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-sm disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl border ${message.includes("Error") ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"}`}>
                    {message}
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-3xl p-8 space-y-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-primary" /> Header Settings
                    </h2>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Section Badge</label>
                            <input
                                type="text"
                                value={data.contactPage?.header?.badge || ""}
                                onChange={(e) => setData((prev: any) => ({ ...prev, contactPage: { ...(prev.contactPage || {}), header: { ...(prev.contactPage?.header || {}), badge: e.target.value } } }))}
                                placeholder="e.g. Contact Us"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-primary/50 focus:outline-none transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Section Title</label>
                            <input
                                type="text"
                                value={data.contactPage?.header?.headline || ""}
                                onChange={(e) => setData((prev: any) => ({ ...prev, contactPage: { ...(prev.contactPage || {}), header: { ...(prev.contactPage?.header || {}), headline: e.target.value } } }))}
                                placeholder="e.g. Get In Touch"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-primary/50 focus:outline-none transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Section Paragraph</label>
                            <RichTextEditor 
                                content={data.contactPage?.header?.description || ""} 
                                onChange={(v) => setData((prev: any) => ({ ...prev, contactPage: { ...(prev.contactPage || {}), header: { ...(prev.contactPage?.header || {}), description: v } } }))} 
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-3xl p-8 space-y-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-primary" /> Business Vitals
                    </h2>
                    <p className="text-xs text-slate-500 font-medium -mt-4">These appear as info cards below the contact form.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Phone Number</label>
                            <input
                                type="text"
                                value={data.contactPage?.info?.phone || ""}
                                onChange={(e) => setData((prev: any) => ({ ...prev, contactPage: { ...(prev.contactPage || {}), info: { ...(prev.contactPage?.info || {}), phone: e.target.value } } }))}
                                placeholder="e.g. (314) 555-0100"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-primary/50 focus:outline-none transition-all shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Email Address</label>
                            <input
                                type="email"
                                value={data.contactPage?.info?.email || data.contactPage?.email || ""}
                                onChange={(e) => setData((prev: any) => ({ ...prev, contactPage: { ...(prev.contactPage || {}), info: { ...(prev.contactPage?.info || {}), email: e.target.value }, email: e.target.value } }))}
                                placeholder="e.g. hello@eaglerevolution.com"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-primary/50 focus:outline-none transition-all shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Address</label>
                            <input
                                type="text"
                                value={data.contactPage?.info?.address || ""}
                                onChange={(e) => setData((prev: any) => ({ ...prev, contactPage: { ...(prev.contactPage || {}), info: { ...(prev.contactPage?.info || {}), address: e.target.value } } }))}
                                placeholder="e.g. St. Louis, MO"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-primary/50 focus:outline-none transition-all shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Business Hours</label>
                            <input
                                type="text"
                                value={data.contactPage?.info?.hours || ""}
                                onChange={(e) => setData((prev: any) => ({ ...prev, contactPage: { ...(prev.contactPage || {}), info: { ...(prev.contactPage?.info || {}), hours: e.target.value } } }))}
                                placeholder="e.g. Mon–Fri, 8am–6pm"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:border-primary/50 focus:outline-none transition-all shadow-inner"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
