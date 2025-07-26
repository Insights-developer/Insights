export default function SettingsPage() {
  return (
    <div
      className="max-w-2xl mx-auto mt-20 p-8 rounded shadow text-center"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
    >
      <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>Settings</h1>
      <p className="mb-2">Update your account settings here.</p>
      <p style={{ color: 'var(--gray)' }}>(Feature coming soon)</p>
    </div>
  );
}
