export interface Permission {
  id: string
  granted: boolean
}

export interface Entitlement {
  id: string
  active: boolean
}

export interface FeatureFlag {
  id: string
  enabled: boolean
}

export interface DashboardContext {
  userId: string
  role: string
  permissions: Permission[]
  entitlements: Entitlement[]
  featureFlags: FeatureFlag[]
}

export interface DashboardSection {
  id: string
  title: string
  visible: boolean
  hiddenReason?: string
  order: number
}

export interface ResolvedDashboard {
  sections: DashboardSection[]
  resolvedAt: string
  contextHash: string
}

export interface DashboardSnapshot {
  dashboard: ResolvedDashboard
  createdAt: string
  expiresAt: string
  signature: string
}
