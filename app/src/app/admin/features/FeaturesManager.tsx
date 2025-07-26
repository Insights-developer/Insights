"use client";
import React, { useState, useEffect } from "react";

type Feature = {
  id: number;
  name: string;
  description?: string;
  route?: string;
  created_at?: string;
};

const defaultFeature: Partial<Feature> = {
  name: "",
  description: "",
  route: "",
};

export default function FeaturesManager() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [editing, setEditing] = useState<Feature | null>(null);
  const [form, setForm] = useState<Partial<Feature>>(defaultFeature);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setFeatures([
        { id: 1, name: "Dashboard", description: "Main dashboard", route: "/dashboard", created_at: new Date().toISOString() },
        { id: 2, name: "Admin", description: "Admin panel", route: "/admin", created_at: new Date().toISOString() },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (feature: Feature) => {
    setEditing(feature);
    setForm(feature);
  };

  const handleDelete = (id: number) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
    setEditing(null);
    setForm(defaultFeature);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (editing) {
        setFeatures((prev) => prev.map((f) => (f.id === editing.id ? { ...editing, ...form } as Feature : f)));
      } else {
        setFeatures((prev) => [...prev, { ...form, id: Date.now() } as Feature]);
      }
      setEditing(null);
      setForm(defaultFeature);
      setLoading(false);
    }, 500);
  };

  const filteredFeatures = features.filter(f =>
    f.name.toLowerCase().includes(filter.toLowerCase()) ||
    (f.description || "").toLowerCase().includes(filter.toLowerCase()) ||
    (f.route || "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Features</h2>
        <input
          type="text"
          placeholder="Filter features..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="input w-full md:w-64"
        />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 bg-[var(--card-bg)] p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="name" value={form.name || ""} onChange={handleChange} placeholder="Feature Name" className="input" required />
          <input name="route" value={form.route || ""} onChange={handleChange} placeholder="Route (e.g. /dashboard)" className="input" />
          <textarea name="description" value={form.description || ""} onChange={handleChange} placeholder="Description" className="input" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>{editing ? "Update" : "Create"}</button>
          {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm(defaultFeature); }}>Cancel</button>}
        </div>
      </form>
      <div className="bg-[var(--card-bg)] rounded-lg shadow p-4">
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Route</th>
              <th className="p-2">Description</th>
              <th className="p-2">Created</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeatures.map((f) => (
              <React.Fragment key={f.id}>
                <tr className="border-t hover:bg-[var(--gray-light)] cursor-pointer" onClick={() => setExpanded(expanded === f.id ? null : f.id)}>
                  <td className="p-2 font-semibold">{f.name}</td>
                  <td className="p-2">{f.route}</td>
                  <td className="p-2">{f.description}</td>
                  <td className="p-2 text-xs">{f.created_at ? new Date(f.created_at).toLocaleString() : ""}</td>
                  <td className="p-2 flex gap-2">
                    <button className="btn btn-sm btn-primary" onClick={e => { e.stopPropagation(); handleEdit(f); }}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={e => { e.stopPropagation(); handleDelete(f.id); }}>Delete</button>
                  </td>
                </tr>
                {expanded === f.id && (
                  <tr className="bg-[var(--gray-light)]">
                    <td colSpan={5} className="p-4">
                      <div className="text-sm">
                        <strong>ID:</strong> {f.id}<br />
                        <strong>Name:</strong> {f.name}<br />
                        <strong>Route:</strong> {f.route}<br />
                        <strong>Description:</strong> {f.description}<br />
                        <strong>Created:</strong> {f.created_at ? new Date(f.created_at).toLocaleString() : ""}
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
