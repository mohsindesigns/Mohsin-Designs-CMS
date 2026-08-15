"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Shield, Save, X, Trash2, Edit3, 
  Check, AlertCircle, Loader2, Lock, Unlock 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MODULES = [
  { id: 'pages', label: 'Pages', actions: ['create', 'read', 'update', 'delete', 'publish'] },
  { id: 'media', label: 'Media', actions: ['create', 'read', 'update', 'delete'] },
  { id: 'seo', label: 'SEO', actions: ['read', 'update'] },
  { id: 'blog', label: 'Blog', actions: ['create', 'read', 'update', 'delete', 'publish'] },
  { id: 'submissions', label: 'Submissions', actions: ['read', 'delete'] },
  { id: 'settings', label: 'Settings', actions: ['read', 'update'] },
  { id: 'users', label: 'Users', actions: ['create', 'read', 'update', 'delete'] },
  { id: 'logs', label: 'Logs', actions: ['read'] },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState<any>({
    name: "",
    permissions: MODULES.reduce((acc: any, mod) => {
      acc[mod.id] = mod.actions.reduce((a: any, act) => {
        a[act] = false;
        return a;
      }, {});
      return acc;
    }, {}),
    isCustom: true
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (module: string, action: string) => {
    setForm((prev: any) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: !prev.permissions[module][action]
        }
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = editingRole ? `/api/admin/roles/${editingRole._id}` : "/api/admin/roles";
    const method = editingRole ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowModal(false);
        fetchRoles();
      } else {
        const err = await res.json();
        alert(err.error || "Save failed");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role? Users assigned to this role will lose access.")) return;
    try {
      const res = await fetch(`/api/admin/roles/${id}`, { method: "DELETE" });
      if (res.ok) fetchRoles();
      else {
        const err = await res.json();
        alert(err.error || "Delete failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-[#646970] font-serif">Loading Roles...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[23px] font-normal text-[#1d2327] font-serif">Roles & Permissions</h1>
        <button 
          onClick={() => { 
            setEditingRole(null); 
            setForm({
              name: "",
              permissions: MODULES.reduce((acc: any, mod) => {
                acc[mod.id] = mod.actions.reduce((a: any, act) => { a[act] = false; return a; }, {});
                return acc;
              }, {}),
              isCustom: true
            });
            setShowModal(true); 
          }}
          className="bg-[#2271b1] text-white px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#135e96] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role._id} className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm flex flex-col">
            <div className="px-4 py-3 border-b border-[#f0f0f1] bg-[#f6f7f7] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${role.isCustom ? 'text-[#2271b1]' : 'text-orange-500'}`} />
                <span className="text-[14px] font-bold text-[#1d2327]">{role.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingRole(role); setForm(role); setShowModal(true); }} className="p-1 hover:bg-[#dcdcde] rounded-sm"><Edit3 className="w-3.5 h-3.5 text-[#2271b1]" /></button>
                {role.isCustom && (
                  <button onClick={() => handleDelete(role._id)} className="p-1 hover:bg-[#f8d7da] rounded-sm text-[#d63638]"><Trash2 className="w-3.5 h-3.5" /></button>
                )}
              </div>
            </div>
            <div className="p-4 flex-1">
              <div className="text-[12px] text-[#646970] mb-3 uppercase font-bold tracking-wider">Key Permissions</div>
              <div className="grid grid-cols-2 gap-2">
                {MODULES.slice(0, 4).map(mod => {
                  const hasSome = Object.values(role.permissions[mod.id] || {}).some(v => v === true);
                  return (
                    <div key={mod.id} className="flex items-center gap-2 text-[12px]">
                      <div className={`w-1.5 h-1.5 rounded-full ${hasSome ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={hasSome ? 'text-[#1d2327] font-medium' : 'text-[#a7aaad]'}>{mod.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-4 py-2 bg-[#fcfcfc] border-t border-[#f0f0f1] text-[11px] text-[#646970]">
              {role.isCustom ? "Custom User Role" : "System Protected Role"}
            </div>
          </div>
        ))}
      </div>

      {/* Matrix Editor Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#c3c4c7] w-full max-w-4xl max-h-[90vh] shadow-2xl rounded-sm overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-[#f0f0f1] bg-[#f6f7f7] flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-[#1d2327]">{editingRole ? `Edit Role: ${editingRole.name}` : "Create New Role"}</h3>
                <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-[#646970]" /></button>
              </div>
              
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-1.5 max-w-sm">
                  <label className="text-[12px] font-bold text-[#1d2327] uppercase tracking-wider">Role Name</label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    className="w-full border border-[#8c8f94] px-3 py-2 text-[14px] rounded-[3px] outline-none focus:border-[#2271b1]" 
                    placeholder="e.g. Content Manager"
                    required 
                    disabled={!form.isCustom && editingRole}
                  />
                  {!form.isCustom && editingRole && <p className="text-[11px] text-orange-600 italic">System roles cannot be renamed.</p>}
                </div>

                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-[#1d2327] uppercase tracking-wider block mb-4">Permission Matrix</label>
                  
                  <div className="border border-[#c3c4c7] rounded-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7]">
                          <th className="py-2 px-4 text-[12px] font-bold text-[#1d2327] w-40">Module</th>
                          <th className="py-2 px-4 text-[12px] font-bold text-[#1d2327]">Permissions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f0f1]">
                        {MODULES.map((mod) => (
                          <tr key={mod.id} className="hover:bg-[#fcfcfc]">
                            <td className="py-3 px-4 font-bold text-[13px] text-[#1d2327]">{mod.label}</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-x-6 gap-y-2">
                                {mod.actions.map(action => (
                                  <label key={action} className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                      <input 
                                        type="checkbox" 
                                        checked={form.permissions[mod.id]?.[action]} 
                                        onChange={() => handleToggle(mod.id, action)}
                                        className="w-4 h-4 rounded border-[#8c8f94] text-[#2271b1] focus:ring-offset-0 focus:ring-0"
                                      />
                                    </div>
                                    <span className="text-[12px] text-[#2c3338] capitalize group-hover:text-[#2271b1] transition-colors">{action}</span>
                                  </label>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </form>

              <div className="px-6 py-4 bg-[#f6f7f7] border-t border-[#c3c4c7] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-[#c3c4c7] text-[#1d2327] text-[13px] font-bold rounded-[3px] hover:bg-[#dcdcde]">Cancel</button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#2271b1] text-white px-6 py-2 text-[13px] font-bold rounded-[3px] hover:bg-[#135e96] transition-colors flex items-center gap-2 shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingRole ? "Save Permissions" : "Create Role"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
