"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTachometerAlt, FaUsers, FaChartBar, FaCogs, FaEnvelope, FaGamepad, FaUser } from "react-icons/fa";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
  { href: "/admin", label: "Admin", icon: <FaUsers /> },
  { href: "/admin/app-config", label: "App Config", icon: <FaCogs /> },
  { href: "/insights", label: "Insights", icon: <FaChartBar /> },
  { href: "/settings", label: "Settings", icon: <FaCogs /> },
  { href: "/contact", label: "Contact", icon: <FaEnvelope /> },
  { href: "/games", label: "Games", icon: <FaGamepad /> },
  { href: "/profile", label: "Profile", icon: <FaUser /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="fixed top-0 left-0 h-full w-64 z-40 flex flex-col py-8 px-4 border-r"
      style={{
        background: 'var(--sidebar-bg)',
        boxShadow: 'var(--shadow)',
        borderColor: 'var(--card-border)',
      }}
    >
      <div className="mb-8 text-2xl font-bold px-2" style={{ color: 'var(--primary)' }}>Insights</div>
      <nav className="flex-1 flex flex-col gap-2">
        {navLinks.map(({ href, label, icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] ${
                isActive
                  ? 'bg-[var(--primary-light)] text-[var(--primary-dark)] shadow'
                  : 'text-[var(--gray)] hover:bg-[var(--gray-light)] hover:text-[var(--primary)] hover:shadow-md'
              }`}
              style={{ borderRadius: 'var(--radius)' }}
            >
              <span
                className="text-xl flex items-center justify-center"
                style={{ color: isActive ? 'var(--primary-dark)' : 'var(--icon-color)', background: 'var(--icon-bg)', borderRadius: '50%', width: 32, height: 32 }}
              >
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
