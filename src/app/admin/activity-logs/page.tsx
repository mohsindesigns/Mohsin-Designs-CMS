"use client";

import { useState, useEffect, Fragment } from "react";
import { 
  Search, History, User, Calendar, Filter, 
  ArrowRight, Download, RefreshCw, X, ChevronLeft, ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ user: "", action: "", status: "" });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: pagination.page.toString(),
        user: filters.user,
        action: filters.action,
        status: filters.status
      });
      const res = await fetch(`/api/admin/activity-logs?${query}`);
      const data = await res.json();
      setLogs(data.logs);
      setPagination({ page: data.page, totalPages: data.totalPages });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  // Converts camelCase/nested keys to plain English labels
  const toLabel = (key: string) => {
    const map: Record<string, string> = {
      title: 'Page Title', slug: 'URL Slug', status: 'Status', template: 'Template',
      content: 'Page Content', seo: 'SEO Settings', username: 'Username',
      email: 'Email Address', roleId: 'Role', password: 'Password',
      metaTitle: 'Meta Title', metaDescription: 'Meta Description',
      focusKeyword: 'Focus Keyword', ogTitle: 'Social Share Title',
      ogDescription: 'Social Share Description', count: 'Total Records',
      message: 'Note', deletedCount: 'Deleted Count', canonicalUrl: 'Canonical URL',
      metaRobotsIndex: 'Robots Index', metaRobotsFollow: 'Robots Follow',
      twitterTitle: 'Twitter Title', twitterDescription: 'Twitter Description',
      breadcrumbTitle: 'Breadcrumb Title',
    };
    return map[key] || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().replace(/^\w/, c => c.toUpperCase());
  };

  const truncate = (val: any, max = 200) => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return str.length > max ? str.slice(0, max) + '…' : str;
  };

  const ChangeRow = ({ label, oldVal, newVal }: { label: string; oldVal: any; newVal: any }) => (
    <div className="border border-[#e5e5e5] rounded-[4px] overflow-hidden bg-white">
      <div className="bg-[#f6f7f7] px-3 py-1.5 border-b border-[#e5e5e5]">
        <span className="text-[11px] font-bold text-[#1d2327] uppercase tracking-wider">{label}</span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-[#e5e5e5]">
        <div className="px-3 py-2.5 bg-red-50/50">
          <div className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1.5">Was</div>
          <p className="text-[13px] text-red-800 leading-relaxed">{truncate(oldVal) || <span className="italic text-[#8c8f94]">(empty)</span>}</p>
        </div>
        <div className="px-3 py-2.5 bg-green-50/50">
          <div className="text-[9px] font-bold text-green-600 uppercase tracking-widest mb-1.5">Now</div>
          <p className="text-[13px] text-green-900 font-semibold leading-relaxed">{truncate(newVal) || <span className="italic text-[#8c8f94]">(empty)</span>}</p>
        </div>
      </div>
    </div>
  );

  const renderDetails = (details: any) => {
    if (!details) return (
      <p className="text-[13px] text-[#646970] italic py-1">No additional details were recorded for this event.</p>
    );

    const { before, after, message, ...rest } = details;

    // Simple (non-diff) details — e.g. login events, bulk deletes
    if (!before && !after) {
      const entries = Object.entries(rest).filter(([k]) => k !== 'message');
      return (
        <div className="space-y-3 py-1">
          {message && (
            <div className="flex items-start gap-2 bg-[#f0f6fb] border border-[#c2d9f0] rounded-[4px] px-3 py-2">
              <span className="text-[#2271b1] text-[16px]">ℹ️</span>
              <p className="text-[13px] text-[#2271b1] font-medium">{message}</p>
            </div>
          )}
          {entries.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {entries.map(([key, val]: [string, any]) => (
                <div key={key} className="bg-[#f6f7f7] border border-[#e5e5e5] rounded-[4px] px-3 py-2">
                  <div className="text-[10px] font-bold text-[#646970] uppercase tracking-wide mb-0.5">{toLabel(key)}</div>
                  <div className="text-[13px] text-[#1d2327] font-semibold">{truncate(val) || '-'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Before vs After comparison
    if (before && after) {
      const CONTENT_ONLY = ['content']; // too complex, always summarize
      const allTopKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

      // Collect all change rows (flat + nested)
      const changeRows: { label: string; old: any; nw: any }[] = [];

      for (const key of allTopKeys) {
        const oldVal = before[key];
        const newVal = after[key];

        if (CONTENT_ONLY.includes(key)) {
          // Summarize only
          if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            changeRows.push({ label: toLabel(key), old: '(complex data)', nw: '(updated)' });
          }
          continue;
        }

        if (typeof oldVal === 'object' && oldVal !== null && !Array.isArray(oldVal)) {
          // Expand nested object (e.g. seo)
          const subKeys = Array.from(new Set([
            ...Object.keys(oldVal || {}),
            ...Object.keys(newVal || {})
          ]));
          for (const sk of subKeys) {
            const sv = (oldVal as any)[sk];
            const nv = (newVal as any)?.[sk];
            if (String(sv) !== String(nv)) {
              changeRows.push({ label: `${toLabel(key)}: ${toLabel(sk)}`, old: sv, nw: nv });
            }
          }
        } else {
          if (String(oldVal) !== String(newVal)) {
            changeRows.push({ label: toLabel(key), old: oldVal, nw: newVal });
          }
        }
      }

      if (changeRows.length === 0) {
        return <p className="text-[13px] text-[#646970] italic py-1">No visible changes were detected.</p>;
      }

      return (
        <div className="space-y-3 py-1">
          <div className="flex items-center gap-2 mb-1">
            {message && <p className="text-[13px] text-[#1d2327] font-semibold">{message}</p>}
            <span className="ml-auto text-[11px] text-[#646970] bg-[#f0f0f1] px-2 py-0.5 rounded-full">
              {changeRows.length} field{changeRows.length !== 1 ? 's' : ''} changed
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {changeRows.map((row, i) => (
              <ChangeRow key={i} label={row.label} oldVal={row.old} newVal={row.nw} />
            ))}
          </div>
        </div>
      );
    }

    return <p className="text-[13px] text-[#646970] italic py-1">Event logged.</p>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[23px] font-normal text-[#1d2327] font-serif">System Audit Logs</h1>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#646970] italic">Showing latest events across the system</span>
          <button onClick={fetchLogs} className="bg-white border border-[#c3c4c7] p-2 rounded-[3px] hover:bg-[#f6f7f7] shadow-sm"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#c3c4c7] p-5 flex flex-wrap gap-4 items-end rounded-sm shadow-sm">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
           <label className="text-[11px] font-bold text-[#1d2327] uppercase tracking-wide">User Agent</label>
           <div className="relative">
             <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8c8f94]" />
             <input type="text" value={filters.user} onChange={e => setFilters({...filters, user: e.target.value})} className="w-full border border-[#8c8f94] pl-9 pr-3 py-1.5 text-[13px] rounded-[3px] focus:border-[#2271b1] outline-none" placeholder="Search by username..." />
           </div>
        </div>
        <div className="space-y-1.5 flex-1 min-w-[200px]">
           <label className="text-[11px] font-bold text-[#1d2327] uppercase tracking-wide">Event Category</label>
           <div className="relative">
             <History className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8c8f94]" />
             <select value={filters.action} onChange={e => setFilters({...filters, action: e.target.value})} className="w-full border border-[#8c8f94] pl-9 pr-3 py-1.5 text-[13px] rounded-[3px] focus:border-[#2271b1] outline-none appearance-none bg-white">
                <option value="">All Events</option>
                <option value="LOGIN_SUCCESS">Login Success</option>
                <option value="LOGIN_FAILURE">Login Failure</option>
                <option value="CREATE_USER">User Created</option>
                <option value="UPDATE_USER">User Modified</option>
                <option value="DELETE_USER">User Removed</option>
                <option value="CREATE_PAGE">Page Created</option>
                <option value="UPDATE_PAGE">Page Modified</option>
                <option value="UPDATE_SETTINGS">Settings Changed</option>
             </select>
           </div>
        </div>
        <button onClick={() => setFilters({user: "", action: "", status: ""})} className="px-4 py-2 text-[13px] text-[#2271b1] font-medium hover:bg-[#f0f6fb] rounded-[3px] transition-colors border border-transparent hover:border-[#72aee6]">Clear All</button>
      </div>

      {/* WP-Style Table */}
      <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#c3c4c7] text-[#1d2327] text-[13px] bg-[#f6f7f7]">
              <th className="py-2.5 px-4 font-semibold w-10"></th>
              <th className="py-2.5 px-4 font-semibold">Timestamp</th>
              <th className="py-2.5 px-4 font-semibold">Initiator</th>
              <th className="py-2.5 px-4 font-semibold">Action</th>
              <th className="py-2.5 px-4 font-semibold">Resource</th>
              <th className="py-2.5 px-4 font-semibold">IP Address</th>
              <th className="py-2.5 px-4 font-semibold">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f1]">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#2271b1]" />
                  <span className="text-[13px] text-[#646970]">Analyzing logs...</span>
                </div>
              </td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-[#646970] italic">No activity recorded for this criteria.</td></tr>
            ) : logs.map((log) => (
              <Fragment key={log._id}>
                <tr 
                  onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                  className={`hover:bg-[#f6f7f7] cursor-pointer transition-colors ${expandedLog === log._id ? 'bg-[#f0f6fb]' : ''}`}
                >
                  <td className="py-3 px-4">
                     <History className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedLog === log._id ? 'rotate-180 text-[#2271b1]' : 'text-[#8c8f94]'}`} />
                  </td>
                  <td className="py-3 px-4 text-[12px] text-[#2c3338] font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 bg-[#dcdcde] rounded-full flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-[#50575e]" />
                       </div>
                       <span className="text-[13px] font-bold text-[#1d2327]">{log.userName || "System"}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                     <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${log.status === 'success' ? 'bg-white border-[#c3c4c7]' : 'bg-red-50 border-red-200 text-red-700'}`}>
                       {log.action}
                     </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-[#2c3338] font-medium">{log.entity || "-"}</span>
                      {log.entityId && <span className="text-[10px] text-[#8c8f94] font-mono truncate max-w-[100px]">{log.entityId}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[12px] text-[#646970] font-mono">{log.ip}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
                <AnimatePresence>
                  {expandedLog === log._id && (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: "auto", opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-[#f9f9f9] border-b border-[#c3c4c7]"
                        >
                          <div className="p-6">
                             <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e5e5e5]">
                               <History className="w-4 h-4 text-[#2271b1]" />
                               <span className="text-[12px] font-bold text-[#1d2327] uppercase">Detailed Event Modification Log</span>
                             </div>
                             {renderDetails(log.details)}
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </Fragment>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 border-t border-[#f0f0f1] bg-[#fcfcfc] flex items-center justify-between">
           <div className="text-[12px] text-[#646970]">
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
           </div>
           <div className="flex gap-2">
              <button 
                disabled={pagination.page <= 1} 
                onClick={() => setPagination(p => ({...p, page: p.page - 1}))}
                className="px-3 py-1 border border-[#c3c4c7] bg-white rounded-[3px] hover:bg-[#f6f7f7] disabled:opacity-30 flex items-center gap-1 text-[12px] font-medium"
              >
                <ChevronLeft className="w-3 h-3" /> Prev
              </button>
              <button 
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(p => ({...p, page: p.page + 1}))}
                className="px-3 py-1 border border-[#c3c4c7] bg-white rounded-[3px] hover:bg-[#f6f7f7] disabled:opacity-30 flex items-center gap-1 text-[12px] font-medium"
              >
                Next <ChevronRight className="w-3 h-3" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
