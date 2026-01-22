'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { getTenantById, getTenantMembers, addTenantMember } from '@/lib/api-client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function TenantDetailPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('MEMBER');

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      router.push('/admin/login');
      return;
    }

    fetchTenantData();
  }, [isLoaded, isSignedIn, getToken, router, tenantId]);

  async function fetchTenantData() {
    try {
      const token = await getToken();
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const [tenantRes, membersRes] = await Promise.all([
        getTenantById(token, tenantId),
        getTenantMembers(token, tenantId),
      ]);

      setTenant(tenantRes.data);
      setMembers(membersRes.data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching tenant data:', err);
      setError(err.message || 'Failed to load tenant data');
      setLoading(false);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        router.push('/admin/login');
        return;
      }

      await addTenantMember(token, tenantId, {
        userId: newMemberUserId,
        role: newMemberRole,
      });

      setNewMemberUserId('');
      setNewMemberRole('MEMBER');
      setShowAddMemberForm(false);
      await fetchTenantData();
    } catch (err: any) {
      console.error('Error adding member:', err);
      setError(err.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Tenant not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link href="/admin/tenants" className="text-indigo-600 hover:text-indigo-900">
          ← Back to Tenants
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
          tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {tenant.status}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tenant Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Tenant Details</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tenant ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">{tenant.id}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(tenant.createdAt).toLocaleString()}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(tenant.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Members ({members.length})</h3>
          <button
            onClick={() => setShowAddMemberForm(!showAddMemberForm)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showAddMemberForm ? 'Cancel' : 'Add Member'}
          </button>
        </div>

        {showAddMemberForm && (
          <div className="px-4 py-5 sm:p-6 border-b border-gray-200 bg-gray-50">
            <form onSubmit={handleAddMember}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                    User ID
                  </label>
                  <input
                    type="text"
                    id="userId"
                    value={newMemberUserId}
                    onChange={(e) => setNewMemberUserId(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter user ID"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="role"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    <option value="OWNER">Owner</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={adding}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        )}

        {members.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-500">No members yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {members.map((member: any) => (
              <li key={member.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{member.user?.email || 'Unknown'}</p>
                    <p className="text-sm text-gray-500 font-mono">{member.userId}</p>
                  </div>
                  <div className="ml-4">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {member.role}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
