
import AuthFormSuspense from "@/components/AuthFormSuspense";
import Link from "next/link";

export default function Home() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <AuthFormSuspense />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>Welcome to Insights</h1>
        <p className="text-lg mb-8" style={{ color: 'var(--gray)' }}>Your lottery analytics platform</p>
        <Link href="/dashboard" style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>Go to Dashboard</Link>
      </div>
    </main>
  );
}
