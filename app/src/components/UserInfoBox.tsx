"use client";

import { useUser } from "@stackframe/stack";
import { getUserDisplayInfo } from "../lib/user-info";
import { LogOut, Bell, User2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function UserInfoBox() {
  const user = useUser();
  const router = useRouter();
  const [dbUser, setDbUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    async function fetchDbUser() {
      const { email } = getUserDisplayInfo(user);
      if (!email) return;
      try {
        const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          setDbUser(data.user || null);
        } else {
          setDbUser(user);
        }
      } catch {
        setDbUser(user);
      }
    }
    if (user) fetchDbUser();
  }, [user]);

  if (!user && !dbUser) return null;
  const { name, email, role, lastLogin } = getUserDisplayInfo(dbUser || user);

  const handleLogout = async () => {
    // Remove the auth token cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; path=/";
    setDbUser(null);
    router.push("/"); // Home page (AuthForm)
    router.refresh();
  };

  return (
    <div className="fixed top-6 right-6 z-50 bg-white rounded-3xl shadow-2xl px-8 py-5 flex items-center gap-6 min-w-[320px] border border-gray-100/80">
      <div className="flex flex-col flex-1">
        <span className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <User2 className="text-blue-500 w-7 h-7" /> {name}
        </span>
        <span className="text-xs text-gray-500 mt-1">{email}</span>
        {role && <span className="text-xs text-purple-600 font-semibold mt-1">{role}</span>}
        {lastLogin && <span className="text-xs text-gray-400 mt-1">Last login: {lastLogin}</span>}
      </div>
      <button className="text-gray-400 hover:text-blue-500 text-2xl" title="Notifications">
        <Bell className="w-7 h-7" />
      </button>
      <button
        className="text-gray-400 hover:text-red-500 text-2xl ml-2"
        title="Log out"
        onClick={handleLogout}
      >
        <LogOut className="w-7 h-7" />
      </button>
    </div>
  );
}
