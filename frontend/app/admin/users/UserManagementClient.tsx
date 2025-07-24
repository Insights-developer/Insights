'use client';

import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { UserProfile, AccessGroup } from '@/utils/types';
import { 
  ChevronUpIcon, ChevronDownIcon, PencilIcon, TrashIcon, UserPlusIcon, 
  MagnifyingGlassIcon, XMarkIcon, CheckIcon, UserCircleIcon,
  ArrowPathIcon, ExclamationCircleIcon, ShieldCheckIcon, ShieldExclamationIcon 
} from '@heroicons/react/24/outline';
import { EyeIcon } from '@heroicons/react/24/solid';
import ConfirmModal from '../../components/ConfirmModal';

export default function UserManagementClient() {
  // State variables
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allGroups, setAllGroups] = useState<AccessGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof UserProfile>('username');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserProfile>>({
    email: '',
    username: '',
    phone: '',
    groups: []
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [detailsUserId, setDetailsUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error',
    message: string
  } | null>(null);
  const [groupFilter, setGroupFilter] = useState<number | null>(null);

  // Fetch user and group data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [usersResponse, groupsResponse] = await Promise.all([
          fetch('/api/admin/users', { credentials: 'include' }),
          fetch('/api/access-groups', { credentials: 'include' })
        ]);

        // Check for permission issues
        if (usersResponse.status === 403) {
          throw new Error('You do not have permission to access user management');
        }

        // Process responses
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users: ' + await usersResponse.text());
        }
        if (!groupsResponse.ok) {
            throw new Error('Failed to fetch groups: ' + await groupsResponse.text());
        }

        const usersData = await usersResponse.json();
        const groupsData = await groupsResponse.json();
        
        setUsers(usersData.users);
        setAllGroups(groupsData.groups || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        showNotification('error', err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        // Apply search filter
        const searchMatch = searchTerm === '' || 
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
          
        // Apply group filter
        const groupMatch = groupFilter === null || 
          (user.groups && user.groups.some(g => g.id === groupFilter));
          
        return searchMatch && groupMatch;
      })
      .sort((a, b) => {
        if (a[sortField] === null) return sortDirection === 'asc' ? -1 : 1;
        if (b[sortField] === null) return sortDirection === 'asc' ? 1 : -1;
        
        const valA = a[sortField]?.toString().toLowerCase() || '';
        const valB = b[sortField]?.toString().toLowerCase() || '';
        
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [users, searchTerm, sortField, sortDirection, groupFilter]);

  // Sort toggling
  const toggleSort = (field: keyof UserProfile) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Form handling for editing
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Group selection handling for editing
  const handleEditGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGroupIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    const selectedGroups = allGroups.filter(g => selectedGroupIds.includes(g.id));
    setEditForm(prev => ({ ...prev, groups: selectedGroups }));
  };

  // Start editing a user
  const handleStartEditing = (user: UserProfile) => {
    setEditingUserId(user.id);
    setEditForm({
      ...user,
      groups: user.groups || []
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditForm({});
  };

  // Save user edits
  const handleSaveUser = async () => {
    if (!editingUserId || !editForm) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${editingUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Add this to ensure cookies are sent
        body: JSON.stringify({
          email: editForm.email,
          username: editForm.username,
          phone: editForm.phone,
          groups: (editForm.groups || []).map(g => g.id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save user');
      }

      const updatedUser = {
        ...users.find(u => u.id === editingUserId)!,
        ...editForm
      };

      setUsers(users.map(u => (u.id === editingUserId ? updatedUser : u)));
      setEditingUserId(null);
      showNotification('success', 'User updated successfully');
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  // Add a new user
  const handleAddUser = () => {
    setIsAddingUser(true);
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleNewUserGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGroupIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    const selectedGroups = allGroups.filter(g => selectedGroupIds.includes(g.id));
    setNewUser(prev => ({ ...prev, groups: selectedGroups }));
  };

  const handleCreateUser = async () => {
    try {
      // This is a placeholder for actual user creation
      // In a real app, you would call the appropriate API endpoint
      showNotification('success', 'User creation would be implemented with Supabase Auth');
      setIsAddingUser(false);
      setNewUser({
        email: '',
        username: '',
        phone: '',
        groups: []
      });
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  // Delete user handling
  const handleDeleteClick = (user: UserProfile) => {
    setDeletingUser(user);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setDeletingUser(null);
    setIsConfirmModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
        credentials: 'include', // Add this to ensure cookies are sent
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      setUsers(users.filter(u => u.id !== deletingUser.id));
      showNotification('success', 'User deleted successfully');
      handleCloseConfirmModal();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  // View user details
  const handleViewDetails = (userId: string) => {
    setDetailsUserId(detailsUserId === userId ? null : userId);
  };

  // Handle notifications
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Refresh user data
  const handleRefresh = () => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/users', { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Failed to refresh users');
        }
        const data = await response.json();
        setUsers(data.users);
        showNotification('success', 'User data refreshed');
      } catch (err) {
        showNotification('error', err instanceof Error ? err.message : 'Failed to refresh data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  };

  // Loading state
  if (loading && users.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && users.length === 0) {
    return (
      <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center text-red-700 mb-4">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-semibold">Error</h3>
        </div>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={handleRefresh} 
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center max-w-md animate-slide-in ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckIcon className="h-5 w-5 mr-2" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          )}
          <p>{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* User Management Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="mt-1 text-gray-500">Manage system users and their permissions</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddUser}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" /> Add User
          </button>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" /> Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <div className="flex-grow mb-4 md:mb-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search users by name, email, or phone"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <select
              value={groupFilter === null ? '' : groupFilter}
              onChange={(e) => setGroupFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Groups</option>
              {allGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* New User Form */}
      {isAddingUser && (
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-medium text-blue-800">Add New User</h3>
            <button
              onClick={() => setIsAddingUser(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={newUser.email || ''}
                onChange={handleNewUserChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={newUser.username || ''}
                onChange={handleNewUserChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={newUser.phone || ''}
                onChange={handleNewUserChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Groups
              </label>
              <select
                multiple
                name="groups"
                value={(newUser.groups || []).map(g => g.id.toString())}
                onChange={handleNewUserGroupChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {allGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple groups</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsAddingUser(false)}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateUser}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create User
            </button>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort('username')}
              >
                <div className="flex items-center">
                  <span>User</span>
                  {sortField === 'username' && (
                    sortDirection === 'asc' ? 
                    <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                    <ChevronDownIcon className="h-4 w-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort('email')}
              >
                <div className="flex items-center">
                  <span>Email</span>
                  {sortField === 'email' && (
                    sortDirection === 'asc' ? 
                    <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                    <ChevronDownIcon className="h-4 w-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
              >
                Groups
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell cursor-pointer"
                onClick={() => toggleSort('login_count')}
              >
                <div className="flex items-center">
                  <span>Activity</span>
                  {sortField === 'login_count' && (
                    sortDirection === 'asc' ? 
                    <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                    <ChevronDownIcon className="h-4 w-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <UserCircleIcon className="h-12 w-12 text-gray-300 mb-2" />
                    {searchTerm || groupFilter ? 
                      <p>No users match your search criteria.</p> : 
                      <p>No users found in the system.</p>
                    }
                    {(searchTerm || groupFilter) && (
                      <button 
                        onClick={() => { setSearchTerm(''); setGroupFilter(null); }}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <Fragment key={user.id}>
                  <tr className={editingUserId === user.id ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === user.id ? (
                        <input
                          type="text"
                          name="username"
                          value={editForm.username || ''}
                          onChange={handleEditChange}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {(user.username || user.email || '?')[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username || 'N/A'}</div>
                            <div className="text-sm text-gray-500 hidden sm:table-cell md:hidden">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === user.id ? (
                        <input
                          type="email"
                          name="email"
                          value={editForm.email || ''}
                          onChange={handleEditChange}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{user.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      {editingUserId === user.id ? (
                        <select
                          multiple
                          name="groups"
                          value={(editForm.groups || []).map(g => g.id.toString())}
                          onChange={handleEditGroupChange}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          {allGroups.map(group => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {user.groups && user.groups.length > 0 ? (
                            user.groups.map(group => (
                              <span
                                key={group.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {group.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">No groups</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {editingUserId === user.id ? (
                        <div className="text-sm text-gray-500">
                          {user.login_count || 0} logins
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {user.login_count || 0} logins
                          <div className="text-xs">
                            Last: {user.current_login_at ? new Date(user.current_login_at).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingUserId === user.id ? (
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={handleSaveUser}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-3 justify-end">
                          <button
                            onClick={() => handleViewDetails(user.id)}
                            className="text-gray-600 hover:text-gray-900"
                            title="View details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleStartEditing(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit user"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete user"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {detailsUserId === user.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                            <p className="mt-1 text-sm text-gray-900">Email: {user.email}</p>
                            <p className="text-sm text-gray-900">Phone: {user.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Account Details</h4>
                            <p className="mt-1 text-sm text-gray-900">Username: {user.username || 'N/A'}</p>
                            <p className="text-sm text-gray-900">Member Since: {new Date(user.created_at).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-900">Account Type: {user.groups && user.groups.length > 0 ? 'Active User' : 'Unassigned User'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Login Activity</h4>
                            <p className="mt-1 text-sm text-gray-900">Total Logins: {user.login_count || 0}</p>
                            <p className="text-sm text-gray-900">Current Login: {user.current_login_at ? new Date(user.current_login_at).toLocaleString() : 'Never'}</p>
                            <p className="text-sm text-gray-900">Previous Login: {user.previous_login_at ? new Date(user.previous_login_at).toLocaleString() : 'Never'}</p>
                          </div>
                          <div className="md:col-span-2 lg:col-span-3">
                            <h4 className="text-sm font-medium text-gray-500">Access Groups</h4>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {user.groups && user.groups.length > 0 ? (
                                user.groups.map(group => (
                                  <span
                                    key={group.id}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
                                  >
                                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                    {group.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500">User has no access groups assigned</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination or Summary */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
        {filteredUsers.length > 0 && users.length > filteredUsers.length && (
          <div className="text-sm text-gray-500">
            ({users.length - filteredUsers.length} filtered out)
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {isConfirmModalOpen && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={handleCloseConfirmModal}
          onConfirm={handleConfirmDelete}
          title="Confirm User Deletion"
          message={
            <>
              <p>Are you sure you want to delete the user <span className="font-bold">{deletingUser?.email}</span>?</p>
              <p className="mt-2 text-sm text-red-600">This action cannot be undone and will remove all user data.</p>
            </>
          }
        />
      )}
    </div>
  );
}

