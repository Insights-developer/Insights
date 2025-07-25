"use client";
import React, { useEffect, useState } from "react";

// Define the fields for the app configuration
type AppConfig = {
  id: number;
  app_name: string;
  company_name: string;
  support_email: string;
  logo_url?: string;
  primary_color?: string;
  accent_color?: string;
  theme?: string;
  landing_page_message?: string;
  maintenance_mode: boolean;
  feature_toggles: Record<string, boolean>;
  analytics_enabled: boolean;
  default_timezone: string;
  currency: string;
  terms_url?: string;
  privacy_url?: string;
  created_at?: string;
  updated_at?: string;
};

const defaultConfig: Partial<AppConfig> = {
  app_name: "",
  company_name: "",
  support_email: "",
  logo_url: "",
  primary_color: "",
  accent_color: "",
  theme: "light",
  landing_page_message: "",
  maintenance_mode: false,
  feature_toggles: {},
  analytics_enabled: true,
  default_timezone: "UTC",
  currency: "USD",
  terms_url: "",
  privacy_url: "",
};

export default function AppConfigManager(): React.ReactElement {
  const [configs, setConfigs] = useState<AppConfig[]>([]);
  const [editing, setEditing] = useState<AppConfig | null>(null);
  const [form, setForm] = useState<Partial<AppConfig>>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Replace with real API calls
  useEffect(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setConfigs([
        {
          id: 1,
          app_name: "Insights",
          company_name: "Insights Inc.",
          support_email: "support@example.com",
          logo_url: "https://placehold.co/100x100",
          primary_color: "#0070f3",
          accent_color: "#ff4081",
          theme: "light",
          landing_page_message: "Welcome to Insights!",
          maintenance_mode: false,
          feature_toggles: { featureA: true },
          analytics_enabled: true,
          default_timezone: "UTC",
          currency: "USD",
          terms_url: "https://example.com/terms",
          privacy_url: "https://example.com/privacy",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      // Only HTMLInputElement has 'checked'
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      if (editing) {
        setConfigs((prev) => prev.map((c) => (c.id === editing.id ? { ...editing, ...form } as AppConfig : c)));
      } else {
        setConfigs((prev) => [
          ...prev,
          { ...form, id: Date.now() } as AppConfig,
        ]);
      }
      setEditing(null);
      setForm(defaultConfig);
      setLoading(false);
    }, 500);
  }

  function handleEdit(config: AppConfig) {
    setEditing(config);
    setForm(config);
  }

  function handleDelete(id: number) {
    setConfigs((prev) => prev.filter((c) => c.id !== id));
    if (editing && editing.id === id) {
      setEditing(null);
      setForm(defaultConfig);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">App Configuration</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">{error}</div>}
      <form className="space-y-4 bg-[var(--card-bg)] p-6 rounded-lg shadow mb-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="app_name" value={form.app_name || ""} onChange={handleChange} placeholder="App Name" className="input" required />
          <input name="company_name" value={form.company_name || ""} onChange={handleChange} placeholder="Company Name" className="input" />
          <input name="support_email" value={form.support_email || ""} onChange={handleChange} placeholder="Support Email" className="input" />
          <input name="logo_url" value={form.logo_url || ""} onChange={handleChange} placeholder="Logo URL" className="input" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="primary_color" value={form.primary_color || ""} onChange={handleChange} placeholder="Primary Color" className="input" />
          <input name="accent_color" value={form.accent_color || ""} onChange={handleChange} placeholder="Accent Color" className="input" />
          <input name="theme" value={form.theme || ""} onChange={handleChange} placeholder="Theme (light/dark)" className="input" />
          <input name="default_timezone" value={form.default_timezone || ""} onChange={handleChange} placeholder="Default Timezone" className="input" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="currency" value={form.currency || ""} onChange={handleChange} placeholder="Currency" className="input" />
          <input name="terms_url" value={form.terms_url || ""} onChange={handleChange} placeholder="Terms URL" className="input" />
          <input name="privacy_url" value={form.privacy_url || ""} onChange={handleChange} placeholder="Privacy URL" className="input" />
        </div>
        <textarea name="landing_page_message" value={form.landing_page_message || ""} onChange={handleChange} placeholder="Landing Page Message" className="input" />
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="maintenance_mode" checked={!!form.maintenance_mode} onChange={handleChange} />
            Maintenance Mode
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="analytics_enabled" checked={!!form.analytics_enabled} onChange={handleChange} />
            Analytics Enabled
          </label>
        </div>
        <div>
          <label className="block font-semibold mb-2">Feature Toggles (JSON)</label>
          <input
            type="text"
            name="feature_toggles"
            value={JSON.stringify(form.feature_toggles || {})}
            onChange={e => {
              try {
                setForm(prev => ({ ...prev, feature_toggles: JSON.parse(e.target.value) }));
                setError(null);
              } catch {
                setError("Invalid JSON for feature toggles");
              }
            }}
            className="input"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>{editing ? "Update" : "Create"}</button>
          {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm(defaultConfig); }}>Cancel</button>}
        </div>
      </form>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Existing Configurations</h3>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr>
                <th className="p-2">App Name</th>
                <th className="p-2">Company</th>
                <th className="p-2">Support Email</th>
                <th className="p-2">Theme</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{c.app_name}</td>
                  <td className="p-2">{c.company_name}</td>
                  <td className="p-2">{c.support_email}</td>
                  <td className="p-2">{c.theme}</td>
                  <td className="p-2 flex gap-2">
                    <button className="btn btn-sm btn-primary" onClick={() => handleEdit(c)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
