/**
 * Jest Mock for webwaka-core-dashboard-control
 * 
 * This mock implements the exact same logic as the canonical package
 * to enable Jest testing while maintaining constitutional compliance.
 * The actual production code uses the real canonical packages.
 */

export type DashboardSection = {
  sectionId: string;
  label: string;
  icon?: string;
  requiredCapabilities?: string[];
  requiredEntitlements?: string[];
  requiredFeatures?: string[];
  children?: DashboardSection[];
};

export type DashboardDeclaration = {
  dashboardId: string;
  label: string;
  allowedSubjects: string[];
  allowedTenants?: string[];
  allowedPartners?: string[];
  requiredCapabilities?: string[];
  requiredEntitlements?: string[];
  requiredFeatures?: string[];
  sections: DashboardSection[];
};

export type DashboardContext = {
  subjectId: string;
  subjectType: 'super_admin' | 'partner_admin' | 'tenant_admin' | 'staff' | 'user';
  tenantId: string;
  partnerId?: string;
  roles: string[];
  evaluationTime: Date;
};

export type HiddenReason = {
  sectionId: string;
  reason: 'missing_capability' | 'missing_entitlement' | 'missing_feature' | 'tenant_not_allowed' | 'partner_not_allowed' | 'subject_not_allowed';
  details: string;
};

export type ResolvedDashboard = {
  dashboardId: string;
  visibleSections: DashboardSection[];
  hiddenSections: string[];
  reasons: HiddenReason[];
};

export type PermissionResult = {
  subjectId: string;
  capabilities: string[];
  deniedCapabilities?: string[];
};

export type EntitlementSnapshot = {
  tenantId: string;
  activeEntitlements: string[];
  expiredEntitlements?: string[];
};

export type FeatureSnapshot = {
  enabledFeatures: string[];
  disabledFeatures?: string[];
};

export type DashboardSnapshot = {
  snapshotId: string;
  dashboardId: string;
  subjectId: string;
  tenantId: string;
  resolvedSections: DashboardSection[];
  hiddenSections: string[];
  reasons: HiddenReason[];
  checksum: string;
  evaluationTime: Date;
  expiresAt?: Date;
};

function checkCapabilities(
  required: string[] | undefined,
  available: string[]
): { allowed: boolean; missing: string[] } {
  if (!required || required.length === 0) {
    return { allowed: true, missing: [] };
  }
  const missing = required.filter((cap) => !available.includes(cap));
  return { allowed: missing.length === 0, missing };
}

function checkEntitlements(
  required: string[] | undefined,
  active: string[]
): { allowed: boolean; missing: string[] } {
  if (!required || required.length === 0) {
    return { allowed: true, missing: [] };
  }
  const missing = required.filter((ent) => !active.includes(ent));
  return { allowed: missing.length === 0, missing };
}

function checkFeatures(
  required: string[] | undefined,
  enabled: string[]
): { allowed: boolean; missing: string[] } {
  if (!required || required.length === 0) {
    return { allowed: true, missing: [] };
  }
  const missing = required.filter((feat) => !enabled.includes(feat));
  return { allowed: missing.length === 0, missing };
}

function resolveSections(
  sections: DashboardSection[],
  permissions: PermissionResult,
  entitlements: EntitlementSnapshot,
  features: FeatureSnapshot,
  reasons: HiddenReason[],
  hiddenSections: string[]
): DashboardSection[] {
  const visibleSections: DashboardSection[] = [];

  for (const section of sections) {
    const capCheck = checkCapabilities(
      section.requiredCapabilities,
      permissions.capabilities
    );
    if (!capCheck.allowed) {
      hiddenSections.push(section.sectionId);
      reasons.push({
        sectionId: section.sectionId,
        reason: 'missing_capability',
        details: `Missing capabilities: ${capCheck.missing.join(', ')}`,
      });
      continue;
    }

    const entCheck = checkEntitlements(
      section.requiredEntitlements,
      entitlements.activeEntitlements
    );
    if (!entCheck.allowed) {
      hiddenSections.push(section.sectionId);
      reasons.push({
        sectionId: section.sectionId,
        reason: 'missing_entitlement',
        details: `Missing entitlements: ${entCheck.missing.join(', ')}`,
      });
      continue;
    }

    const featCheck = checkFeatures(
      section.requiredFeatures,
      features.enabledFeatures
    );
    if (!featCheck.allowed) {
      hiddenSections.push(section.sectionId);
      reasons.push({
        sectionId: section.sectionId,
        reason: 'missing_feature',
        details: `Missing features: ${featCheck.missing.join(', ')}`,
      });
      continue;
    }

    const resolvedSection: DashboardSection = {
      sectionId: section.sectionId,
      label: section.label,
      icon: section.icon,
    };

    if (section.children && section.children.length > 0) {
      const resolvedChildren = resolveSections(
        section.children,
        permissions,
        entitlements,
        features,
        reasons,
        hiddenSections
      );
      if (resolvedChildren.length > 0) {
        resolvedSection.children = resolvedChildren;
      }
    }

    visibleSections.push(resolvedSection);
  }

  return visibleSections;
}

export function resolveDashboard(
  declaration: DashboardDeclaration,
  context: DashboardContext,
  permissionResult: PermissionResult,
  entitlementSnapshot: EntitlementSnapshot,
  featureSnapshot: FeatureSnapshot
): ResolvedDashboard {
  if (!declaration.allowedSubjects.includes(context.subjectType)) {
    return {
      dashboardId: declaration.dashboardId,
      visibleSections: [],
      hiddenSections: declaration.sections.map((s) => s.sectionId),
      reasons: [
        {
          sectionId: declaration.dashboardId,
          reason: 'subject_not_allowed',
          details: `Subject type '${context.subjectType}' is not allowed`,
        },
      ],
    };
  }

  if (
    declaration.allowedTenants &&
    declaration.allowedTenants.length > 0 &&
    !declaration.allowedTenants.includes(context.tenantId)
  ) {
    return {
      dashboardId: declaration.dashboardId,
      visibleSections: [],
      hiddenSections: declaration.sections.map((s) => s.sectionId),
      reasons: [
        {
          sectionId: declaration.dashboardId,
          reason: 'tenant_not_allowed',
          details: `Tenant '${context.tenantId}' is not allowed`,
        },
      ],
    };
  }

  const capCheck = checkCapabilities(
    declaration.requiredCapabilities,
    permissionResult.capabilities
  );
  if (!capCheck.allowed) {
    return {
      dashboardId: declaration.dashboardId,
      visibleSections: [],
      hiddenSections: declaration.sections.map((s) => s.sectionId),
      reasons: [
        {
          sectionId: declaration.dashboardId,
          reason: 'missing_capability',
          details: `Dashboard requires capabilities: ${capCheck.missing.join(', ')}`,
        },
      ],
    };
  }

  const reasons: HiddenReason[] = [];
  const hiddenSections: string[] = [];
  const visibleSections = resolveSections(
    declaration.sections,
    permissionResult,
    entitlementSnapshot,
    featureSnapshot,
    reasons,
    hiddenSections
  );

  return {
    dashboardId: declaration.dashboardId,
    visibleSections,
    hiddenSections,
    reasons,
  };
}

export function generateDashboardSnapshot(
  declaration: DashboardDeclaration,
  resolvedDashboard: ResolvedDashboard,
  context: DashboardContext,
  expiresInMs?: number
): DashboardSnapshot {
  const snapshotData = JSON.stringify({
    dashboardId: declaration.dashboardId,
    subjectId: context.subjectId,
    tenantId: context.tenantId,
    resolvedSections: resolvedDashboard.visibleSections,
    hiddenSections: resolvedDashboard.hiddenSections,
    reasons: resolvedDashboard.reasons,
    evaluationTime: context.evaluationTime.toISOString(),
  });
  
  let hash = 0;
  for (let i = 0; i < snapshotData.length; i++) {
    hash = ((hash << 5) - hash) + snapshotData.charCodeAt(i);
    hash = hash & hash;
  }

  const snapshot: DashboardSnapshot = {
    snapshotId: Math.abs(hash).toString(16),
    dashboardId: declaration.dashboardId,
    subjectId: context.subjectId,
    tenantId: context.tenantId,
    resolvedSections: resolvedDashboard.visibleSections,
    hiddenSections: resolvedDashboard.hiddenSections,
    reasons: resolvedDashboard.reasons,
    checksum: Math.abs(hash).toString(16),
    evaluationTime: context.evaluationTime,
  };

  if (expiresInMs) {
    snapshot.expiresAt = new Date(context.evaluationTime.getTime() + expiresInMs);
  }

  return snapshot;
}

export function verifyDashboardSnapshot(snapshot: DashboardSnapshot): boolean {
  const snapshotData = JSON.stringify({
    dashboardId: snapshot.dashboardId,
    subjectId: snapshot.subjectId,
    tenantId: snapshot.tenantId,
    resolvedSections: snapshot.resolvedSections,
    hiddenSections: snapshot.hiddenSections,
    reasons: snapshot.reasons,
    evaluationTime: snapshot.evaluationTime.toISOString(),
  });

  let hash = 0;
  for (let i = 0; i < snapshotData.length; i++) {
    hash = ((hash << 5) - hash) + snapshotData.charCodeAt(i);
    hash = hash & hash;
  }

  return snapshot.checksum === Math.abs(hash).toString(16);
}

export function evaluateFromSnapshot(
  snapshot: DashboardSnapshot,
  evaluationTime?: Date
): ResolvedDashboard {
  const now = evaluationTime || new Date();

  if (snapshot.expiresAt && now > snapshot.expiresAt) {
    return {
      dashboardId: snapshot.dashboardId,
      visibleSections: [],
      hiddenSections: snapshot.hiddenSections,
      reasons: [
        {
          sectionId: snapshot.dashboardId,
          reason: 'missing_feature',
          details: `Snapshot expired at ${snapshot.expiresAt.toISOString()}`,
        },
      ],
    };
  }

  return {
    dashboardId: snapshot.dashboardId,
    visibleSections: snapshot.resolvedSections,
    hiddenSections: snapshot.hiddenSections,
    reasons: snapshot.reasons,
  };
}
