export default function SettingsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-8 px-2 sm:px-4 lg:px-8">
      <div className="bg-[var(--card-bg)] rounded-3xl shadow-2xl border border-[var(--card-border)] p-8 max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-[var(--primary-dark)]">Settings</h1>
        <p className="mb-2">Update your account settings here.</p>
        <p className="text-gray-400">(Feature coming soon)</p>
      </div>
    </div>
  );
}
