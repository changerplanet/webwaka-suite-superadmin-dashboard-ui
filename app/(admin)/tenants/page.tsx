'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { getUserTenants, createTenant } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TenantsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      router.push('/admin/login');
      return;
    }

    fetchTenants();
  }, [isLoaded, isSignedIn, getToken, router]);

  async function fetchTenants() {
    try {
      const token = await getToken();
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await getUserTenants(token);
      setTenants(response.data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching tenants:', err);
      setError(err.message || 'Failed to load tenants');
      setLoading(false);
    }
  }

  async function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        router.push('/admin/login');
        return;
      }

      await createTenant(token, {
        name: newTenantName,
        membershipRole: 'OWNER',
      });

      setNewTenantName('');
      setShowCreateForm(false);
      await fetchTenants();
    } catch (err: any) {
      console.error('Error creating tenant:', err);
      setError(err.message || 'Failed to create tenant');
    } finally {
      setCreating(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showCreateForm ? 'Cancel' : 'Create Tenant'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Tenant</h3>
            <form onSubmit={handleCreateTenant}>
              <div className="mb-4">
                <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">
                  Tenant Name
                </label>
                <input
                  type="text"
                  id="tenantName"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter tenant name"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {tenants.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new tenant.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tenants.map((tenant: any) => (
              <li key={tenant.id}>
                <Link
                  href={`/admin/tenants/${tenant.id}`}
                  className="block hover:bg-gray-50 transition"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-indigo-600 truncate">{tenant.name}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span>Role: {tenant.membershipRole}</span>
                          <span className="mx-2">•</span>
                          <span>Created: {new Date(tenant.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tenant.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
