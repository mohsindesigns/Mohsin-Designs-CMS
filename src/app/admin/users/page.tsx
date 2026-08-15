"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Search, Trash2, Edit3, User, Shield, 
  Mail, Calendar, Loader2, Check, X, Eye, 
  EyeOff, MoreHorizontal, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UI } from "@/components/admin/editors/styles";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState({ username: "", email: "", password: "", roleId: "", status: "active" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uRes, rRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/roles")
      ]);
      const uData = await uRes.json();
      const rData = await rRes.json();
      setUsers(uData);
      setRoles(rData);
      if (rData.length > 0 && !form.roleId) setForm(f => ({ ...f, roleId: rData[0]._id }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingUser ? `/api/admin/users/${editingUser._id}` : "/api/admin/users";
    const method = editingUser ? "PATCH" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
        setForm({ username: "", email: "", password: "", roleId: roles[0]?._id, status: "active" });
      } else {
        const err = await res.json();
        alert(err.error || "Save failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
      else alert("Delete failed");
    } catch (err) { alert("Network error"); }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    if (bulkAction === 'delete' && !confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) return;

    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action: bulkAction })
      });
      if (res.ok) {
        setSelectedIds([]);
        setBulkAction("");
        fetchData();
      } else {
        alert("Bulk action failed");
      }
    } catch (err) { alert("Network error"); }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) setSelectedIds([]);
    else setSelectedIds(filteredUsers.map(u => u._id));
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-[#646970] font-serif">Loading Users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[23px] font-normal text-[#1d2327] font-serif">Users</h1>
        <button 
          onClick={() => { setEditingUser(null); setForm({ username: "", email: "", password: "", roleId: roles[0]?._id, status: "active" }); setShowModal(true); }}
          className="bg-[#2271b1] text-white px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#135e96] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select 
            value={bulkAction} 
            onChange={(e) => setBulkAction(e.target.value)}
            className="border border-[#8c8f94] bg-white px-2 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1]"
          >
            <option value="">Bulk Actions</option>
            <option value="delete">Delete</option>
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
          </select>
          <button 
            onClick={handleBulkAction}
            className="border border-[#2271b1] text-[#2271b1] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f0f6fb] transition-colors font-medium"
          >
            Apply
          </button>
        </div>
        <div className="flex items-center gap-2">
           <input
             type="text"
             placeholder="Search users..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1]"
           />
        </div>
      </div>

      {/* WP-Style Table */}
      <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-[#c3c4c7] text-[#1d2327] text-[14px] bg-[#f6f7f7]">
              <th className="py-2 px-3 w-10">
                <input type="checkbox" checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-[#8c8f94]" />
              </th>
              <th className="py-2 px-3 font-semibold">Username</th>
              <th className="py-2 px-3 font-semibold">Email</th>
              <th className="py-2 px-3 font-semibold">Role</th>
              <th className="py-2 px-3 font-semibold">Status</th>
              <th className="py-2 px-3 font-semibold">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id} className={`border-b border-[#f0f0f1] hover:bg-[#f6f7f7] group transition-colors ${selectedIds.includes(u._id) ? 'bg-[#f0f6fb]' : ''}`}>
                <td className="py-3 px-3">
                  <input type="checkbox" checked={selectedIds.includes(u._id)} onChange={() => toggleSelect(u._id)} className="w-4 h-4 rounded border-[#8c8f94]" />
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-[#2271b1]">{u.username}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                      <button onClick={() => { setEditingUser(u); setForm({ ...u, roleId: u.role?._id, password: "" }); setShowModal(true); }} className="text-[#2271b1] text-[12px] hover:underline">Edit</button>
                      <span className="text-[#c3c4c7] text-[12px]">|</span>
                      <button onClick={() => handleDelete(u._id)} className="text-[#d63638] text-[12px] hover:underline">Delete</button>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-[13px] text-[#2c3338]">{u.email}</td>
                <td className="py-3 px-3 text-[13px] text-[#2c3338]">{u.role?.name || "No Role"}</td>
                <td className="py-3 px-3 text-[13px]">
                   <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.status}
                   </span>
                </td>
                <td className="py-3 px-3 text-[13px] text-[#646970]">
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#c3c4c7] w-full max-w-md shadow-2xl rounded-sm overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[#f0f0f1] bg-[#f6f7f7] flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-[#1d2327]">{editingUser ? "Edit User" : "Add New User"}</h3>
                <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-[#646970]" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#1d2327] uppercase">Username</label>
                  <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1]" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#1d2327] uppercase">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1]" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#1d2327] uppercase">{editingUser ? "New Password (Optional)" : "Password"}</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1]" required={!editingUser} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#646970]">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#1d2327] uppercase">Role</label>
                  <select value={form.roleId} onChange={e => setForm({...form, roleId: e.target.value})} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1]" required>
                    {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                   <input type="checkbox" checked={form.status === 'active'} onChange={e => setForm({...form, status: e.target.checked ? 'active' : 'inactive'})} className="w-4 h-4" />
                   <label className="text-[13px] text-[#1d2327]">Active User</label>
                </div>
                <div className="pt-4 flex gap-3">
                   <button type="submit" className="flex-1 bg-[#2271b1] text-white py-2 text-[13px] font-bold rounded-[3px] hover:bg-[#135e96] transition-colors">{editingUser ? "Update User" : "Create User"}</button>
                   <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-[#c3c4c7] text-[#1d2327] text-[13px] font-bold rounded-[3px] hover:bg-[#f6f7f7]">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
