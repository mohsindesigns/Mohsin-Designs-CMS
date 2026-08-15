"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Calendar, User, Phone, Briefcase, Filter, Search, X, CheckCircle2, AlertCircle, FileDown, ExternalLink, ChevronRight, Download } from "lucide-react";
import Link from "next/link";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      const data = await res.json();
      setSubmissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesType = filterType === "All" || sub.type === filterType;
      const matchesSearch = 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.message && sub.message.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [submissions, filterType, searchQuery]);

  if (loading) return <div className="flex h-screen items-center justify-center text-[#646970] font-serif">Loading Submissions...</div>;

  return (
    <div className="space-y-4">
      {/* WP Header Area */}
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-[23px] font-normal text-[#1d2327] font-serif m-0">Submissions</h1>
      </div>

      {/* Filter Links */}
      <div className="flex items-center gap-2 text-[13px]">
        {[
          { label: "All", value: "All" },
          { label: "Quotes", value: "Quote Request" },
          { label: "Jobs", value: "Job Application" },
          { label: "Inquiries", value: "Contact Form" },
          { label: "Newsletter", value: "Newsletter" },
        ].map((opt, idx, arr) => (
          <React.Fragment key={opt.value}>
            <button onClick={() => setFilterType(opt.value)} className={`${filterType === opt.value ? 'text-black font-bold' : 'text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current'}`}>
              {opt.label} <span className="text-[#646970] font-normal">({submissions.filter(s => opt.value === 'All' || s.type === opt.value).length})</span>
            </button>
            {idx < arr.length - 1 && <span className="text-[#c3c4c7]">|</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Top Bar: Bulk Actions & Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select className="border border-[#8c8f94] bg-white text-[#2c3338] px-2 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]">
            <option value="">Bulk actions</option>
            <option value="delete">Delete Permanently</option>
          </select>
          <button className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f6f7f7] transition-colors">Apply</button>
        </div>

        <div className="flex items-center gap-2">
           <input
             type="text"
             placeholder="Search Leads"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
           />
           <button className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f6f7f7] transition-colors">Search</button>
        </div>
      </div>

      {/* WP-Style Table */}
      <div className="bg-white border border-[#c3c4c7] rounded-sm overflow-hidden shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#c3c4c7] text-[#1d2327]">
              <th className="w-8 py-2 px-3"><input type="checkbox" className="w-4 h-4 border-[#8c8f94] rounded-[3px]" /></th>
              <th className="py-2 px-3 text-[14px] font-semibold">Contact</th>
              <th className="py-2 px-3 text-[14px] font-semibold">Type</th>
              <th className="py-2 px-3 text-[14px] font-semibold">Message</th>
              <th className="py-2 px-3 text-[14px] font-semibold w-32">Date</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-[#2c3338]">
            {filteredSubmissions.length === 0 ? (
              <tr><td colSpan={5} className="py-6 px-4 text-[#50575e]">No submissions found.</td></tr>
            ) : (
              filteredSubmissions.map((sub, idx) => (
                <tr
                  key={sub._id}
                  className={`border-b border-[#f0f0f1] group ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} hover:bg-[#f0f0f1] transition-colors cursor-pointer`}
                  onClick={() => setSelectedSubmission(sub)}
                >
                  <td className="py-3 px-3 align-top" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="w-4 h-4 border-[#8c8f94] rounded-[3px]" />
                  </td>
                  <td className="py-3 px-3 align-top">
                    <strong className="text-[#2271b1] block text-[14px]">{sub.name}</strong>
                    <span className="text-[#646970]">{sub.email}</span>
                    <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelectedSubmission(sub)} className="text-[#2271b1] hover:underline text-[12px]">View Details</button>
                      <span className="text-[#a7aaad]">|</span>
                      <a href={`mailto:${sub.email}`} className="text-[#2271b1] hover:underline text-[12px]">Email</a>
                      <span className="text-[#a7aaad]">|</span>
                      <button className="text-[#d63638] hover:underline text-[12px]">Delete</button>
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top">
                    <span className={`font-semibold ${
                      sub.type === 'Job Application' ? 'text-purple-600' :
                      sub.type === 'Quote Request' ? 'text-blue-600' : 'text-[#50575e]'
                    }`}>
                      {sub.type.replace(' Request', '')}
                    </span>
                  </td>
                  <td className="py-3 px-3 align-top text-[#50575e] italic line-clamp-2">
                    {sub.message || "No message."}
                  </td>
                  <td className="py-3 px-3 align-top text-[#50575e]">
                    {new Date(sub.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* WP-Style Modal for Details */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSubmission(null)} className="absolute inset-0 bg-[#00000066]" />
             <motion.div
               initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
               className="relative w-full max-w-2xl bg-[#f1f1f1] border border-[#c3c4c7] shadow-lg rounded-[3px] overflow-hidden flex flex-col"
             >
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#c3c4c7]">
                   <h2 className="text-[#1d2327] text-lg font-normal font-serif">Submission Details</h2>
                   <button onClick={() => setSelectedSubmission(null)} className="text-[#787c82] hover:text-[#d63638]"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-6 bg-[#f0f0f1] overflow-y-auto max-h-[70vh]">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                         <label className="text-[11px] font-bold text-[#646970] uppercase">Name</label>
                         <p className="text-[14px] text-[#1d2327] font-medium">{selectedSubmission.name}</p>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[11px] font-bold text-[#646970] uppercase">Type</label>
                         <p className="text-[14px] text-[#1d2327] font-medium">{selectedSubmission.type}</p>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[11px] font-bold text-[#646970] uppercase">Email</label>
                         <p className="text-[14px] text-[#2271b1] hover:underline cursor-pointer">{selectedSubmission.email}</p>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[11px] font-bold text-[#646970] uppercase">Phone</label>
                         <p className="text-[14px] text-[#1d2327] font-medium">{selectedSubmission.phone || "N/A"}</p>
                      </div>
                   </div>
 
                   {selectedSubmission.extraData && Object.keys(selectedSubmission.extraData).length > 0 && (
                     <div className="space-y-3 pt-4 border-t border-[#c3c4c7]">
                       <label className="text-[11px] font-bold text-[#646970] uppercase">Additional Information</label>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {Object.entries(selectedSubmission.extraData).map(([key, value]) => (
                           <div key={key} className="bg-white border border-[#c3c4c7] p-2 rounded-[3px]">
                             <label className="block text-[10px] text-[#8c8f94] font-bold uppercase mb-0.5">{key.replace(/_/g, ' ')}</label>
                             <p className="text-[13px] text-[#2c3338]">{String(value)}</p>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   <div className="space-y-1 pt-4 border-t border-[#c3c4c7]">
                      <label className="text-[11px] font-bold text-[#646970] uppercase">Message</label>
                      <div className="bg-white border border-[#c3c4c7] p-4 text-[14px] text-[#2c3338] rounded-[3px] italic leading-relaxed shadow-inner">
                         "{selectedSubmission.message}"
                      </div>
                   </div>

                   {selectedSubmission.attachmentUrl && (
                     <div className="pt-4 border-t border-[#c3c4c7]">
                        <label className="text-[11px] font-bold text-[#646970] uppercase mb-2 block">Attachments</label>
                        <a href={selectedSubmission.attachmentUrl} target="_blank" className="inline-flex items-center gap-2 bg-[#2271b1] text-white px-4 py-1.5 rounded-[3px] text-[13px] hover:bg-[#135e96]">
                           <FileDown className="w-4 h-4" />
                           Download CV / File
                        </a>
                     </div>
                   )}
                </div>
                <div className="flex items-center justify-end px-4 py-3 bg-[#f6f7f7] border-t border-[#c3c4c7]">
                   <button onClick={() => setSelectedSubmission(null)} className="bg-white border border-[#8c8f94] text-[#2c3338] px-4 py-1.5 rounded-[3px] text-[13px] hover:bg-[#f6f7f7]">Close</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
