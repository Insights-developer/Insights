// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function GroupsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Group Management</h1>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Group Administration</h3>
            <p className="text-gray-600">Group management tools will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
