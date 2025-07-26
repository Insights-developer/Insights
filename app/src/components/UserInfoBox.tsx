"use client";
import { useUser } from "@stackframe/stack";
import { FaBell, FaSignOutAlt, FaUserShield } from "react-icons/fa";

export default function UserInfoBox() {
  const user = useUser();
  if (!user) return null;

  // Extract user info
  // Only display fallback info, as user object shape is unknown
  const name = "User";

  return (
    <div className="fixed top-6 right-6 z-50 bg-white rounded-2xl shadow-xl px-6 py-4 flex items-center gap-4 min-w-[260px] border border-gray-100">
      <div className="flex flex-col flex-1">
        <span className="font-bold text-gray-900 text-base flex items-center gap-2">
          <FaUserShield className="text-blue-600" /> {name}
        </span>
        <span className="text-xs text-gray-500">Unavailable</span>
        <span className="text-xs text-purple-600 font-semibold mt-1">Unavailable</span>
        <span className="text-xs text-gray-400 mt-1">Last login info unavailable</span>
      </div>
      <button className="text-gray-400 hover:text-blue-600 text-xl" title="Notifications">
        <FaBell />
      </button>
      <button className="text-gray-400 hover:text-red-600 text-xl ml-2" title="Log out" onClick={() => { window.location.href = "/api/auth/logout"; }}>
        <FaSignOutAlt />
      </button>
    </div>
  );
}
