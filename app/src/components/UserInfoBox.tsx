"use client";

import { useUser } from "@stackframe/stack";
import { getUserDisplayInfo } from "../lib/user-info";
import { LogOut, Bell, User2 } from "lucide-react";
import { useEffect, useState } from "react";


export default function UserInfoBox() {
  const user = useUser();
  const [dbUser, setDbUser] = useState<Record<string, unknown> | null>(null);
  const [debugInfo, setDebugInfo] = useState<{ cookies: string; user: unknown; dbUser: unknown }>({ cookies: '', user: null, dbUser: null });

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

  // Debug info: cookies, user, dbUser
  useEffect(() => {
    setDebugInfo({
      cookies: typeof document !== 'undefined' ? document.cookie : '',
      user,
      dbUser,
    });
  }, [user, dbUser]);

  if (!user && !dbUser) return null;
  const { name, email, role, lastLogin } = getUserDisplayInfo(dbUser || user);

  const handleLogout = async () => {
    // Call the logout API to clear the cookie server-side
    await fetch("/api/auth/logout", { method: "POST" });
    setDbUser(null);
    // Force a full page reload to reset Stack context and user state
    window.location.replace("/");
    window.location.reload();
  };

  return (
    <div className="fixed top-6 right-6 z-50 bg-white rounded-3xl shadow-2xl px-8 py-5 flex flex-col gap-4 min-w-[340px] border border-gray-100/80">
      <div className="flex items-center gap-6">
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
      {/* Debug Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mt-2 text-xs text-gray-700 max-w-full overflow-x-auto">
        <div><b>Cookies:</b> <code>{debugInfo.cookies || '(none)'}</code></div>
        <div className="mt-1"><b>user (useUser):</b> <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugInfo.user, null, 2)}</pre></div>
        <div className="mt-1"><b>dbUser (from /api/users):</b> <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugInfo.dbUser, null, 2)}</pre></div>
      </div>
    </div>
  );
}
