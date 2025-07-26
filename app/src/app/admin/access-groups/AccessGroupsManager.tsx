"use client";
import React, { useState, useEffect } from "react";

type AccessGroup = {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  features: number[]; // feature IDs
};

type Feature = {
  id: number;
  name: string;
};

const defaultGroup: Partial<AccessGroup> = {
  name: "",
  description: "",
  features: [],
};

export default function AccessGroupsManager() {
  const [groups, setGroups] = useState<AccessGroup[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [editing, setEditing] = useState<AccessGroup | null>(null);
  const [form, setForm] = useState<Partial<AccessGroup>>(defaultGroup);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setFeatures([
        { id: 1, name: "Dashboard" },
        { id: 2, name: "Admin" },
        { id: 3, name: "Insights" },
      ]);
      setGroups([
        { id: 1, name: "Admins", description: "Full access", features: [1, 2, 3], created_at: new Date().toISOString() },
        { id: 2, name: "Users", description: "Standard users", features: [1, 3], created_at: new Date().toISOString() },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (featureId: number) => {
    setForm((prev) => {
      const current = prev.features || [];
      return {
        ...prev,
        features: current.includes(featureId)
          ? current.filter((id) => id !== featureId)
          : [...current, featureId],
      };
    });
  };

  const handleEdit = (group: AccessGroup) => {
    setEditing(group);
    setForm(group);
  };

  const handleDelete = (id: number) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setEditing(null);
    setForm(defaultGroup);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (editing) {
        setGroups((prev) => prev.map((g) => (g.id === editing.id ? { ...editing, ...form, features: form.features || [] } as AccessGroup : g)));
      } else {
        setGroups((prev) => [...prev, { ...form, id: Date.now(), features: form.features || [] } as AccessGroup]);
      }
      setEditing(null);
      setForm(defaultGroup);
      setLoading(false);
    }, 500);
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(filter.toLowerCase()) ||
    (g.description || "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Access Groups</h2>
        <input
          type="text"
          placeholder="Filter groups..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="input w-full md:w-64"
        />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 bg-[var(--card-bg)] p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" value={form.name || ""} onChange={handleChange} placeholder="Group Name" className="input" required />
          <textarea name="description" value={form.description || ""} onChange={handleChange} placeholder="Description" className="input" />
        </div>
        <div>
          <label className="block font-semibold mb-2">Features</label>
          <div className="flex flex-wrap gap-2">
            {features.map(f => (
              <label key={f.id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={!!form.features?.includes(f.id)}
                  onChange={() => handleFeatureToggle(f.id)}
                />
                {f.name}
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>{editing ? "Update" : "Create"}</button>
          {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm(defaultGroup); }}>Cancel</button>}
        </div>
      </form>
      <div className="bg-[var(--card-bg)] rounded-lg shadow p-4">
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Description</th>
              <th className="p-2">Features</th>
              <th className="p-2">Created</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((g) => (
              <React.Fragment key={g.id}>
                <tr className="border-t hover:bg-[var(--gray-light)] cursor-pointer" onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
                  <td className="p-2 font-semibold">{g.name}</td>
                  <td className="p-2">{g.description}</td>
                  <td className="p-2 text-xs">{g.features.map(fid => features.find(f => f.id === fid)?.name).join(", ")}</td>
                  <td className="p-2 text-xs">{g.created_at ? new Date(g.created_at).toLocaleString() : ""}</td>
                  <td className="p-2 flex gap-2">
                    <button className="btn btn-sm btn-primary" onClick={e => { e.stopPropagation(); handleEdit(g); }}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={e => { e.stopPropagation(); handleDelete(g.id); }}>Delete</button>
                  </td>
                </tr>
                {expanded === g.id && (
                  <tr className="bg-[var(--gray-light)]">
                    <td colSpan={5} className="p-4">
                      <div className="text-sm">
                        <strong>ID:</strong> {g.id}<br />
                        <strong>Name:</strong> {g.name}<br />
                        <strong>Description:</strong> {g.description}<br />
                        <strong>Features:</strong> {g.features.map(fid => features.find(f => f.id === fid)?.name).join(", ")}<br />
                        <strong>Created:</strong> {g.created_at ? new Date(g.created_at).toLocaleString() : ""}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
