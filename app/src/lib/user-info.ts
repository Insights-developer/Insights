
type UserLike = {
  name?: string;
  displayName?: string;
  email?: string;
  role?: string;
  accessGroup?: string;
  lastLogin?: string;
  last_login?: string;
  lastLoginAt?: string;
  [key: string]: unknown;
};

export function getUserDisplayInfo(user: unknown) {
  const u = user as UserLike | null | undefined;
  if (!u) return { name: "Guest", email: "", role: "", lastLogin: "", raw: null };
  return {
    name: u.name || u.displayName || u.email || "User",
    email: u.email || "",
    role: u.role || u.accessGroup || "",
    lastLogin: u.lastLogin || u.last_login || u.lastLoginAt || "",
    raw: u,
  };
}
