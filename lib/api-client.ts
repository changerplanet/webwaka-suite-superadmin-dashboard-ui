/**
 * Core API Client
 * 
 * Provides typed methods to interact with the WebWaka Core API.
 * All methods require a valid Clerk JWT token.
 */

const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'https://webwaka-core-api.fly.dev';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchAPI(endpoint: string, token: string, options: RequestInit = {}) {
  const url = `${CORE_API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      errorData
    );
  }

  return response.json();
}

// Auth APIs
export async function getSession(token: string) {
  return fetchAPI('/auth/session', token);
}

export async function bootstrapSuperAdmin(token: string) {
  return fetchAPI('/auth/bootstrap/super-admin', token, {
    method: 'POST',
  });
}

// User APIs
export async function getCurrentUser(token: string) {
  return fetchAPI('/users/me', token);
}

export async function getUserById(token: string, userId: string) {
  return fetchAPI(`/users/${userId}`, token);
}

// Tenant APIs
export async function createTenant(token: string, data: { name: string; membershipRole?: string }) {
  return fetchAPI('/tenants', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getTenantById(token: string, tenantId: string) {
  return fetchAPI(`/tenants/${tenantId}`, token);
}

export async function getUserTenants(token: string) {
  return fetchAPI('/tenants/mine', token);
}

// Membership APIs
export async function addTenantMember(
  token: string,
  tenantId: string,
  data: { userId: string; role: string }
) {
  return fetchAPI(`/tenants/${tenantId}/members`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getTenantMembers(token: string, tenantId: string) {
  return fetchAPI(`/tenants/${tenantId}/members`, token);
}

// Role APIs
export async function getRoles(token: string) {
  return fetchAPI('/roles', token);
}

export async function assignRole(
  token: string,
  data: { userId: string; roleId: string; tenantId?: string | null }
) {
  return fetchAPI('/roles/assign', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Phase 5: Governance & Monetization APIs

// Audit Logs APIs
export async function getAuditLogs(
  token: string,
  params?: { tenantId?: string; actorUserId?: string; entityType?: string; startDate?: string; endDate?: string }
) {
  const queryParams = new URLSearchParams();
  if (params?.tenantId) queryParams.append('tenantId', params.tenantId);
  if (params?.actorUserId) queryParams.append('actorUserId', params.actorUserId);
  if (params?.entityType) queryParams.append('entityType', params.entityType);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  
  const query = queryParams.toString();
  return fetchAPI(`/audit-logs${query ? `?${query}` : ''}`, token);
}

// Feature Flags APIs
export async function getFeatureFlags(token: string) {
  return fetchAPI('/feature-flags', token);
}

export async function createFeatureFlag(
  token: string,
  data: { key: string; name: string; description?: string; enabled?: boolean; environment?: string }
) {
  return fetchAPI('/feature-flags', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFeatureFlag(
  token: string,
  id: string,
  data: { name?: string; description?: string; enabled?: boolean; environment?: string }
) {
  return fetchAPI(`/feature-flags/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Entitlements APIs
export async function getEntitlements(token: string) {
  return fetchAPI('/entitlements', token);
}

export async function createEntitlement(
  token: string,
  data: { featureKey: string; tenantId?: string; planId?: string; enabled?: boolean; metadata?: any }
) {
  return fetchAPI('/entitlements', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEntitlement(
  token: string,
  id: string,
  data: { enabled?: boolean; metadata?: any }
) {
  return fetchAPI(`/entitlements/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Modules APIs
export async function getModules(token: string) {
  return fetchAPI('/modules', token);
}

export async function createModule(
  token: string,
  data: { name: string; version: string; status?: string; description?: string; dependencies?: any; metadata?: any }
) {
  return fetchAPI('/modules', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateModule(
  token: string,
  id: string,
  data: { version?: string; status?: string; description?: string; dependencies?: any; metadata?: any }
) {
  return fetchAPI(`/modules/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Pricing Plans APIs
export async function getPricingPlans(token: string) {
  return fetchAPI('/pricing-plans', token);
}

export async function createPricingPlan(
  token: string,
  data: { name: string; description?: string; price: number; currency?: string; interval?: string; features?: any; metadata?: any; active?: boolean }
) {
  return fetchAPI('/pricing-plans', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Phase 6: Branding & White-Labeling APIs

// Platform Branding APIs
export async function getPlatformBranding(token: string) {
  return fetchAPI('/branding/platform', token);
}

export async function createPlatformBranding(
  token: string,
  data: {
    brandName: string;
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  }
) {
  return fetchAPI('/branding/platform', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePlatformBranding(
  token: string,
  data: {
    brandName?: string;
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  }
) {
  return fetchAPI('/branding/platform', token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Tenant Branding APIs
export async function getTenantBranding(token: string, tenantId: string) {
  return fetchAPI(`/branding/tenant/${tenantId}`, token);
}

export async function createTenantBranding(
  token: string,
  tenantId: string,
  data: {
    brandName: string;
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  }
) {
  return fetchAPI(`/branding/tenant/${tenantId}`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTenantBranding(
  token: string,
  tenantId: string,
  data: {
    brandName?: string;
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  }
) {
  return fetchAPI(`/branding/tenant/${tenantId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Phase 6.3: Domain Management APIs

export async function getDomains(token: string, tenantId?: string) {
  const query = tenantId ? `?tenantId=${tenantId}` : '';
  return fetchAPI(`/domains${query}`, token);
}

export async function createDomain(
  token: string,
  data: {
    tenantId: string;
    hostname: string;
    verificationMethod: 'TXT' | 'CNAME';
  }
) {
  return fetchAPI('/domains', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyDomain(token: string, domainId: string) {
  return fetchAPI(`/domains/${domainId}/verify`, token, {
    method: 'POST',
  });
}

export async function deleteDomain(token: string, domainId: string) {
  return fetchAPI(`/domains/${domainId}`, token, {
    method: 'DELETE',
  });
}
