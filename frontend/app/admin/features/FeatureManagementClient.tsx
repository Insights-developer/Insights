'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronUpIcon, ChevronDownIcon, PencilIcon, TrashIcon, PlusIcon,
  MagnifyingGlassIcon, XMarkIcon, CheckIcon,
  ArrowPathIcon, ExclamationCircleIcon, ShieldCheckIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';
import { EyeIcon } from '@heroicons/react/24/solid';
import ConfirmModal from '../../components/ConfirmModal';

interface Feature {
  id: number;
  key: string;
  name: string;
  description: string | null;
  type: string;
  nav_name: string | null;
  icon_url: string | null;
  url: string | null;
  order: number;
  active: boolean;
}

interface AccessGroup {
  id: number;
  name: string;
  description: string | null;
}

export default function FeatureManagementClient() {
  // State variables
  const [features, setFeatures] = useState<Feature[]>([]);
  const [accessGroups, setAccessGroups] = useState<AccessGroup[]>([]);
  const [groupFeatureMap, setGroupFeatureMap] = useState<Record<number, string[]>>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Feature>('key');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const [newFeature, setNewFeature] = useState<Partial<Feature>>({
    key: '',
    name: '',
    description: '',
    type: 'feature',
    active: true
  });
  
  const [editingFeatureId, setEditingFeatureId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Feature>>({});
  const [detailsFeatureId, setDetailsFeatureId] = useState<number | null>(null);
  const [deletingFeature, setDeletingFeature] = useState<Feature | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  const [notification, setNotification] = useState<{
    type: 'success' | 'error',
    message: string
  } | null>(null);
  
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedGroupForAssignment, setSelectedGroupForAssignment] = useState<number | null>(null);

  // Fetch feature and group data
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch features and access groups in parallel
      const [featuresResponse, groupsResponse] = await Promise.all([
        fetch('/api/admin/features', { credentials: 'include' }),
        fetch('/api/access-groups', { credentials: 'include' })
      ]);

      // Check for permission issues
      if (featuresResponse.status === 403) {
        throw new Error('You do not have permission to access feature management');
      }

      // Process responses
      if (!featuresResponse.ok) {
        throw new Error('Failed to fetch features: ' + await featuresResponse.text());
      }
      if (!groupsResponse.ok) {
        throw new Error('Failed to fetch groups: ' + await groupsResponse.text());
      }

      const featuresData = await featuresResponse.json();
      const groupsData = await groupsResponse.json();
      
      setFeatures(featuresData.features);
      setAccessGroups(groupsData.groups || []);

      // Fetch feature assignments for each group
      const featureAssignments: Record<number, string[]> = {};
      for (const group of groupsData.groups || []) {
        const response = await fetch(`/api/admin/group-features?groupId=${group.id}`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          featureAssignments[group.id] = data.features || [];
        }
      }
      setGroupFeatureMap(featureAssignments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      showNotification('error', err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  // Filtered and sorted features
  const filteredFeatures = useMemo(() => {
    return features
      .filter(feature => {
        // Apply search filter
        const searchMatch = searchTerm === '' || 
          feature.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
          feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feature.description?.toLowerCase().includes(searchTerm.toLowerCase());
          
        // Apply type filter
        const typeMatch = typeFilter === null || feature.type === typeFilter;
          
        return searchMatch && typeMatch;
      })
      .sort((a, b) => {
        const valueA = a[sortField]?.toString().toLowerCase() || '';
        const valueB = b[sortField]?.toString().toLowerCase() || '';
        
        if (sortDirection === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      });
  }, [features, searchTerm, typeFilter, sortField, sortDirection]);

  // Feature types available in the data
  const availableTypes = useMemo(() => {
    return Array.from(new Set(features.map(f => f.type)));
  }, [features]);

  // Handle sort
  const handleSort = (field: keyof Feature) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Edit feature
  const handleEditClick = (feature: Feature) => {
    setEditingFeatureId(feature.id);
    setEditForm({ ...feature });
  };

  const handleCancelEdit = () => {
    setEditingFeatureId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/features', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: editingFeatureId,
          ...editForm
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save feature');
      }

      // Update the feature in the local state
      setFeatures(features.map(f => 
        f.id === editingFeatureId ? { ...f, ...editForm } : f
      ));
      
      showNotification('success', 'Feature updated successfully');
      setEditingFeatureId(null);
      setEditForm({});
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to update feature');
    } finally {
      setLoading(false);
    }
  };

  // View details
  const handleToggleDetails = (featureId: number | null) => {
    setDetailsFeatureId(detailsFeatureId === featureId ? null : featureId);
  };

  // Create new feature
  const handleAddNewClick = () => {
    setIsAddingFeature(true);
  };

  const handleCancelAdd = () => {
    setIsAddingFeature(false);
    setNewFeature({
      key: '',
      name: '',
      description: '',
      type: 'feature',
      active: true
    });
  };

  const handleCreateFeature = async () => {
    try {
      if (!newFeature.key || !newFeature.name) {
        showNotification('error', 'Key and name are required');
        return;
      }

      setLoading(true);
      const response = await fetch('/api/admin/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newFeature),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create feature');
      }

      // Refresh features to get the new one with its ID
      await fetchData();
      showNotification('success', 'Feature created successfully');
      handleCancelAdd();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to create feature');
    } finally {
      setLoading(false);
    }
  };

  // Delete feature
  const handleDeleteClick = (feature: Feature) => {
    setDeletingFeature(feature);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setDeletingFeature(null);
    setIsConfirmModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFeature) return;

    try {
      setLoading(true);
      // There's no DELETE endpoint in the API for features, so we'll use PATCH to set active=false
      const response = await fetch('/api/admin/features', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: deletingFeature.id,
          active: false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete feature');
      }

      // Update local state
      setFeatures(features.map(f => 
        f.id === deletingFeature.id ? { ...f, active: false } : f
      ));
      
      showNotification('success', 'Feature successfully marked as inactive');
      handleCloseConfirmModal();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to delete feature');
    } finally {
      setLoading(false);
    }
  };

  // Group feature assignments
  const handleAssignFeatureToGroup = async (featureKey: string, groupId: number) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/group-features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          feature: featureKey,
          groupId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign feature');
      }

      // Update local state
      setGroupFeatureMap({
        ...groupFeatureMap,
        [groupId]: [...(groupFeatureMap[groupId] || []), featureKey]
      });
      
      showNotification('success', 'Feature assigned to group successfully');
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to assign feature');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFeatureFromGroup = async (featureKey: string, groupId: number) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/group-features', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          feature: featureKey,
          groupId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove feature');
      }

      // Update local state
      setGroupFeatureMap({
        ...groupFeatureMap,
        [groupId]: (groupFeatureMap[groupId] || []).filter(key => key !== featureKey)
      });
      
      showNotification('success', 'Feature removed from group successfully');
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to remove feature');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Check if a feature is assigned to a group
  const isFeatureAssignedToGroup = (featureKey: string, groupId: number) => {
    return (groupFeatureMap[groupId] || []).includes(featureKey);
  };

  // Count how many groups a feature is assigned to
  const getFeatureGroupCount = (featureKey: string) => {
    return Object.values(groupFeatureMap).filter(features => features.includes(featureKey)).length;
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded shadow-lg ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckIcon className="h-5 w-5 mr-2" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 md:mb-0">Feature Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={handleAddNewClick}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Feature
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by key, name, or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-1/4">
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Type
            </label>
            <select
              id="typeFilter"
              value={typeFilter || ''}
              onChange={e => setTypeFilter(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Feature Form */}
      {isAddingFeature && (
        <div className="mb-6 bg-blue-50 p-4 border border-blue-200 rounded-md">
          <h2 className="text-lg font-medium text-blue-800 mb-4">Add New Feature</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Key */}
            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
                Key <span className="text-red-500">*</span>
              </label>
              <input
                id="key"
                type="text"
                value={newFeature.key}
                onChange={e => setNewFeature({ ...newFeature, key: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={newFeature.name}
                onChange={e => setNewFeature({ ...newFeature, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="type"
                value={newFeature.type}
                onChange={e => setNewFeature({ ...newFeature, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="feature">feature</option>
                <option value="page">page</option>
                <option value="card">card</option>
                <option value="widget">widget</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={newFeature.description || ''}
                onChange={e => setNewFeature({ ...newFeature, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Navigation Settings (Conditional on type=page) */}
            {newFeature.type === 'page' && (
              <div>
                <label htmlFor="nav_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Navigation Label (for sidebar)
                </label>
                <input
                  id="nav_name"
                  type="text"
                  value={newFeature.nav_name || ''}
                  onChange={e => setNewFeature({ ...newFeature, nav_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {newFeature.type === 'page' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* URL */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  id="url"
                  type="text"
                  value={newFeature.url || ''}
                  onChange={e => setNewFeature({ ...newFeature, url: e.target.value })}
                  placeholder="/path"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Icon URL */}
              <div>
                <label htmlFor="icon_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Icon URL
                </label>
                <input
                  id="icon_url"
                  type="text"
                  value={newFeature.icon_url || ''}
                  onChange={e => setNewFeature({ ...newFeature, icon_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Order */}
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  id="order"
                  type="number"
                  value={newFeature.order || 0}
                  onChange={e => setNewFeature({ ...newFeature, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Active Status */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="active"
                type="checkbox"
                checked={newFeature.active}
                onChange={e => setNewFeature({ ...newFeature, active: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancelAdd}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFeature}
              disabled={!newFeature.key || !newFeature.name || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Feature'}
            </button>
          </div>
        </div>
      )}

      {/* Features Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Key */}
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('key')}
                >
                  <div className="flex items-center">
                    <span>Key</span>
                    {sortField === 'key' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="ml-1 h-4 w-4" /> : 
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                
                {/* Name */}
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    <span>Name</span>
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="ml-1 h-4 w-4" /> : 
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                
                {/* Type */}
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    <span>Type</span>
                    {sortField === 'type' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="ml-1 h-4 w-4" /> : 
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                
                {/* Group Assignments */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <span>Groups</span>
                  </div>
                </th>
                
                {/* Status */}
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('active')}
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    {sortField === 'active' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="ml-1 h-4 w-4" /> : 
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                
                {/* Actions */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && features.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading features...
                  </td>
                </tr>
              ) : filteredFeatures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No features found
                  </td>
                </tr>
              ) : (
                filteredFeatures.map(feature => (
                  <React.Fragment key={feature.id}>
                    <tr className={feature.active ? 'bg-white' : 'bg-gray-100'}>
                      {/* Key */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingFeatureId === feature.id ? (
                          <input
                            type="text"
                            value={editForm.key}
                            onChange={e => setEditForm({ ...editForm, key: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <div className="flex items-center">
                            <span className={!feature.active ? 'text-gray-400' : ''}>
                              {feature.key}
                            </span>
                          </div>
                        )}
                      </td>
                      
                      {/* Name */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {editingFeatureId === feature.id ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <span className={!feature.active ? 'text-gray-400' : ''}>
                            {feature.name}
                          </span>
                        )}
                      </td>
                      
                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingFeatureId === feature.id ? (
                          <select
                            value={editForm.type}
                            onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                          >
                            <option value="feature">feature</option>
                            <option value="page">page</option>
                            <option value="card">card</option>
                            <option value="widget">widget</option>
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {feature.type}
                          </span>
                        )}
                      </td>
                      
                      {/* Group Assignments */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {editingFeatureId === feature.id ? (
                          <select
                            value={selectedGroupForAssignment || ''}
                            onChange={e => setSelectedGroupForAssignment(e.target.value ? Number(e.target.value) : null)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2"
                          >
                            <option value="">Select a group to assign...</option>
                            {accessGroups.map(group => (
                              <option 
                                key={group.id} 
                                value={group.id}
                                disabled={isFeatureAssignedToGroup(feature.key, group.id)}
                              >
                                {group.name} {isFeatureAssignedToGroup(feature.key, group.id) ? '(assigned)' : ''}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {getFeatureGroupCount(feature.key) > 0 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                {getFeatureGroupCount(feature.key)} groups
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">No assignments</span>
                            )}
                          </div>
                        )}
                        
                        {editingFeatureId === feature.id && selectedGroupForAssignment && (
                          <button
                            onClick={() => {
                              handleAssignFeatureToGroup(feature.key, selectedGroupForAssignment);
                              setSelectedGroupForAssignment(null);
                            }}
                            disabled={isFeatureAssignedToGroup(feature.key, selectedGroupForAssignment)}
                            className="text-xs py-1 px-2 bg-blue-600 text-white rounded disabled:opacity-50"
                          >
                            Assign
                          </button>
                        )}
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingFeatureId === feature.id ? (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editForm.active}
                              onChange={e => setEditForm({ ...editForm, active: e.target.checked })}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                              Active
                            </label>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            feature.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {feature.active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingFeatureId === feature.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="text-blue-600 hover:text-blue-900"
                              disabled={loading}
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
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleDetails(feature.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditClick(feature)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            {feature.active && (
                              <button
                                onClick={() => handleDeleteClick(feature)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                    
                    {/* Details Row */}
                    {detailsFeatureId === feature.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Description */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Description</h4>
                              <p className="mt-1 text-sm text-gray-900">{feature.description || 'No description'}</p>
                            </div>
                            
                            {/* Details */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Feature Details</h4>
                              <p className="mt-1 text-sm text-gray-900">ID: {feature.id}</p>
                              {feature.type === 'page' && (
                                <>
                                  <p className="text-sm text-gray-900">
                                    Navigation Label: {feature.nav_name || 'None'}
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    URL: {feature.url || 'None'}
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    Display Order: {feature.order || 0}
                                  </p>
                                </>
                              )}
                            </div>
                            
                            {/* Group Assignments */}
                            <div className="md:col-span-2">
                              <h4 className="text-sm font-medium text-gray-500">Assigned to Groups</h4>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {accessGroups
                                  .filter(group => isFeatureAssignedToGroup(feature.key, group.id))
                                  .map(group => (
                                    <div 
                                      key={group.id}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                    >
                                      <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                      {group.name}
                                      <button
                                        onClick={() => handleRemoveFeatureFromGroup(feature.key, group.id)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                      >
                                        <XMarkIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                {accessGroups.every(group => !isFeatureAssignedToGroup(feature.key, group.id)) && (
                                  <span className="text-sm text-gray-500">
                                    This feature is not assigned to any groups
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Deactivate Feature"
        message={
          <div>
            <p>Are you sure you want to deactivate the feature <strong>{deletingFeature?.name}</strong>?</p>
            <p className="mt-2 text-sm text-gray-500">
              This will mark the feature as inactive. Groups with this feature will no longer have access to it.
            </p>
          </div>
        }
      />
    </div>
  );
}
