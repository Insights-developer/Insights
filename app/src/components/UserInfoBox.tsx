"use client";

import { useUser } from "@stackframe/stack";
import { getUserDisplayInfo } from "../lib/user-info";
import { LogOut, Bell, User2 } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";


export default function UserInfoBox() {
  const user = useUser();
  const [dbUser, setDbUser] = useState<Record<string, unknown> | null>(null);
  const [debugInfo, setDebugInfo] = useState<{
    cookies: string;
    user: unknown;
    dbUser: unknown;
    timestamp: string;
    path: string;
    queriedEmail: string;
    userApiResult: string;
  }>({ cookies: '', user: null, dbUser: null, timestamp: '', path: '', queriedEmail: '', userApiResult: '' });
  const [showDebug, setShowDebug] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchDbUser() {
      const { email } = getUserDisplayInfo(user);
      if (!email) {
        setDebugInfo((d) => ({ ...d, queriedEmail: '', userApiResult: 'No email to query' }));
        return;
      }
      let apiResult = '';
      try {
        const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
        apiResult = `Status: ${res.status}`;
        if (res.ok) {
          const data = await res.json();
          setDbUser(data.user || null);
          apiResult += `, user: ${JSON.stringify(data.user)}`;
        } else {
          setDbUser(user);
          const err = await res.text();
          apiResult += `, error: ${err}`;
        }
      } catch (e) {
        setDbUser(user);
        apiResult += `, fetch error: ${e}`;
      }
      setDebugInfo((d) => ({ ...d, queriedEmail: email, userApiResult: apiResult }));
    }
    if (user) fetchDbUser();
  }, [user]);

  // Debug info: cookies, user, dbUser, timestamp, path
  useEffect(() => {
    setDebugInfo((d) => ({
      ...d,
      cookies: typeof document !== 'undefined' ? document.cookie : '',
      user,
      dbUser,
      timestamp: new Date().toLocaleString(),
      path: pathname,
    }));
  }, [user, dbUser, pathname]);

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
    <div className="fixed top-6 right-6 z-50 bg-white rounded-3xl shadow-2xl px-6 py-5 flex flex-col gap-3 min-w-[340px] max-w-[400px] border border-gray-100/80">
      <div className="flex items-center gap-4">
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-bold text-gray-900 text-lg flex items-center gap-2 truncate">
            <User2 className="text-blue-500 w-7 h-7" /> {name}
          </span>
          <span className="text-xs text-gray-500 mt-1 truncate">{email}</span>
          {role && <span className="text-xs text-purple-600 font-semibold mt-1 truncate">{role}</span>}
          {lastLogin && <span className="text-xs text-gray-400 mt-1 truncate">Last login: {lastLogin}</span>}
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
      {/* Debug Info Toggle */}
      <button
        className="self-end text-xs text-blue-600 hover:underline focus:outline-none mt-1"
        onClick={() => setShowDebug((v) => !v)}
        type="button"
      >
        {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
      </button>
      {showDebug && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mt-1 text-xs text-gray-700 max-w-full max-h-72 overflow-auto shadow-inner">
          <div><b>Path:</b> <code>{debugInfo.path}</code></div>
          <div><b>Timestamp:</b> <code>{debugInfo.timestamp}</code></div>
          <div className="mt-1"><b>Cookies:</b> <pre className="whitespace-pre-wrap break-all">{debugInfo.cookies || '(none)'}</pre></div>
          <div className="mt-1"><b>Queried Email:</b> <code>{debugInfo.queriedEmail || '(none)'}</code></div>
          <div className="mt-1"><b>/api/users Result:</b> <pre className="whitespace-pre-wrap break-all">{debugInfo.userApiResult}</pre></div>
          <div className="mt-1"><b>user (useUser):</b> <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugInfo.user, null, 2)}</pre></div>
          <div className="mt-1"><b>dbUser (from /api/users):</b> <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugInfo.dbUser, null, 2)}</pre></div>
        </div>
      )}
    </div>
  );
}
