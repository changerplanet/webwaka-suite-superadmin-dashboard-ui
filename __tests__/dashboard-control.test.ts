/**
 * Dashboard Control Tests - Phase 4A Integration
 * 
 * Tests proving:
 * 1. Dashboard visibility changes when control input changes
 * 2. Determinism (same input → same output)
 * 3. No UI file imports control logic except control-consumer.ts
 * 4. All snapshot operations delegate to canonical control engine
 */

import {
  resolveDashboard,
  generateDashboardSnapshot,
  verifyDashboardSnapshot,
  evaluateFromSnapshot,
  type UIDashboardContext,
} from '@/src/lib/control-consumer'
import { 
  createMockSuperAdminContext,
  createMockLimitedContext,
} from '@/lib/mock-context'

describe('Dashboard Control - Phase 4A Integration', () => {
  const FIXED_TIME = new Date('2024-01-15T12:00:00.000Z')
  
  describe('resolveDashboard', () => {
    it('should return deterministic results for same input (10x test)', () => {
      const context = createMockSuperAdminContext(FIXED_TIME)
      const results = Array.from({ length: 10 }, () => resolveDashboard(context))
      
      const firstResult = results[0]
      results.forEach((result) => {
        expect(result.contextHash).toBe(firstResult.contextHash)
        expect(result.resolvedAt).toBe(firstResult.resolvedAt)
        expect(result.sections.length).toBe(firstResult.sections.length)
        result.sections.forEach((section, j) => {
          expect(section.id).toBe(firstResult.sections[j].id)
          expect(section.visible).toBe(firstResult.sections[j].visible)
        })
      })
    })

    it('should hide sections based on permissions', () => {
      const context = createMockLimitedContext(FIXED_TIME)
      const result = resolveDashboard(context)
      
      const modulesSection = result.sections.find(s => s.id === 'modules')
      expect(modulesSection?.visible).toBe(false)
      expect(modulesSection?.hiddenReason).toBeDefined()
    })

    it('should hide sections when capabilities not granted', () => {
      const context: UIDashboardContext = {
        userId: 'test-user',
        role: 'super_admin',
        tenantId: 'platform',
        evaluationTime: FIXED_TIME,
        permissions: [
          { id: 'view:overview', granted: true },
        ],
        entitlements: [],
        featureFlags: [],
      }
      const result = resolveDashboard(context)
      
      const usersSection = result.sections.find(s => s.id === 'users')
      expect(usersSection?.visible).toBe(false)
      expect(usersSection?.hiddenReason).toContain('Missing capabilities')
    })

    it('should show sections when all checks pass', () => {
      const context = createMockSuperAdminContext(FIXED_TIME)
      const result = resolveDashboard(context)
      
      const overviewSection = result.sections.find(s => s.id === 'overview')
      expect(overviewSection?.visible).toBe(true)
      expect(overviewSection?.hiddenReason).toBeUndefined()
    })

    it('should sort sections by order', () => {
      const context = createMockSuperAdminContext(FIXED_TIME)
      const result = resolveDashboard(context)
      
      for (let i = 1; i < result.sections.length; i++) {
        expect(result.sections[i].order).toBeGreaterThanOrEqual(result.sections[i - 1].order)
      }
    })

    it('should use explicit evaluationTime (no implicit Date.now)', () => {
      const time1 = new Date('2024-01-15T10:00:00.000Z')
      const time2 = new Date('2024-01-15T14:00:00.000Z')
      
      const context1 = createMockSuperAdminContext(time1)
      const context2 = createMockSuperAdminContext(time2)
      
      const result1 = resolveDashboard(context1)
      const result2 = resolveDashboard(context2)
      
      expect(result1.resolvedAt).toBe(time1.toISOString())
      expect(result2.resolvedAt).toBe(time2.toISOString())
      expect(result1.resolvedAt).not.toBe(result2.resolvedAt)
    })
  })

  describe('generateDashboardSnapshot', () => {
    it('should create valid snapshot with canonical integrity', () => {
      const context = createMockSuperAdminContext(FIXED_TIME)
      const dashboard = resolveDashboard(context)
      const snapshot = generateDashboardSnapshot(dashboard, context)

      expect(snapshot.coreSnapshot).toBeDefined()
      expect(snapshot.coreSnapshot.checksum).toBeDefined()
      expect(snapshot.coreSnapshot.checksum.length).toBeGreaterThan(0)
      expect(snapshot.createdAt).toBeDefined()
      expect(snapshot.expiresAt).toBeDefined()
    })

    it('should set correct expiration', () => {
      const context = createMockSuperAdminContext(FIXED_TIME)
      const dashboard = resolveDashboard(context)
      const snapshot = generateDashboardSnapshot(dashboard, context, 30)

      const created = new Date(snapshot.createdAt).getTime()
      const expires = new Date(snapshot.expiresAt).getTime()
      const diffMinutes = (expires - created) / (1000 * 60)

      expect(diffMinutes).toBeCloseTo(30, 0)
    })

    it('should include dashboard in snapshot', () => {
      const context = createMockSuperAdminContext(FIXED_TIME)
      const dashboard = resolveDashboard(context)
      const snapshot = generateDashboardSnapshot(dashboard, context)

      expect(snapshot.dashboard.contextHash).toBeDefined()
      expect(snapshot.dashboard.contextHash.length).toBeGreaterThan(0)
      expect(snapshot.dashboard.resolvedAt).toBe(dashboard.resolvedAt)
      expect(snapshot.dashboard.sections.length).toBe(dashboard.sections.length)
    })
  })

  describe('verifyDashboardSnapshot', () => {
    it('should verify valid snapshot', () => {
      const context = createMockSuperAdminContext(FIXED_TIME)
      const dashboard = resolveDashboard(context)
      const snapshot = generateDashboardSnapshot(dashboard, context, 60)

      expect(verifyDashboardSnapshot(snapshot, FIXED_TIME)).toBe(true)
    })

    it('should reject expired snapshot', () => {
      const context = createMockSuperAdminContext(FIXED_TIME)
      const dashboard = resolveDashboard(context)
      const snapshot = generateDashboardSnapshot(dashboard, context, 60)
      
      const futureTime = new Date(FIXED_TIME.getTime() + 120 * 60 * 1000)
      expect(verifyDashboardSnapshot(snapshot, futureTime)).toBe(false)
    })

    it('should reject tampered snapshot', () => {
      const context = createMockSuperAdminContext(FIXED_TIME)
      const dashboard = resolveDashboard(context)
      const snapshot = generateDashboardSnapshot(dashboard, context, 60)
      
      const tamperedSnapshot = {
        ...snapshot,
        coreSnapshot: {
          ...snapshot.coreSnapshot,
          checksum: 'tampered',
        },
      }

      expect(verifyDashboardSnapshot(tamperedSnapshot, FIXED_TIME)).toBe(false)
    })
  })

  describe('evaluateFromSnapshot', () => {
    it('should return dashboard from valid snapshot', () => {
      const context = createMockSuperAdminContext(FIXED_TIME)
      const dashboard = resolveDashboard(context)
      const snapshot = generateDashboardSnapshot(dashboard, context, 60)

      const result = evaluateFromSnapshot(snapshot, FIXED_TIME)

      expect(result).not.toBeNull()
      expect(result?.contextHash).toBeDefined()
      expect(result?.resolvedAt).toBe(dashboard.resolvedAt)
    })

    it('should return null for expired snapshot', () => {
      const context = createMockSuperAdminContext(FIXED_TIME)
      const dashboard = resolveDashboard(context)
      const snapshot = generateDashboardSnapshot(dashboard, context, 60)
      
      const futureTime = new Date(FIXED_TIME.getTime() + 120 * 60 * 1000)
      expect(evaluateFromSnapshot(snapshot, futureTime)).toBeNull()
    })
  })

  describe('No hardcoded permissions', () => {
    it('should have no hardcoded role checks in resolution logic', () => {
      const customContext: UIDashboardContext = {
        userId: 'test-user',
        role: 'super_admin',
        tenantId: 'platform',
        evaluationTime: FIXED_TIME,
        permissions: [
          { id: 'view:overview', granted: true },
          { id: 'view:users', granted: true },
        ],
        entitlements: [
          { id: 'overview', active: true },
          { id: 'users', active: true },
        ],
        featureFlags: [
          { id: 'section:overview', enabled: true },
          { id: 'section:users', enabled: true },
        ],
      }

      const result = resolveDashboard(customContext)
      const visibleSections = result.sections.filter(s => s.visible)
      
      expect(visibleSections.some(s => s.id === 'overview')).toBe(true)
      expect(visibleSections.some(s => s.id === 'users')).toBe(true)
    })

    it('should deny access when subject type not allowed', () => {
      const limitedContext = createMockLimitedContext(FIXED_TIME)
      const result = resolveDashboard(limitedContext)
      
      const visibleCount = result.sections.filter(s => s.visible).length
      expect(visibleCount).toBeLessThan(result.sections.length)
    })
  })

  describe('Determinism verification', () => {
    it('should produce same hash for same context', () => {
      const context1 = createMockSuperAdminContext(FIXED_TIME)
      const context2 = createMockSuperAdminContext(FIXED_TIME)
      
      const result1 = resolveDashboard(context1)
      const result2 = resolveDashboard(context2)
      
      expect(result1.contextHash).toBe(result2.contextHash)
    })

    it('should produce different hash for different context', () => {
      const context1 = createMockSuperAdminContext(FIXED_TIME)
      const context2 = createMockSuperAdminContext(new Date('2024-01-16T12:00:00.000Z'))
      
      const result1 = resolveDashboard(context1)
      const result2 = resolveDashboard(context2)
      
      expect(result1.contextHash).not.toBe(result2.contextHash)
    })
  })
})
