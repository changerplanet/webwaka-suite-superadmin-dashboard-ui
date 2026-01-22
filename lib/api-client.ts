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
