"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTachometerAlt, FaUsers, FaLayerGroup, FaChartBar, FaCogs, FaEnvelope, FaGamepad, FaUser } from "react-icons/fa";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
  { href: "/admin", label: "Admin", icon: <FaUsers /> },
  { href: "/insights", label: "Insights", icon: <FaChartBar /> },
  { href: "/settings", label: "Settings", icon: <FaCogs /> },
  { href: "/contact", label: "Contact", icon: <FaEnvelope /> },
  { href: "/games", label: "Games", icon: <FaGamepad /> },
  { href: "/profile", label: "Profile", icon: <FaUser /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 flex flex-col py-8 px-4 border-r border-gray-100">
      <div className="mb-8 text-2xl font-bold text-blue-700 px-2">Insights</div>
      <nav className="flex-1 flex flex-col gap-2">
        {navLinks.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${pathname.startsWith(href) ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
