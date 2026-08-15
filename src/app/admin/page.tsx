"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText, Briefcase, Star, CircleHelp,
  ImageIcon, Phone, Settings, Plus, ExternalLink,
  Home, Layers, Users, Settings2, MessageSquare,
  Activity, Clock, CheckCircle, XCircle, RefreshCw,
  ArrowRight, Inbox, TrendingUp, Zap, Eye, User
} from "lucide-react";

const ACTION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  LOGIN_SUCCESS:    { label: "Logged in",           color: "text-green-700",  bg: "bg-green-100" },
  LOGIN_FAILURE:    { label: "Failed login",         color: "text-red-700",    bg: "bg-red-100"   },
  CREATE_USER:      { label: "Created user",         color: "text-blue-700",   bg: "bg-blue-100"  },
  UPDATE_USER:      { label: "Updated user",         color: "text-amber-700",  bg: "bg-amber-100" },
  DELETE_USER:      { label: "Deleted user",         color: "text-red-700",    bg: "bg-red-100"   },
  BULK_DELETE_USERS:{ label: "Bulk deleted users",   color: "text-red-700",    bg: "bg-red-100"   },
  CREATE_PAGE:      { label: "Created page",         color: "text-blue-700",   bg: "bg-blue-100"  },
  UPDATE_PAGE:      { label: "Updated page",         color: "text-amber-700",  bg: "bg-amber-100" },
  DELETE_PAGE:      { label: "Deleted page",         color: "text-red-700",    bg: "bg-red-100"   },
  DUPLICATE_PAGE:   { label: "Duplicated page",      color: "text-purple-700", bg: "bg-purple-100"},
  UPDATE_SETTINGS:  { label: "Changed settings",     color: "text-amber-700",  bg: "bg-amber-100" },
  VIEW_USERS:       { label: "Viewed users",         color: "text-gray-600",   bg: "bg-gray-100"  },
  VIEW_SUBMISSIONS: { label: "Viewed submissions",   color: "text-gray-600",   bg: "bg-gray-100"  },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const stats = data?.stats || {};
  const recentLogs = data?.recentLogs || [];
  const recentSubmissions = data?.recentSubmissions || [];

  const statCards = [
    { label: "Total Pages",       value: stats.pages,        icon: FileText,     href: "/admin/pages",       color: "bg-blue-50 text-blue-600 border-blue-100" },
    { label: "Team Members",      value: stats.users,        icon: Users,        href: "/admin/users",       color: "bg-purple-50 text-purple-600 border-purple-100" },
    { label: "Submissions",       value: stats.submissions,  icon: Inbox,        href: "/admin/submissions", color: "bg-green-50 text-green-600 border-green-100" },
    { label: "New This Week",     value: stats.newSubmissions, icon: TrendingUp, href: "/admin/submissions", color: "bg-amber-50 text-amber-600 border-amber-100" },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-normal text-[#1d2327] font-serif">Dashboard</h1>
          <p className="text-[13px] text-[#646970] mt-0.5">Welcome back. Here's what's happening on your site.</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-1.5 bg-white border border-[#c3c4c7] px-3 py-1.5 rounded-[3px] text-[13px] text-[#2c3338] hover:bg-[#f6f7f7] shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link key={i} href={card.href}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm p-4 hover:shadow-md hover:border-[#a7aaad] transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold text-[#646970] uppercase tracking-wider mb-1">{card.label}</p>
                  <p className="text-[28px] font-bold text-[#1d2327] leading-none">
                    {loading ? <span className="inline-block w-8 h-7 bg-[#f0f0f1] rounded animate-pulse" /> : (card.value ?? 0)}
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-[4px] border flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-4.5 h-4.5" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity Feed — 2/3 width */}
        <div className="lg:col-span-2 bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#c3c4c7] bg-[#f6f7f7] flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#1d2327] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#82878c]" /> Recent Activity
            </h2>
            <Link href="/admin/logs" className="text-[12px] text-[#2271b1] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-7 h-7 bg-[#f0f0f1] rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-[#f0f0f1] rounded w-3/4" />
                    <div className="h-2.5 bg-[#f0f0f1] rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="p-10 text-center text-[13px] text-[#646970] italic">No activity recorded yet.</div>
          ) : (
            <div className="divide-y divide-[#f0f0f1]">
              {recentLogs.map((log: any, i: number) => {
                const meta = ACTION_LABELS[log.action] || { label: log.action, color: "text-gray-600", bg: "bg-gray-100" };
                return (
                  <div key={log._id} className="px-4 py-3 flex items-center gap-3 hover:bg-[#fcfcfc] transition-colors">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${meta.bg}`}>
                      <User className={`w-3.5 h-3.5 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#1d2327]">
                        <span className="font-semibold">{log.userName || "System"}</span>
                        {" "}
                        <span className={`font-medium ${meta.color}`}>{meta.label}</span>
                        {log.entity && log.entity !== "User" && (
                          <span className="text-[#646970]"> — {log.entity}</span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#8c8f94] mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(log.timestamp)}
                        {log.ip && log.ip !== "::1" && (
                          <span className="ml-2 font-mono">{log.ip}</span>
                        )}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${log.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {log.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">

          {/* Recent Submissions */}
          <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#c3c4c7] bg-[#f6f7f7] flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#1d2327] flex items-center gap-2">
                <Inbox className="w-4 h-4 text-[#82878c]" /> New Submissions
              </h2>
              <Link href="/admin/submissions" className="text-[12px] text-[#2271b1] hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="p-4 space-y-3 animate-pulse">
                {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-[#f0f0f1] rounded" />)}
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-[#646970] italic">No submissions yet.</div>
            ) : (
              <div className="divide-y divide-[#f0f0f1]">
                {recentSubmissions.map((sub: any, i: number) => (
                  <div key={sub._id || i} className="px-4 py-2.5 hover:bg-[#fcfcfc]">
                    <p className="text-[13px] font-semibold text-[#1d2327] truncate">{sub.name || "Anonymous"}</p>
                    <p className="text-[11px] text-[#646970] truncate">{sub.email}</p>
                    <p className="text-[10px] text-[#8c8f94] mt-0.5">{timeAgo(sub.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[14px] font-semibold text-[#1d2327] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#82878c]" /> Quick Actions
              </h2>
            </div>
            <div className="p-3 space-y-1">
              {[
                { label: "Manage Pages",      href: "/admin/pages",       icon: FileText    },
                { label: "Edit Services",     href: "/admin/services",    icon: Layers      },
                { label: "View Submissions",  href: "/admin/submissions", icon: MessageSquare },
                { label: "Manage Users",      href: "/admin/users",       icon: Users       },
                { label: "Site Settings",     href: "/admin/settings",    icon: Settings    },
                { label: "View Frontend",     href: "/",                  icon: ExternalLink, target: "_blank" },
              ].map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  target={(link as any).target}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-[3px] text-[13px] text-[#2271b1] hover:bg-[#f0f6fb] hover:text-[#135e96] transition-colors group"
                >
                  <link.icon className="w-4 h-4 text-[#82878c] group-hover:text-[#2271b1]" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
