'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { getRoles, assignRole } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function RolesPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRoleId, setAssignRoleId] = useState('');
  const [assignTenantId, setAssignTenantId] = useState('');
  const [assignScope, setAssignScope] = useState<'platform' | 'tenant'>('platform');

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      router.push('/admin/login');
      return;
    }

    fetchRoles();
  }, [isLoaded, isSignedIn, getToken, router]);

  async function fetchRoles() {
    try {
      const token = await getToken();
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await getRoles(token);
      setRoles(response.data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError(err.message || 'Failed to load roles');
      setLoading(false);
    }
  }

  async function handleAssignRole(e: React.FormEvent) {
    e.preventDefault();
    setAssigning(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        router.push('/admin/login');
        return;
      }

      await assignRole(token, {
        userId: assignUserId,
        roleId: assignRoleId,
        tenantId: assignScope === 'tenant' ? assignTenantId : null,
      });

      setAssignUserId('');
      setAssignRoleId('');
      setAssignTenantId('');
      setShowAssignForm(false);
      alert('Role assigned successfully!');
    } catch (err: any) {
      console.error('Error assigning role:', err);
      setError(err.message || 'Failed to assign role');
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
        <button
          onClick={() => setShowAssignForm(!showAssignForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showAssignForm ? 'Cancel' : 'Assign Role'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {showAssignForm && (
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Assign Role to User</h3>
            <form onSubmit={handleAssignRole}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                    User ID
                  </label>
                  <input
                    type="text"
                    id="userId"
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter user ID"
                  />
                </div>

                <div>
                  <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="roleId"
                    value={assignRoleId}
                    onChange={(e) => setAssignRoleId(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} ({role.scope})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Scope
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="platform"
                        checked={assignScope === 'platform'}
                        onChange={(e) => setAssignScope(e.target.value as 'platform')}
                        className="form-radio h-4 w-4 text-indigo-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Platform-wide</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="tenant"
                        checked={assignScope === 'tenant'}
                        onChange={(e) => setAssignScope(e.target.value as 'tenant')}
                        className="form-radio h-4 w-4 text-indigo-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Tenant-specific</span>
                    </label>
                  </div>
                </div>

                {assignScope === 'tenant' && (
                  <div>
                    <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700">
                      Tenant ID
                    </label>
                    <input
                      type="text"
                      id="tenantId"
                      value={assignTenantId}
                      onChange={(e) => setAssignTenantId(e.target.value)}
                      required={assignScope === 'tenant'}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter tenant ID"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={assigning}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Assign Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roles List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Available Roles</h3>
        </div>
        {roles.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-500">No roles found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {roles.map((role: any) => (
              <div key={role.id} className="px-4 py-5 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-lg font-medium text-gray-900">{role.name}</h4>
                      <span className={`ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        role.scope === 'PLATFORM' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {role.scope}
                      </span>
                    </div>
                    {role.description && (
                      <p className="mt-1 text-sm text-gray-500">{role.description}</p>
                    )}
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Permissions:</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {role.permissions?.map((permission: any) => (
                          <span
                            key={permission.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {permission.name}
                          </span>
                        )) || <span className="text-sm text-gray-400">No permissions</span>}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className="text-xs text-gray-400 font-mono">{role.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
