/**
 * lib/types.ts
 * 
 * Re-exports UI-compatible types from the control consumer.
 * This file maintains backward compatibility with existing UI code.
 */

export type {
  UIDashboardContext as DashboardContext,
  UIDashboardSection as DashboardSection,
  UIResolvedDashboard as ResolvedDashboard,
  UIDashboardSnapshot as DashboardSnapshot,
} from '@/src/lib/control-consumer';

export interface Permission {
  id: string;
  granted: boolean;
}

export interface Entitlement {
  id: string;
  active: boolean;
}

export interface FeatureFlag {
  id: string;
  enabled: boolean;
}

export interface SectionGroup {
  id: string;
  title: string;
  order: number;
}
