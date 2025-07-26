import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="max-w-2xl mx-auto mt-20 p-8 rounded-3xl shadow-2xl text-center"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        color: 'var(--foreground)',
      }}
    >
      <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--danger-dark)' }}>404 - Page Not Found</h1>
      <p className="mb-2">Sorry, the page you are looking for does not exist.</p>
      <Link href="/" style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>Go Home</Link>
    </div>
  );
}
