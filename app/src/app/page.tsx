
import AuthFormSuspense from "@/components/AuthFormSuspense";
import Link from "next/link";

export default function Home() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <AuthFormSuspense />
    </main>
  );
}
