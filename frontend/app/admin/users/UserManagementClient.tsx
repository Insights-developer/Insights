'use client';

import { useState, useEffect } from 'react';
import EditUserModal from '../../components/EditUserModal';
import ConfirmModal from '../../components/ConfirmModal';
import { UserProfile, AccessGroup } from '@/utils/types';

export default function UserManagementClient() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allGroups, setAllGroups] = useState<AccessGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersResponse, groupsResponse] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/access-groups')
        ]);

        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        if (!groupsResponse.ok) {
            throw new Error('Failed to fetch groups');
        }

        const usersData = await usersResponse.json();
        const groupsData = await groupsResponse.json();
        
        console.log('--- DEBUG: UserManagementClient ---');
        console.log('Fetched Users Data:', JSON.stringify(usersData, null, 2));
        console.log('Fetched Groups Data:', JSON.stringify(groupsData, null, 2));

        setUsers(usersData.users);
        setAllGroups(groupsData.groups);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleEdit = (user: UserProfile) => {
    console.log('--- DEBUG: UserManagementClient ---');
    console.log('Editing User (passed to modal):', JSON.stringify(user, null, 2));
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingUser(null);
    setIsEditModalOpen(false);
  };

  const handleSaveUser = async (updatedUser: UserProfile) => {
    if (!updatedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${updatedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: updatedUser.email,
          username: updatedUser.username,
          phone: updatedUser.phone,
          role: updatedUser.role,
          groups: (updatedUser.groups || []).map(g => g.id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save user');
      }

      const { user: savedUser } = await response.json();

      setUsers(users.map(u => (u.id === savedUser.id ? savedUser : u)));
      handleCloseEditModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

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
      const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      setUsers(users.filter(u => u.id !== deletingUser.id));
      handleCloseConfirmModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-bold">{user.username || 'No username'}</h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="mt-4">
              <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
              <p><strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              <p><strong>Last Login:</strong> {user.current_login_at ? new Date(user.current_login_at).toLocaleString() : 'Never'}</p>
              <p><strong>Previous Login:</strong> {user.previous_login_at ? new Date(user.previous_login_at).toLocaleString() : 'Never'}</p>
              <p><strong>Login Count:</strong> {user.login_count}</p>
              <p><strong>Groups:</strong> {(user.groups || []).map(g => g.name).join(', ') || 'None'}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button onClick={() => handleEdit(user)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edit</button>
              <button onClick={() => handleDeleteClick(user)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <EditUserModal
        user={editingUser}
        groups={allGroups}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveUser}
      />
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the user ${deletingUser?.email}? This action cannot be undone.`}
      />
    </div>
  );
}

