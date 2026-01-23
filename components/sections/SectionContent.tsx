'use client'

import { DashboardSection } from '@/lib/types'
import SectionHeader from '@/components/layout/SectionHeader'
import KpiPlaceholder from '@/components/layout/KpiPlaceholder'
import TablePlaceholder from '@/components/layout/TablePlaceholder'
import ComingSoonBanner from '@/components/layout/ComingSoonBanner'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import OverviewSection from './OverviewSection'

interface SectionContentProps {
  section: DashboardSection
}

const sectionConfigs: Record<string, {
  kpis: { title: string; icon?: string }[]
  tableColumns: string[]
  comingSoon?: { feature: string; phase: string }
}> = {
  overview: {
    kpis: [
      { title: 'Total Users', icon: '👥' },
      { title: 'Active Partners', icon: '🤝' },
      { title: 'Modules Deployed', icon: '📦' },
      { title: 'System Health', icon: '💚' },
    ],
    tableColumns: ['Activity', 'Type', 'User', 'Time'],
  },
  users: {
    kpis: [
      { title: 'Total Users', icon: '👥' },
      { title: 'Active Today', icon: '✅' },
      { title: 'New This Week', icon: '📈' },
      { title: 'Pending Invites', icon: '📧' },
    ],
    tableColumns: ['Name', 'Email', 'Role', 'Status', 'Last Active'],
  },
  partners: {
    kpis: [
      { title: 'Total Partners', icon: '🤝' },
      { title: 'Active', icon: '✅' },
      { title: 'Pending Review', icon: '⏳' },
      { title: 'Revenue Share', icon: '💰' },
    ],
    tableColumns: ['Partner Name', 'Type', 'Status', 'Users', 'Since'],
  },
  modules: {
    kpis: [
      { title: 'Installed', icon: '📦' },
      { title: 'Active', icon: '✅' },
      { title: 'Updates Available', icon: '🔄' },
      { title: 'Custom Modules', icon: '⚙️' },
    ],
    tableColumns: ['Module', 'Version', 'Status', 'Dependencies', 'Updated'],
  },
  permissions: {
    kpis: [
      { title: 'Roles Defined', icon: '🔐' },
      { title: 'Permissions', icon: '🔑' },
      { title: 'Policy Rules', icon: '📜' },
      { title: 'Overrides', icon: '⚡' },
    ],
    tableColumns: ['Permission', 'Scope', 'Roles', 'Created'],
  },
  entitlements: {
    kpis: [
      { title: 'Active Plans', icon: '🎫' },
      { title: 'Features Gated', icon: '🚧' },
      { title: 'Usage Quotas', icon: '📊' },
      { title: 'Overages', icon: '⚠️' },
    ],
    tableColumns: ['Entitlement', 'Type', 'Limit', 'Used', 'Status'],
  },
  'feature-flags': {
    kpis: [
      { title: 'Total Flags', icon: '🚩' },
      { title: 'Enabled', icon: '✅' },
      { title: 'In Rollout', icon: '📈' },
      { title: 'Experiments', icon: '🧪' },
    ],
    tableColumns: ['Flag Name', 'Status', 'Rollout %', 'Environment', 'Updated'],
  },
  pricing: {
    kpis: [
      { title: 'Pricing Tiers', icon: '💰' },
      { title: 'Active Subscriptions', icon: '📋' },
      { title: 'MRR', icon: '💵' },
      { title: 'Trials Active', icon: '⏱️' },
    ],
    tableColumns: ['Plan', 'Price', 'Billing', 'Subscribers', 'Status'],
    comingSoon: { feature: 'Pricing Management', phase: 'Phase 5' },
  },
  incentives: {
    kpis: [
      { title: 'Active Programs', icon: '🎁' },
      { title: 'Total Rewards', icon: '🏆' },
      { title: 'Pending Payouts', icon: '💳' },
      { title: 'Participants', icon: '👥' },
    ],
    tableColumns: ['Program', 'Type', 'Reward', 'Participants', 'Status'],
    comingSoon: { feature: 'Incentive Programs', phase: 'Phase 5' },
  },
  branding: {
    kpis: [
      { title: 'Themes', icon: '🎨' },
      { title: 'Custom Logos', icon: '🖼️' },
      { title: 'Color Palettes', icon: '🌈' },
      { title: 'Fonts', icon: '🔤' },
    ],
    tableColumns: ['Asset', 'Type', 'Tenant', 'Updated'],
    comingSoon: { feature: 'Branding Customization', phase: 'Phase 6' },
  },
  ai: {
    kpis: [
      { title: 'Models Active', icon: '🤖' },
      { title: 'API Calls Today', icon: '📡' },
      { title: 'Automations', icon: '⚡' },
      { title: 'Token Usage', icon: '🎯' },
    ],
    tableColumns: ['Service', 'Model', 'Status', 'Usage', 'Cost'],
    comingSoon: { feature: 'AI Service Management', phase: 'Phase 7' },
  },
  'audit-logs': {
    kpis: [
      { title: 'Events Today', icon: '📋' },
      { title: 'Alerts', icon: '🚨' },
      { title: 'Compliance Score', icon: '✅' },
      { title: 'Retention Days', icon: '📆' },
    ],
    tableColumns: ['Timestamp', 'Event', 'Actor', 'Resource', 'Result'],
  },
  infrastructure: {
    kpis: [
      { title: 'Services', icon: '🖥️' },
      { title: 'Uptime', icon: '⬆️' },
      { title: 'CPU Usage', icon: '📊' },
      { title: 'Memory', icon: '💾' },
    ],
    tableColumns: ['Service', 'Status', 'Instances', 'Region', 'Health'],
    comingSoon: { feature: 'Infrastructure Dashboard', phase: 'Phase 6' },
  },
  settings: {
    kpis: [
      { title: 'Config Keys', icon: '⚙️' },
      { title: 'Secrets', icon: '🔒' },
      { title: 'Integrations', icon: '🔗' },
      { title: 'Webhooks', icon: '🪝' },
    ],
    tableColumns: ['Setting', 'Value', 'Type', 'Last Modified'],
  },
}

export default function SectionContent({ section }: SectionContentProps) {
  // Use API-integrated components for specific sections
  if (section.id === 'overview') {
    return <OverviewSection />
  }

  const config = sectionConfigs[section.id] || {
    kpis: [{ title: 'Metric 1' }, { title: 'Metric 2' }, { title: 'Metric 3' }, { title: 'Metric 4' }],
    tableColumns: ['Column 1', 'Column 2', 'Column 3', 'Column 4'],
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '#' },
          { label: section.title },
        ]}
      />

      <SectionHeader
        title={section.title}
        description={section.description}
        badge="Controlled by Core"
      />

      {config.comingSoon && (
        <div className="mb-6">
          <ComingSoonBanner
            feature={config.comingSoon.feature}
            phase={config.comingSoon.phase}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {config.kpis.map((kpi, i) => (
          <KpiPlaceholder key={i} title={kpi.title} icon={kpi.icon} />
        ))}
      </div>

      <TablePlaceholder columns={config.tableColumns} rows={5} />

      <div className="mt-6 p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
        <p className="text-sm text-slate-500 text-center">
          📌 TODO: Integration point for {section.title} data
        </p>
      </div>
    </div>
  )
}
