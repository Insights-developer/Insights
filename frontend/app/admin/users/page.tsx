import dynamic from 'next/dynamic';

// Force client-side only rendering with no SSR
const UsersPageClient = dynamic(() => import('./client'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  )
});

export default function UsersPage() {
  return <UsersPageClient />;
}
