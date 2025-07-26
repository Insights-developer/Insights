import Sidebar from "@/components/Sidebar";
import UserInfoBox from "@/components/UserInfoBox";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 relative">
        <UserInfoBox />
        <div className="pt-10 px-6">{children}</div>
      </main>
    </div>
  );
}
