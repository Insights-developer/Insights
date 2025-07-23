'use client';

import { useState } from 'react';

// Properly typed interface matching the actual database schema
interface User {
  id: string;                    // UUID from database  
  email: string;
  role: string;
  username: string | null;       // Can be null in DB
  phone: string | null;          // Can be null in DB
  created_at: string;            // Timestamp from DB
  current_login_at: string | null;  // Actual field name from DB
  previous_login_at: string | null; // Actual field name from DB
  login_count: number | null;    // Can be null in DB
  groups: Array<{
    id: number;                  // Integer from DB, not string
    name: string;
  }>;
}

export default function UserManagementClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUsers, setShowUsers] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Validate the response structure
      if (!data || !Array.isArray(data.users)) {
        throw new Error('Invalid API response structure');
      }
      
      setUsers(data.users);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUsers = () => {
    setShowUsers(true);
    loadUsers();
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">User Management System</h3>
          <p className="text-blue-700 text-sm">
            Comprehensive user management interface with full CRUD operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            className="bg-gray-50 rounded-lg border p-4 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={handleViewUsers}
          >
            <h3 className="font-semibold mb-2">View All Users</h3>
            <p className="text-sm text-gray-600 mb-3">
              Browse complete user directory with details and groups.
            </p>
            <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 inline-block">
              View Users
            </span>
          </div>
        </div>

        {/* User List Section */}
        {showUsers && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">User Directory</h2>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              
              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading users...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800">Error: {error}</p>
                  <button 
                    onClick={loadUsers}
                    className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* User Data Display */}
              {!loading && !error && users.length > 0 && (
                <div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((user) => (
                      <div key={user.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {user.username || 'No username'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {user.email || 'No email'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Role:</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role || 'No role'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-500">Phone:</span>
                            <span className="text-gray-900">
                              {user.phone || 'Not provided'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-500">Groups:</span>
                            <span className="text-gray-900">
                              {Array.isArray(user.groups) ? user.groups.length : 0}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-500">Last Login:</span>
                            <span className="text-gray-900">
                              {formatDate(user.current_login_at)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-500">Login Count:</span>
                            <span className="text-gray-900">
                              {user.login_count || 0}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-500">Joined:</span>
                            <span className="text-gray-900">
                              {formatDate(user.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        {Array.isArray(user.groups) && user.groups.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">Groups:</p>
                            <div className="flex flex-wrap gap-1">
                              {user.groups.map((group) => (
                                <span 
                                  key={group.id} 
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                >
                                  {group.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-sm text-gray-600">
                      {users.length} user{users.length !== 1 ? 's' : ''} found
                    </span>
                  </div>
                </div>
              )}

              {/* No users found */}
              {!loading && !error && users.length === 0 && showUsers && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
                  <p className="text-gray-600">
                    No users were returned from the API.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
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
      </div>
    </div>
  );
}
