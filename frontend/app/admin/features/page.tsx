'use client';

import { useEffect, useRef, useState } from 'react';
import Card from '../../components/ui/Cards';
import Button from '../../components/ui/Buttons';
import { supabase } from '@/utils/supabase/browser';

const FEATURE_TYPES = [
  { value: 'page', label: 'Page' },
  { value: 'card', label: 'Dashboard Card' },
  { value: 'feature', label: 'Feature (other)' }
];

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { fetchFeatures(); }, []);

  // Notify navbar (and any listener) to immediately refresh navigation
  function notifyNavUpdate() {
    window.dispatchEvent(new Event('nav-update'));
  }

  async function fetchFeatures() {
    setLoading(true);
    setActionError(null);
    const res = await fetch('/api/admin/features');
    const { features, error } = await res.json();
    if (error) setActionError(error);
    setFeatures(features || []);
    setLoading(false);
  }

  function startEdit(f?: any) {
    setEditing(f ? f.key : 'new');
    setForm({
      id: f?.id ?? null,
      key: f?.key ?? '',
      name: f?.name ?? '',
      type: f?.type ?? 'page',
      nav_name: f?.nav_name ?? '',
      description: f?.description ?? '',
      url: f?.url ?? '',
      icon_url: f?.icon_url ?? '',
      order: f?.order ?? 0,
      active: f?.active ?? true
    });
    setIconFile(null);
    setActionError(null);
    iconInputRef.current?.value && (iconInputRef.current.value = '');
  }

  function cancelEdit() {
    setEditing(null);
    setForm({});
    setIconFile(null);
    setActionError(null);
    iconInputRef.current?.value && (iconInputRef.current.value = '');
  }

  function handleIconFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIconFile(e.target.files?.[0] || null);
  }

  async function uploadIconFile(file: File, featureKey: string): Promise<string | null> {
    const BUCKET = 'feature-icons';
    const filePath = `${featureKey}_${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from(BUCKET).upload(filePath, file, { upsert: true });
    if (error) {
      setActionError('Icon upload failed: ' + error.message);
      return null;
    }
    const { publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(filePath).data;
    return publicUrl || null;
  }

  async function saveFeature() {
    setActionError(null);
    let icon_url = form.icon_url;

    if (iconFile && form.key) {
      const uploadedUrl = await uploadIconFile(iconFile, form.key);
      if (!uploadedUrl) return;
      icon_url = uploadedUrl;
    }

    const body = {
      ...form,
      icon_url,
      order: Number(form.order) || 0,
      active: !!form.active
    };
    const method = form.id ? 'PATCH' : 'POST';
    const res = await fetch('/api/admin/features', {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const resp = await res.json();
    if (!res.ok || resp.error) {
      setActionError(resp.error || 'Failed to save');
      return;
    }
    fetchFeatures();
    notifyNavUpdate();    // <-- Nav instantly updates
    cancelEdit();
  }

  async function deactivateFeature(id: number) {
    if (!window.confirm('Hide/deactivate this feature?')) return;
    setActionError(null);
    const res = await fetch('/api/admin/features', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: false })
    });
    const resp = await res.json();
    if (!res.ok || resp.error) {
      setActionError(resp.error || 'Failed to deactivate');
      return;
    }
    fetchFeatures();
    notifyNavUpdate();    // <-- Nav instantly updates
    cancelEdit();
  }

  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', padding: 24 }}>
      <Card title="Manage Features">
      <h2>Admin: Features CRUD</h2>
      {actionError && <div style={{ color: 'red', marginBottom: 12 }}>{actionError}</div>}

      <button onClick={() => startEdit()} disabled={!!editing} style={{ marginBottom: 18 }}>
        + Add Feature
      </button>

      {editing && (
        <div style={{
          border: '1px solid #ccc', borderRadius: 8, padding: 18, marginBottom: 30,
          background: '#f9faff', maxWidth: 650
        }}>
          <h4>{form.id ? 'Edit Feature' : 'Add Feature'}</h4>
          <label>
            Key (unique):<br />
            <input value={form.key} disabled={!!form.id} onChange={e => setForm((f: any) => ({ ...f, key: e.target.value }))} style={{ width: 270, marginBottom: 8 }} />
          </label>
          <br />

          <label>
            Type:<br />
            <select value={form.type} onChange={e => setForm((f: any) => ({ ...f, type: e.target.value }))}>
              {FEATURE_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
            </select>
          </label>
          <br />

          <label>
            Nav Name (for nav pages):<br />
            <input value={form.nav_name} onChange={e => setForm((f: any) => ({ ...f, nav_name: e.target.value }))} style={{ width: 200, marginBottom: 8 }} />
          </label>
          <br />

          <label>
            Description:<br />
            <input value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} style={{ width: 320, marginBottom: 8 }} />
          </label>
          <br />

          <label>
            URL (optional, defaults to /key):<br />
            <input value={form.url} onChange={e => setForm((f: any) => ({ ...f, url: e.target.value }))} style={{ width: 180, marginBottom: 8 }} />
          </label>
          <br />

          <label>
            Icon (preview, remove or upload new):
            <br />
            {form.icon_url &&
              <img src={form.icon_url} alt="icon" style={{ width: 32, height: 32, marginRight: 10, verticalAlign: 'middle', border: '1px solid #ddd', borderRadius: 4 }} />}
            <input type="file" accept="image/*" ref={iconInputRef} onChange={handleIconFileChange} />
          </label>
          <br />

          <label>
            Order:<br />
            <input type="number" value={form.order} onChange={e => setForm((f: any) => ({ ...f, order: e.target.value }))} style={{ width: 60, marginBottom: 8 }} />
          </label>
          <br />

          <label>
            Active:
            <input type="checkbox" checked={!!form.active} onChange={e => setForm((f: any) => ({ ...f, active: e.target.checked }))} style={{ marginLeft: 10 }} />
          </label>
          <br />

          <div style={{ marginTop: 20 }}>
            <button onClick={saveFeature}>{form.id ? 'Save Changes' : 'Create Feature'}</button>{' '}
            <button onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading features…</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Key</th>
              <th>Type</th>
              <th>Nav Name</th>
              <th>Description</th>
              <th>URL</th>
              <th>Icon</th>
              <th>Order</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {features.map(f => (
              <tr key={f.key} style={{ opacity: f.active ? 1 : 0.5 }}>
                <td>{f.key}</td>
                <td>{f.type}</td>
                <td>{f.nav_name}</td>
                <td style={{ maxWidth: 250 }}>{f.description}</td>
                <td>{f.url || `/${f.key}`}</td>
                <td>
                  {f.icon_url && (
                    <img src={f.icon_url} alt="icon" style={{ width: 26, height: 26, borderRadius: 3 }} />
                  )}
                </td>
                <td>{f.order ?? 0}</td>
                <td>{f.active ? "✔️" : "❌"}</td>
                <td>
                  <button onClick={() => startEdit(f)}>Edit</button>
                  {' '}
                  {f.active && (
                    <button onClick={() => deactivateFeature(f.id)} style={{ color: 'orange' }}>
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      </Card>
    </main>
  );
}
