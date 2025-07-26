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
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError("");
    setFeatures([
      { id: 1, name: "Dashboard" },
      { id: 2, name: "Admin" },
      { id: 3, name: "Insights" },
    ]);
    fetch("/api/access-groups")
      .then(async res => {
        if (!res.ok) {
          const err = await res.text();
          setError(`Failed to fetch access groups: ${err}`);
          setLoading(false);
          return;
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setGroups(data);
        setLoading(false);
      })
      .catch(e => {
        setError(`Fetch error: ${e}`);
        setLoading(false);
      });
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

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/access-groups/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.text();
        setError(`Delete error: ${err}`);
      } else {
        setGroups((prev) => prev.filter((g) => g.id !== id));
        setEditing(null);
        setForm(defaultGroup);
      }
    } catch (e) {
      setError(`Delete fetch error: ${e}`);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (editing) {
      try {
        const res = await fetch(`/api/access-groups/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, description: form.description }),
        });
        if (res.ok) {
          const updated = await res.json();
          setGroups((prev) => prev.map((g) => (g.id === editing.id ? updated : g)));
        } else {
          const err = await res.text();
          setError(`Update error: ${err}`);
        }
      } catch (e) {
        setError(`Update fetch error: ${e}`);
      }
    } else {
      try {
        const res = await fetch("/api/access-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, description: form.description }),
        });
        if (res.ok) {
          const created = await res.json();
          setGroups((prev) => [...prev, created]);
        } else {
          const err = await res.text();
          setError(`Create error: ${err}`);
        }
      } catch (e) {
        setError(`Create fetch error: ${e}`);
      }
    }
    setEditing(null);
    setForm(defaultGroup);
    setLoading(false);
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(filter.toLowerCase()) ||
    (g.description || "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-8">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">
          <strong>Error:</strong> {error}
        </div>
      )}
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
