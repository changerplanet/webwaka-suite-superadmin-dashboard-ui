'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getDomains, createDomain, verifyDomain, deleteDomain } from '@/lib/api-client';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { formatRelativeTime } from '@/lib/date-utils';

interface Domain {
  id: string;
  tenantId: string;
  hostname: string;
  status: 'PENDING' | 'VERIFYING' | 'ACTIVE' | 'FAILED';
  verificationMethod: 'TXT' | 'CNAME';
  verificationToken: string;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function DomainManagementSection() {
  const { getToken } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    hostname: '',
    verificationMethod: 'TXT' as 'TXT' | 'CNAME',
  });
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadDomains();
  }, [selectedTenantId]);

  async function loadDomains() {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      
      const data = await getDomains(token, selectedTenantId || undefined);
      setDomains(data.domains || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load domains');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTenantId) {
      alert('Please select a tenant first');
      return;
    }

    try {
      setSubmitting(true);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      await createDomain(token, {
        tenantId: selectedTenantId,
        hostname: formData.hostname,
        verificationMethod: formData.verificationMethod,
      });

      setFormData({ hostname: '', verificationMethod: 'TXT' });
      setShowAddForm(false);
      await loadDomains();
    } catch (err: any) {
      alert(err.message || 'Failed to add domain');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyDomain(domainId: string) {
    try {
      setVerifying(domainId);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      await verifyDomain(token, domainId);
      await loadDomains();
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setVerifying(null);
    }
  }

  async function handleDeleteDomain(domainId: string) {
    if (!confirm('Are you sure you want to delete this domain?')) return;

    try {
      setDeleting(domainId);
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      await deleteDomain(token, domainId);
      await loadDomains();
    } catch (err: any) {
      alert(err.message || 'Failed to delete domain');
    } finally {
      setDeleting(null);
    }
  }

  function getStatusBadge(status: Domain['status']) {
    const styles = {
      PENDING: 'bg-gray-100 text-gray-800',
      VERIFYING: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }

  if (loading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadDomains} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Domain Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage custom domains for tenants. Verify ownership via DNS records.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={!selectedTenantId}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {showAddForm ? 'Cancel' : 'Add Domain'}
        </button>
      </div>

      {/* Tenant Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Tenant
        </label>
        <input
          type="text"
          value={selectedTenantId}
          onChange={(e) => setSelectedTenantId(e.target.value)}
          placeholder="Enter tenant ID"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to view all domains (Super Admin only)
        </p>
      </div>

      {/* Add Domain Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Domain</h3>
          <form onSubmit={handleAddDomain} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain Name
              </label>
              <input
                type="text"
                value={formData.hostname}
                onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                placeholder="example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the domain without http:// or www
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Method
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="TXT"
                    checked={formData.verificationMethod === 'TXT'}
                    onChange={(e) => setFormData({ ...formData, verificationMethod: e.target.value as 'TXT' | 'CNAME' })}
                    className="mr-2"
                  />
                  <span className="text-sm">TXT Record (Recommended)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="CNAME"
                    checked={formData.verificationMethod === 'CNAME'}
                    onChange={(e) => setFormData({ ...formData, verificationMethod: e.target.value as 'TXT' | 'CNAME' })}
                    className="mr-2"
                  />
                  <span className="text-sm">CNAME Record</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {submitting ? 'Adding...' : 'Add Domain'}
            </button>
          </form>
        </div>
      )}

      {/* Domains List */}
      {domains.length === 0 ? (
        <EmptyState
          title="No domains yet"
          description={selectedTenantId ? "This tenant hasn't added any custom domains yet." : "Select a tenant to view their domains."}
        />
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <div key={domain.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {domain.hostname}
                    </h3>
                    {getStatusBadge(domain.status)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Verification: {domain.verificationMethod} Record</p>
                    <p>Added: {formatRelativeTime(domain.createdAt)}</p>
                    {domain.verifiedAt && (
                      <p>Verified: {formatRelativeTime(domain.verifiedAt)}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {domain.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleVerifyDomain(domain.id)}
                      disabled={verifying === domain.id}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {verifying === domain.id ? 'Verifying...' : 'Verify'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDomain(domain.id)}
                    disabled={deleting === domain.id}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting === domain.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              {/* DNS Instructions */}
              {domain.status !== 'ACTIVE' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    DNS Setup Instructions
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Add this {domain.verificationMethod} record to your domain's DNS settings:
                  </p>
                  <div className="bg-white p-3 rounded border border-gray-300 font-mono text-sm break-all">
                    {domain.verificationMethod === 'TXT' ? (
                      <>
                        <div><strong>Type:</strong> TXT</div>
                        <div><strong>Name:</strong> _webwaka-verification</div>
                        <div><strong>Value:</strong> {domain.verificationToken}</div>
                      </>
                    ) : (
                      <>
                        <div><strong>Type:</strong> CNAME</div>
                        <div><strong>Name:</strong> _webwaka-verification.{domain.hostname}</div>
                        <div><strong>Value:</strong> {domain.verificationToken}.verify.webwaka.com</div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(domain.verificationToken)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Copy verification token
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    💡 DNS changes can take up to 48 hours to propagate. Click "Verify" once you've added the record.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
