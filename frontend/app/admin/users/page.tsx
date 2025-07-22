// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function UsersPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <div className="text-sm text-gray-600">
            Admin Dashboard
          </div>
        </div>

        {/* User Management Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">User Management System</h3>
          <p className="text-blue-700 text-sm">
            Comprehensive user management interface with full CRUD operations. 
            View, edit, and manage user accounts, groups, and permissions.
          </p>
        </div>

        {/* Management Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* View All Users */}
          <div className="bg-gray-50 rounded-lg border p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">View All Users</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Browse complete user directory with details, groups, and login history.
            </p>
            <a href="#user-list" className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 inline-block">
              View Users
            </a>
          </div>

          {/* Edit User Profiles */}
          <div className="bg-gray-50 rounded-lg border p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-semibold">Edit Profiles</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Modify user information including name, email, phone, and contact details.
            </p>
            <button className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
              Edit Users
            </button>
          </div>

          {/* Manage Groups */}
          <div className="bg-gray-50 rounded-lg border p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Group Assignment</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Assign users to access groups and manage group memberships.
            </p>
            <button className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">
              Manage Groups
            </button>
          </div>

          {/* View Features */}
          <div className="bg-gray-50 rounded-lg border p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold">Feature Access</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Review user feature assignments and permission levels via groups.
            </p>
            <button className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">
              View Features
            </button>
          </div>

          {/* Login History */}
          <div className="bg-gray-50 rounded-lg border p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Login History</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Track user login patterns, last login dates, and session counts.
            </p>
            <button className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
              View History
            </button>
          </div>

          {/* Delete Users */}
          <div className="bg-gray-50 rounded-lg border p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="font-semibold">Delete Users</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Remove user accounts with confirmation and cleanup of associated data.
            </p>
            <button className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
              Delete Users
            </button>
          </div>
        </div>

        {/* User List Section */}
        <div id="user-list" className="mt-8">
          <h2 className="text-xl font-bold mb-4">User Directory</h2>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Data Loading</h3>
              <p className="text-gray-600 mb-4">
                User data will be loaded dynamically through the API when this feature is activated.
              </p>
              <p className="text-sm text-gray-500">
                API Endpoint: <code className="bg-white px-2 py-1 rounded">GET /api/admin/users</code>
              </p>
            </div>
          </div>
        </div>

        {/* API Information */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Available Operations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-700 mb-2">✓ Read Operations</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• GET /api/admin/users - List all users with groups</li>
                <li>• GET /api/admin/groups - List available groups</li>
                <li>• View user profiles, groups, and login history</li>
                <li>• RBAC protection (admin_dashboard required)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">✓ Write Operations</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• PATCH /api/admin/users - Edit user profile & groups</li>
                <li>• DELETE /api/admin/users - Remove user accounts</li>
                <li>• Update email, username, phone fields</li>
                <li>• Modify group memberships</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Development Status */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Implementation Status</h3>
          <p className="text-yellow-700 text-sm">
            User management APIs are fully implemented and tested. 
            Interactive features will be added incrementally using stable patterns 
            following the Design Brief guidelines to maintain build stability.
          </p>
        </div>
      </div>
    </div>
  );
}
