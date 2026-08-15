"use client";

import { useState, useEffect } from "react";

export default function BlogTags() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState({ name: "", slug: "" });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const res = await fetch('/api/admin/blog/tags');
    const data = await res.json();
    if (res.ok) setTags(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.name) return;
    try {
      const res = await fetch('/api/admin/blog/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTag)
      });
      if (res.ok) {
        setNewTag({ name: "", slug: "" });
        fetchTags();
      }
    } catch (err) {
      alert("Failed to create tag");
    }
  };

  return (
    <div className="bg-[#f0f0f1] min-h-screen font-sans">
      <h1 className="text-[23px] font-normal text-[#1d2327] font-serif mb-4">Tags</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <h2 className="text-[14px] font-semibold mb-3">Add New Tag</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] mb-1">Name</label>
              <input 
                type="text" 
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                className="w-full border border-[#c3c4c7] px-2 py-1.5 bg-white outline-none focus:border-[#2271b1]"
              />
            </div>
            <div>
              <label className="block text-[13px] mb-1">Slug</label>
              <input 
                type="text" 
                value={newTag.slug}
                onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
                className="w-full border border-[#c3c4c7] px-2 py-1.5 bg-white outline-none focus:border-[#2271b1]"
              />
            </div>
            <button className="bg-[#2271b1] text-white text-[13px] px-3 py-1.5 rounded-[3px] border border-[#135e96] hover:bg-[#135e96]">Add New Tag</button>
          </form>
        </div>

        <div className="flex-1">
          <div className="bg-white border border-[#c3c4c7]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#c3c4c7] text-[13px] font-bold">
                  <th className="px-3 py-2 w-10 text-center"><input type="checkbox" /></th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-10 text-center text-[#646970]">Loading...</td></tr>
                ) : tags.map(tag => (
                  <tr key={tag._id} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7] group text-[13px]">
                    <td className="px-3 py-3 text-center"><input type="checkbox" /></td>
                    <td className="px-3 py-3 font-bold text-[#2271b1]">
                      {tag.name}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 mt-1 font-normal text-[11px]">
                         <button className="hover:text-[#135e96]">Edit</button>
                         <span className="text-[#c3c4c7]">|</span>
                         <button className="text-[#d63638]">Delete</button>
                      </div>
                    </td>
                    <td className="px-3 py-3">{tag.slug}</td>
                    <td className="px-3 py-3">{tag.count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
