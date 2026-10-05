"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, FileDown, Download, Trash2, RefreshCw, MessageSquare, Copy, Check } from "lucide-react";

// Lead "types" are whatever the form that posted to /api/send called itself. Group the known ones
// into the tabs an admin thinks in; anything new/unknown lands in "Other" so no lead is ever
// invisible behind a filter (the old fixed tab list hid Contact Inquiry / Consultation leads).
const TYPE_GROUPS: { label: string; types: string[]; badge: string }[] = [
  { label: "Contact Form", types: ["Contact Form", "Contact Inquiry"], badge: "bg-blue-50 text-blue-700 border border-blue-200" },
  { label: "Quotes", types: ["Quote Request"], badge: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  { label: "Consultations", types: ["Service Detail Consultation", "Industry Consultation Request"], badge: "bg-amber-50 text-amber-800 border border-amber-200" },
  { label: "Job Applications", types: ["Job Application", "Career Application"], badge: "bg-purple-50 text-purple-700 border border-purple-200" },
  { label: "Newsletter", types: ["Newsletter"], badge: "bg-gray-100 text-gray-700 border border-gray-200" },
];
const OTHER_BADGE = "bg-gray-100 text-gray-700 border border-gray-200";

const groupOf = (type?: string) => TYPE_GROUPS.find((g) => g.types.includes(type || "Contact Form"))?.label || "Other";

// Values in extraData can be strings, numbers, booleans, arrays or nested objects (older forms).
const formatExtra = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.map(formatExtra).filter(Boolean).join(", ");
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return String(value);
};

const extraEntries = (sub: any): [string, string][] =>
  Object.entries(sub?.extraData || {})
    .map(([k, v]) => [k, formatExtra(v)] as [string, string])
    .filter(([, v]) => v !== "");

// Quote a CSV cell; neutralise spreadsheet formulas (=, @, or +/- that is not a plain phone/number).
const csvCell = (value: unknown): string => {
  let s = String(value ?? "");
  if (/^[=@\t\r]/.test(s) || (/^[+-]/.test(s) && !/^[+-]?[\d\s().-]+$/.test(s))) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

const isSitePath = (s?: string) => !!s && s.startsWith("/") && !s.startsWith("//");

const formatLeadSummary = (sub: any): string => {
  if (!sub) return "";
  const lines: string[] = [
    `LEAD DETAILS`,
    `----------------------------------------`,
    `Name:      ${sub.name || "N/A"}`,
    `Email:     ${sub.email || "N/A"}`,
    `Phone:     ${sub.phone || "Not provided"}`,
    `Type:      ${sub.type || "Contact Form"}`,
  ];
  if (sub.subject) lines.push(`Subject:   ${sub.subject}`);
  if (sub.source) lines.push(`Origin:    ${sub.source}`);
  if (sub.createdAt) lines.push(`Submitted: ${new Date(sub.createdAt).toLocaleString()}`);
  
  const extras = extraEntries(sub);
  if (extras.length > 0) {
    lines.push(`\nADDITIONAL DETAILS:`);
    extras.forEach(([k, v]) => lines.push(`- ${k.replace(/_/g, " ")}: ${v}`));
  }
  
  if (sub.message) {
    lines.push(`\nMESSAGE:`);
    lines.push(sub.message);
  }
  return lines.join("\n");
};

function CopyBtn({
  text,
  id,
  title = "Copy to clipboard",
  label,
  copiedKey,
  onCopy,
  className = "",
}: {
  text: string;
  id: string;
  title?: string;
  label?: string;
  copiedKey: string | null;
  onCopy: (text: string, id: string, label?: string, e?: React.MouseEvent) => void;
  className?: string;
}) {
  const isCopied = copiedKey === id;
  return (
    <button
      type="button"
      onClick={(e) => onCopy(text, id, label || title, e)}
      title={isCopied ? "Copied to clipboard!" : title}
      aria-label={title}
      className={`inline-flex items-center gap-1 transition-all rounded px-1.5 py-0.5 text-xs select-none cursor-pointer ${
        isCopied
          ? "bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold"
          : "text-[#646970] hover:text-[#2271b1] hover:bg-[#eaf2fa] border border-transparent hover:border-[#c3c4c7]"
      } ${className}`}
    >
      {isCopied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-[11px] text-emerald-700 font-medium">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
          {label && <span className="text-[11px]">{label}</span>}
        </>
      )}
    </button>
  );
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Escape closes the details dialog
  useEffect(() => {
    if (!selectedSubmission) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedSubmission(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedSubmission]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(Array.isArray(data) ? data : []);
      } else if (res.status === 403 || res.status === 401) {
        setLoadError("You don't have permission to view leads.");
      } else {
        setLoadError("Could not load leads. Please refresh and try again.");
      }
    } catch (e) {
      console.error(e);
      setLoadError("Could not load leads. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string, label = "Copied", e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!text) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedKey(key);
      showToast(`${label} copied to clipboard!`, "ok");
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2000);
    } catch (err) {
      console.error("Copy failed", err);
      showToast("Failed to copy to clipboard", "err");
    }
  };

  const handleDeleteSingle = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch("/api/admin/submissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s._id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
        if (selectedSubmission?._id === id) setSelectedSubmission(null);
        showToast("Lead deleted successfully.");
      } else {
        showToast(res.status === 403 ? "You don't have permission to delete leads." : "Failed to delete lead.", "err");
      }
    } catch {
      showToast("Failed to delete lead.", "err");
    }
  };

  const handleBulkAction = async () => {
    if (bulkAction !== "delete" || selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected lead(s)?`)) return;

    try {
      const res = await fetch("/api/admin/submissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => !selectedIds.includes(s._id)));
        setSelectedIds([]);
        setBulkAction("");
        showToast(`${selectedIds.length} lead(s) deleted successfully.`);
      } else {
        showToast(res.status === 403 ? "You don't have permission to delete leads." : "Failed to delete selected leads.", "err");
      }
    } catch {
      showToast("Failed to delete selected leads.", "err");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredSubmissions.map(s => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredSubmissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return submissions.filter((sub) => {
      const matchesType = filterType === "All" || groupOf(sub.type) === filterType;
      if (!matchesType) return false;
      if (!q) return true;
      // search every human-visible field, including the extra details (service, company, role...)
      const haystack = [
        sub.name, sub.email, sub.phone, sub.message, sub.subject, sub.type,
        ...extraEntries(sub).map(([, v]) => v),
      ].filter(Boolean).join("\n").toLowerCase();
      return haystack.includes(q);
    });
  }, [submissions, filterType, searchQuery]);

  // Tabs: All + every group that actually has leads (+ the active one so it never vanishes).
  const tabs = useMemo(() => {
    const counts: Record<string, number> = {};
    submissions.forEach((s) => {
      const g = groupOf(s.type);
      counts[g] = (counts[g] || 0) + 1;
    });
    const labels = [...TYPE_GROUPS.map((g) => g.label), "Other"].filter((l) => counts[l] || l === filterType);
    return [{ label: "All", count: submissions.length }, ...labels.map((l) => ({ label: l, count: counts[l] || 0 }))];
  }, [submissions, filterType]);

  const badgeFor = (type?: string) => TYPE_GROUPS.find((g) => g.types.includes(type || "Contact Form"))?.badge || OTHER_BADGE;

  // Exports exactly the leads currently shown (respects the tab + search), all useful columns.
  const handleExportCSV = () => {
    const rows = filteredSubmissions;
    if (rows.length === 0) {
      showToast("No leads to export.", "err");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Type", "Subject", "Source", "Message", "Details", "Attachment", "Submitted Date"];
    const lines = rows.map(s => [
      s.name,
      s.email,
      s.phone,
      s.type || "Contact Form",
      s.subject,
      s.source || "Website",
      s.message,
      extraEntries(s).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`).join("; "),
      s.attachmentUrl ? `${window.location.origin}${s.attachmentUrl}` : "",
      s.createdAt ? new Date(s.createdAt).toLocaleString() : "",
    ].map(csvCell).join(","));

    // Blob (not a data: URI): a "#" or newline in any message used to truncate/corrupt the file.
    const csv = "﻿" + [headers.map(csvCell).join(","), ...lines].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (loading && submissions.length === 0) {
    return <div className="flex h-screen items-center justify-center text-[#646970] font-serif">Loading Submissions...</div>;
  }

  const allSelected = filteredSubmissions.length > 0 && filteredSubmissions.every(s => selectedIds.includes(s._id));
  const replyHref = (sub: any) => `mailto:${sub.email}?subject=${encodeURIComponent(`Re: ${sub.subject || "Your Inquiry"}`)}`;

  return (
    <div className="space-y-4">
      {/* Header Area */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-[23px] font-normal text-[#1d2327] font-serif m-0">Leads & Inquiries</h1>
          <button onClick={fetchSubmissions} title="Refresh" aria-label="Refresh leads" className="p-1 text-[#646970] hover:text-[#2271b1] transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <button
          onClick={handleExportCSV}
          title="Exports the leads currently shown (respects the tab and search)"
          className="inline-flex items-center gap-2 bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1.5 text-[13px] rounded-[3px] hover:bg-[#f6f7f7] hover:border-[#2271b1] transition-colors"
        >
          <Download className="w-4 h-4 text-[#2271b1]" />
          <span>Export CSV{filteredSubmissions.length !== submissions.length ? ` (${filteredSubmissions.length})` : ""}</span>
        </button>
      </div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className={`px-4 py-2 bg-white border-l-4 text-[13px] shadow-sm mb-2 ${
              toast.type === "ok" ? "border-[#00a32a]" : "border-[#d63638]"
            }`}
          >
            <p className="text-[#1d2327] m-0">{toast.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {loadError && (
        <div role="alert" className="px-4 py-2 bg-white border-l-4 border-[#d63638] text-[13px] shadow-sm text-[#1d2327]">
          {loadError}
        </div>
      )}

      {/* Filter Links */}
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        {tabs.map((opt, idx, arr) => (
          <React.Fragment key={opt.label}>
            <button
              onClick={() => { setFilterType(opt.label); setSelectedIds([]); }}
              aria-pressed={filterType === opt.label}
              className={`${
                filterType === opt.label
                  ? "text-black font-bold"
                  : "text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current"
              }`}
            >
              {opt.label}{" "}
              <span className="text-[#646970] font-normal">({opt.count})</span>
            </button>
            {idx < arr.length - 1 && <span className="text-[#c3c4c7]">|</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Top Bar: Bulk Actions & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            aria-label="Bulk actions"
            className="border border-[#8c8f94] bg-white text-[#2c3338] px-2 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
          >
            <option value="">Bulk actions</option>
            <option value="delete">Delete Permanently</option>
          </select>
          <button
            onClick={handleBulkAction}
            disabled={!bulkAction || selectedIds.length === 0}
            className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f6f7f7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Apply
          </button>
          {selectedIds.length > 0 && (
            <span className="text-xs text-[#646970]">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search name, email, phone, message, service..."
              aria-label="Search leads"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-[#8c8f94] bg-white pl-8 pr-3 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] w-full sm:w-72"
            />
            <Search className="w-3.5 h-3.5 text-[#8c8f94] absolute left-2.5 top-2" />
          </div>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-xs text-[#2271b1] hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c3c4c7] rounded-sm overflow-x-auto shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
        <table className="w-full min-w-[720px] text-left border-collapse">
          <thead>
            <tr className="border-b border-[#c3c4c7] bg-[#f6f7f7] text-[#1d2327]">
              <th className="w-8 py-2.5 px-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all leads"
                  className="w-4 h-4 border-[#8c8f94] rounded-[3px]"
                />
              </th>
              <th className="py-2.5 px-3 text-[13px] font-bold">Contact Name & Email</th>
              <th className="py-2.5 px-3 text-[13px] font-bold">Phone</th>
              <th className="py-2.5 px-3 text-[13px] font-bold">Type</th>
              <th className="py-2.5 px-3 text-[13px] font-bold">Message Preview</th>
              <th className="py-2.5 px-3 text-[13px] font-bold w-32">Date</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-[#2c3338]">
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-[#50575e]">
                  {submissions.length === 0
                    ? "No leads yet. Submissions from your site forms (Contact, Quote, Careers, Newsletter...) will appear here automatically."
                    : "No leads match this filter or search."}
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((sub, idx) => {
                const isSelected = selectedIds.includes(sub._id);
                const service = sub.extraData?.service || sub.extraData?.services || sub.extraData?.role || sub.extraData?.industry;
                return (
                  <tr
                    key={sub._id}
                    className={`border-b border-[#f0f0f1] group ${
                      isSelected ? "bg-[#eaf2fa]" : idx % 2 === 0 ? "bg-[#fcfcfc]" : "bg-white"
                    } hover:bg-[#f0f0f1] transition-colors cursor-pointer`}
                    onClick={() => setSelectedSubmission(sub)}
                  >
                    <td className="py-3 px-3 align-top" onClick={(e) => handleToggleSelect(sub._id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        aria-label={`Select lead from ${sub.name || sub.email}`}
                        className="w-4 h-4 border-[#8c8f94] rounded-[3px]"
                      />
                    </td>
                    <td className="py-3 px-3 align-top select-text">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-[#2271b1] text-[14px]">{sub.name}</strong>
                        {sub.name && (
                          <CopyBtn
                            text={sub.name}
                            id={`name-${sub._id}`}
                            title="Copy name"
                            copiedKey={copiedKey}
                            onCopy={handleCopy}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className="text-[#646970] text-xs font-mono">{sub.email}</span>
                        {sub.email && (
                          <CopyBtn
                            text={sub.email}
                            id={`email-${sub._id}`}
                            title="Copy email"
                            copiedKey={copiedKey}
                            onCopy={handleCopy}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubmission(sub);
                          }}
                          className="text-[#2271b1] hover:underline text-[12px]"
                        >
                          View Full Details
                        </button>
                        <span className="text-[#a7aaad]">|</span>
                        <button
                          onClick={(e) => handleCopy(formatLeadSummary(sub), `all-${sub._id}`, "Lead summary", e)}
                          className="text-[#2271b1] hover:underline text-[12px] flex items-center gap-1"
                        >
                          {copiedKey === `all-${sub._id}` ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Copied All
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5">
                              <Copy className="w-3 h-3" /> Copy All
                            </span>
                          )}
                        </button>
                        <span className="text-[#a7aaad]">|</span>
                        <a
                          href={replyHref(sub)}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#2271b1] hover:underline text-[12px]"
                        >
                          Reply Email
                        </a>
                        <span className="text-[#a7aaad]">|</span>
                        <button
                          onClick={(e) => handleDeleteSingle(sub._id, e)}
                          className="text-[#d63638] hover:underline text-[12px]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 align-top text-xs font-mono text-[#50575e] select-text">
                      {sub.phone ? (
                        <div className="flex items-center gap-1 flex-wrap">
                          <a
                            href={`tel:${sub.phone.replace(/[^0-9+]/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-[#2271b1] hover:underline"
                          >
                            {sub.phone}
                          </a>
                          <CopyBtn
                            text={sub.phone}
                            id={`phone-${sub._id}`}
                            title="Copy phone number"
                            copiedKey={copiedKey}
                            onCopy={handleCopy}
                          />
                        </div>
                      ) : (
                        <span className="text-[#a7aaad] italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-3 align-top select-text">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeFor(sub.type)}`}>
                          {sub.type || "Contact Form"}
                        </span>
                        {sub.type && (
                          <CopyBtn
                            text={sub.type}
                            id={`type-${sub._id}`}
                            title="Copy type"
                            copiedKey={copiedKey}
                            onCopy={handleCopy}
                          />
                        )}
                      </div>
                      {service && (
                        <div className="flex items-center gap-1 mt-1 max-w-[200px]">
                          <span className="text-[11px] text-[#646970] truncate" title={formatExtra(service)}>
                            {formatExtra(service)}
                          </span>
                          <CopyBtn
                            text={formatExtra(service)}
                            id={`srv-${sub._id}`}
                            title="Copy service"
                            copiedKey={copiedKey}
                            onCopy={handleCopy}
                          />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 align-top text-[#50575e] text-xs max-w-xs select-text">
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="truncate flex-1">
                          {sub.message || <span className="italic text-[#a7aaad]">No message content.</span>}
                        </span>
                        {sub.message && (
                          <CopyBtn
                            text={sub.message}
                            id={`msg-${sub._id}`}
                            title="Copy full message"
                            copiedKey={copiedKey}
                            onCopy={handleCopy}
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 align-top text-[#50575e] text-xs whitespace-nowrap select-text">
                      {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }) : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Lead Details */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Lead details">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSubmission(null)}
              className="absolute inset-0 bg-[#00000066]"
            />
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#f1f1f1] border border-[#c3c4c7] shadow-xl rounded-[3px] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#c3c4c7]">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#2271b1]" />
                  <h2 className="text-[#1d2327] text-lg font-normal font-serif">Lead Details</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCopy(formatLeadSummary(selectedSubmission), `modal-all-${selectedSubmission._id}`, "Full lead summary", e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f0f6fb] text-[#135e96] border border-[#72aee6] rounded text-[12px] font-medium hover:bg-[#2271b1] hover:text-white transition-colors cursor-pointer select-none"
                    title="Copy complete lead info (name, email, phone, service, message)"
                  >
                    {copiedKey === `modal-all-${selectedSubmission._id}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-emerald-700">Summary Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy All Info</span>
                      </>
                    )}
                  </button>
                  <button onClick={() => setSelectedSubmission(null)} aria-label="Close" className="text-[#787c82] hover:text-[#d63638]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 bg-[#f0f0f1] overflow-y-auto max-h-[75vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white p-5 rounded border border-[#c3c4c7]">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-[#8c8f94] uppercase tracking-wider">Full Name</label>
                      {selectedSubmission.name && (
                        <CopyBtn
                          text={selectedSubmission.name}
                          id={`m-name-${selectedSubmission._id}`}
                          title="Copy full name"
                          label="Copy"
                          copiedKey={copiedKey}
                          onCopy={handleCopy}
                        />
                      )}
                    </div>
                    <p className="text-[15px] text-[#1d2327] font-semibold break-words select-text">{selectedSubmission.name}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-[#8c8f94] uppercase tracking-wider">Submission Type</label>
                      {selectedSubmission.type && (
                        <CopyBtn
                          text={selectedSubmission.type}
                          id={`m-type-${selectedSubmission._id}`}
                          title="Copy submission type"
                          label="Copy"
                          copiedKey={copiedKey}
                          onCopy={handleCopy}
                        />
                      )}
                    </div>
                    <p className="text-[14px] text-[#1d2327] font-medium select-text">{selectedSubmission.type || "Contact Form"}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-[#8c8f94] uppercase tracking-wider">Email Address</label>
                      {selectedSubmission.email && (
                        <CopyBtn
                          text={selectedSubmission.email}
                          id={`m-email-${selectedSubmission._id}`}
                          title="Copy email address"
                          label="Copy"
                          copiedKey={copiedKey}
                          onCopy={handleCopy}
                        />
                      )}
                    </div>
                    <a href={`mailto:${selectedSubmission.email}`} className="text-[14px] text-[#2271b1] hover:underline font-mono block break-all select-text">
                      {selectedSubmission.email}
                    </a>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-[#8c8f94] uppercase tracking-wider">Phone Number</label>
                      {selectedSubmission.phone && (
                        <CopyBtn
                          text={selectedSubmission.phone}
                          id={`m-phone-${selectedSubmission._id}`}
                          title="Copy phone number"
                          label="Copy"
                          copiedKey={copiedKey}
                          onCopy={handleCopy}
                        />
                      )}
                    </div>
                    <p className="text-[14px] text-[#1d2327] font-mono select-text">
                      {selectedSubmission.phone ? (
                        <a href={`tel:${selectedSubmission.phone.replace(/[^0-9+]/g, '')}`} className="text-[#2271b1] hover:underline">
                          {selectedSubmission.phone}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-[#8c8f94] uppercase tracking-wider">Submitted On</label>
                      {selectedSubmission.createdAt && (
                        <CopyBtn
                          text={new Date(selectedSubmission.createdAt).toLocaleString()}
                          id={`m-date-${selectedSubmission._id}`}
                          title="Copy submission date"
                          label="Copy"
                          copiedKey={copiedKey}
                          onCopy={handleCopy}
                        />
                      )}
                    </div>
                    <p className="text-[13px] text-[#50575e] select-text">
                      {selectedSubmission.createdAt ? new Date(selectedSubmission.createdAt).toLocaleString() : "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-[#8c8f94] uppercase tracking-wider">Origin / Page</label>
                      {selectedSubmission.source && (
                        <CopyBtn
                          text={selectedSubmission.source}
                          id={`m-src-${selectedSubmission._id}`}
                          title="Copy origin page"
                          label="Copy"
                          copiedKey={copiedKey}
                          onCopy={handleCopy}
                        />
                      )}
                    </div>
                    <p className="text-[13px] text-[#50575e] font-mono break-all select-text">
                      {isSitePath(selectedSubmission.source) ? (
                        <a href={selectedSubmission.source} target="_blank" rel="noopener noreferrer" className="text-[#2271b1] hover:underline">
                          {selectedSubmission.source}
                        </a>
                      ) : (
                        selectedSubmission.source || "Website"
                      )}
                    </p>
                  </div>
                  {selectedSubmission.subject && (
                    <div className="space-y-1 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-[#8c8f94] uppercase tracking-wider">Subject</label>
                        <CopyBtn
                          text={selectedSubmission.subject}
                          id={`m-subj-${selectedSubmission._id}`}
                          title="Copy subject"
                          label="Copy"
                          copiedKey={copiedKey}
                          onCopy={handleCopy}
                        />
                      </div>
                      <p className="text-[14px] text-[#1d2327] break-words select-text">{selectedSubmission.subject}</p>
                    </div>
                  )}
                </div>

                {extraEntries(selectedSubmission).length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#646970] uppercase">Additional Information</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {extraEntries(selectedSubmission).map(([key, value]) => (
                        <div key={key} className="bg-white border border-[#c3c4c7] p-2.5 rounded-[3px] space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] text-[#8c8f94] font-bold uppercase mb-0.5">{key.replace(/_/g, ' ')}</label>
                            <CopyBtn
                              text={value}
                              id={`m-extra-${key}-${selectedSubmission._id}`}
                              title={`Copy ${key.replace(/_/g, ' ')}`}
                              label="Copy"
                              copiedKey={copiedKey}
                              onCopy={handleCopy}
                            />
                          </div>
                          <p className="text-[13px] text-[#2c3338] break-words select-text font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#646970] uppercase">Message Content</label>
                    {selectedSubmission.message && (
                      <CopyBtn
                        text={selectedSubmission.message}
                        id={`m-msg-${selectedSubmission._id}`}
                        title="Copy message content"
                        label="Copy Message"
                        copiedKey={copiedKey}
                        onCopy={handleCopy}
                        className="font-medium bg-white border-[#c3c4c7]"
                      />
                    )}
                  </div>
                  <div className="bg-white border border-[#c3c4c7] p-4 text-[14px] text-[#2c3338] rounded-[3px] whitespace-pre-wrap break-words leading-relaxed shadow-sm select-text">
                    {selectedSubmission.message || <span className="italic text-[#8c8f94]">No message text provided.</span>}
                  </div>
                </div>

                {(selectedSubmission.attachmentUrl || (Array.isArray(selectedSubmission.attachmentUrls) && selectedSubmission.attachmentUrls.length > 0)) && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#646970] uppercase">Attachment</label>
                    <div className="flex flex-wrap gap-2">
                      {/* attachmentUrls: older documents stored several files in an array */}
                      {[selectedSubmission.attachmentUrl, ...(Array.isArray(selectedSubmission.attachmentUrls) ? selectedSubmission.attachmentUrls : [])]
                        .filter((u: unknown): u is string => typeof u === "string" && !!u)
                        .map((url: string, i: number) => (
                          <a
                            key={url + i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#2271b1] text-white px-4 py-2 rounded-[3px] text-[13px] hover:bg-[#135e96] transition-colors"
                          >
                            <FileDown className="w-4 h-4" />
                            Download Attached File
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-5 py-3 bg-[#f6f7f7] border-t border-[#c3c4c7]">
                <button
                  onClick={() => handleDeleteSingle(selectedSubmission._id)}
                  className="text-[#d63638] text-[13px] hover:underline flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Lead
                </button>
                <div className="flex items-center gap-2">
                  <a
                    href={replyHref(selectedSubmission)}
                    className="bg-[#2271b1] text-white px-4 py-1.5 rounded-[3px] text-[13px] hover:bg-[#135e96] transition-colors"
                  >
                    Reply via Email
                  </a>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="bg-white border border-[#8c8f94] text-[#2c3338] px-4 py-1.5 rounded-[3px] text-[13px] hover:bg-[#f6f7f7]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
