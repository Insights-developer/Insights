import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/insights", label: "Insights" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  return (
    <nav className="w-full bg-gradient-to-r from-blue-50 via-gray-50 to-purple-50 py-4 px-8 flex justify-center gap-10 shadow-md border-b border-gray-100">
      {navLinks.map(({ href, label }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative font-semibold px-4 py-2 rounded-xl transition-all duration-200
              ${isActive ? "bg-blue-100 text-blue-700 shadow hover:bg-blue-200" :
                "text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"}
              focus:outline-none focus:ring-2 focus:ring-blue-300
            `}
          >
            {label}
            {isActive && (
              <span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full"></span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
