"use client";
import { useUser } from "@stackframe/stack";
import { getUserDisplayInfo } from "../lib/user-info";
import { LogOut, Bell, User2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserInfoBox() {
  const user = useUser();
  const router = useRouter();
  if (!user) return null;
  const { name, email, role, lastLogin } = getUserDisplayInfo(user);

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
        onClick={() => { router.push("/"); }}
      >
        <LogOut className="w-7 h-7" />
      </button>
    </div>
  );
}
