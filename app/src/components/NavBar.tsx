import Link from "next/link";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/insights", label: "Insights" },
  { href: "/admin", label: "Admin" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  return (
    <nav
      className="w-full py-4 px-8 flex justify-center gap-10 shadow-md border-b"
      style={{
        background: 'var(--navbar-bg)',
        borderColor: 'var(--card-border)',
      }}
    >
      {navLinks.map(({ href, label }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative font-semibold px-4 py-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] ${
              isActive
                ? 'bg-[var(--primary-light)] text-[var(--primary-dark)] shadow hover:bg-[var(--primary)] hover:text-white'
                : 'text-[var(--gray)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-dark)] hover:shadow-md'
            }`}
            style={{ borderRadius: 'var(--radius)' }}
          >
            {label}
            {isActive && (
              <span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-2 h-2 bg-[var(--primary)] rounded-full"></span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
