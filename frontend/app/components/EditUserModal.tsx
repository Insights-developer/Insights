'use client';

import { useState, useEffect } from 'react';
import { UserProfile, AccessGroup as Group } from '@/utils/types';

interface EditUserModalProps {
  user: UserProfile | null;
  groups: Group[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserProfile) => void;
}

export default function EditUserModal({ user, groups, isOpen, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        groups: user.groups || [],
      });
    } else {
      setFormData(null);
    }
  }, [user]);

  if (!isOpen || !formData) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGroupIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    const selectedGroups = groups.filter(g => selectedGroupIds.includes(g.id));
    setFormData({ ...formData, groups: selectedGroups });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Edit User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="member">Member</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Groups</label>
            <select
              multiple
              name="groups"
              value={formData.groups.map(g => g.id.toString())}
              onChange={handleGroupChange}
              className="w-full px-3 py-2 border rounded"
            >
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
