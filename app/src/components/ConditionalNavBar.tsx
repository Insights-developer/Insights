"use client";
import { usePathname } from 'next/navigation';
import NavBar from "./NavBar";

export default function ConditionalNavBar() {
  const pathname = usePathname();
  
  // Don't show navbar on the home page (login/register page)
  if (pathname === '/') {
    return null;
  }
  
  // TODO: Add proper authentication check here
  // For now, show navbar on all pages except home
  return <NavBar />;
}
