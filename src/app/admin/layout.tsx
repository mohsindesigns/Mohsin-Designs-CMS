"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, Briefcase, Star,
  CircleHelp, ImageIcon, Phone, Settings, LogOut,
  Shield, Menu, X, Globe, Folder, Code2, ExternalLink, User, Plus, ChevronDown, Loader2
} from "lucide-react";

const navItems = [
  { label: "Dashboard",   href: "/admin",           icon: LayoutDashboard, module: 'dashboard' },
  { label: "Pages",       href: "/admin/pages",      icon: FileText, module: 'pages', sub: [{label: "All Pages", href: "/admin/pages"}, {label: "Add New", href: "/admin/pages"}] },
  { label: "Blog",        href: "/admin/blog",       icon: FileText, module: 'blog', sub: [
    {label: "All Posts", href: "/admin/blog"},
    {label: "Add New", href: "/admin/blog/new"},
    {label: "Categories", href: "/admin/blog/categories"},
    {label: "Tags", href: "/admin/blog/tags"}
  ] },
  { label: "Media",       href: "/admin/media",      icon: ImageIcon, module: 'media', sub: [{label: "Library", href: "/admin/media"}, {label: "Add New", href: "/admin/media"}] },
  { label: "Reviews",     href: "/admin/reviews",    icon: Star, module: 'pages' }, 
  { label: "Projects",    href: "/admin/projects",   icon: Folder, module: 'pages' },
  { label: "FAQ",         href: "/admin/faq",        icon: CircleHelp, module: 'pages' },
  { label: "Services",    href: "/admin/services",   icon: Briefcase, module: 'pages' },
  { label: "Submissions", href: "/admin/submissions", icon: Phone, module: 'submissions' },
  { label: "Users",       href: "/admin/users",       icon: User, module: 'users', sub: [{label: "All Users", href: "/admin/users"}, {label: "Add User", href: "/admin/users"}, {label: "Roles", href: "/admin/roles"}] },
  { label: "Activity Logs", href: "/admin/activity-logs",      icon: FileText, module: 'logs' },
  { label: "Scripts",     href: "/admin/scripts",    icon: Code2, module: 'settings' },
  { label: "Settings",    href: "/admin/settings",   icon: Settings, module: 'settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = pathname === "/admin/login" || pathname === "/admin/forgot-password" || pathname?.startsWith("/admin/reset-password");

  useEffect(() => {
    document.title = "Eagle Dashboard Mohsin Design";

    if (isPublicPath) {
      setLoading(false);
      return;
    }

    fetch("/api/admin/me")
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          router.push("/admin/login?from=" + pathname);
        } else {
          setUser(data);
        }
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false));
  }, [pathname, router, isPublicPath]);

  if (isPublicPath) return <>{children}</>;
  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f0f0f1]"><Loader2 className="w-6 h-6 animate-spin text-[#2271b1]" /></div>;
  if (!user) return null;

  const filteredNav = navItems.filter(item => {
    if (item.module === 'dashboard') return true;
    const perms = user.permissions[item.module];
    return perms && perms.read;
  });

  return (
    <div className="flex flex-col h-screen bg-[#f0f0f1] overflow-hidden select-none antialiased">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-2 h-10 bg-[#1d2327] text-[#c3c4c7] text-[13px] z-[60] flex-shrink-0 shadow-[0_1px_0_rgba(255,255,255,0.05)]">
         <div className="flex items-center h-full">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden hover:bg-[#2c3338] px-3 h-full"><Menu className="w-4 h-4" /></button>
            <Link href="/admin" className="hover:bg-[#2c3338] px-4 h-full flex items-center gap-2">
               <Shield className="w-4.5 h-4.5 text-[#72aee6]" />
               <span className="font-bold text-[#f0f0f1]">Eagle Revolution</span>
            </Link>
            <Link href="/" target="_blank" className="hover:bg-[#2c3338] px-3.5 h-full flex items-center gap-1.5 hidden sm:flex">
               <Globe className="w-3.5 h-3.5 text-[#8f959c]" />
               <span className="font-medium text-[#c3c4c7] hover:text-white transition-colors">Visit Site</span>
            </Link>
         </div>
         <div className="flex items-center h-full">
            <div className="hover:bg-[#2c3338] px-4 h-full flex items-center gap-2 cursor-pointer group">
               <span className="text-[#c3c4c7] group-hover:text-[#72aee6] transition-colors">Howdy, {user.username}</span>
               <div className="w-6 h-6 bg-[#3c434a] rounded-sm flex items-center justify-center border border-[#50575e]">
                  <User className="w-4 h-4 text-[#a7aaad]" />
               </div>
            </div>
         </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar user={user} navItems={filteredNav} onClose={() => setMobileOpen(false)} isMobile={mobileOpen} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
           <AnimatePresence mode="wait">
             <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
               {children}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ user, navItems, onClose, isMobile }: { user: any, navItems: any[], onClose: () => void, isMobile: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      <aside className={`
        fixed lg:relative h-full left-0 w-44 bg-[#1d2327] text-[#f0f0f1] border-r border-[#3c434a] z-[100] transition-transform duration-300
        ${isMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        overflow-visible
      `}>
        <nav className="flex-1 flex flex-col py-1 overflow-visible">
          <div className="flex-1 overflow-visible">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 py-2.5 text-[13px] transition-all ${
                      active 
                        ? "bg-[#1c2226] border-l-[3px] border-[#72aee6] text-white font-bold pl-[13px] pr-3" 
                        : "border-l-[3px] border-transparent hover:bg-[#2c3338] hover:text-[#72aee6] text-[#c3c4c7] pl-[13px] pr-3"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-[#72aee6]" : "text-[#a7aaad] group-hover:text-[#72aee6]"}`} />
                    <span>{item.label}</span>
                  </Link>
                  {item.sub && (
                    <div className="absolute left-full top-0 w-44 bg-[#2c3338] border border-[#3c434a]/80 shadow-xl hidden group-hover:block z-[200]">
                       {item.sub.map((s: { label: string, href: string }) => (
                         <Link 
                           key={s.label} 
                           href={s.href} 
                           onClick={onClose} 
                           className="block px-4 py-2.5 text-[12px] text-[#c3c4c7] hover:bg-[#1c2226] hover:text-[#72aee6] border-b border-[#3c434a]/30 last:border-0 transition-colors"
                         >
                           {s.label}
                         </Link>
                       ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="p-2 border-t border-[#3c434a]">
             <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-[#c3c4c7] hover:text-[#d63638] transition-colors">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
             </button>
          </div>
        </nav>
      </aside>
      {isMobile && <div className="fixed inset-0 bg-black/50 z-[90] lg:hidden" onClick={onClose} />}
    </>
  );
}
