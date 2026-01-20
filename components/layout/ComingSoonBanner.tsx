'use client'

interface ComingSoonBannerProps {
  feature: string
  phase?: string
}

export default function ComingSoonBanner({ feature, phase }: ComingSoonBannerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">{feature}</h4>
          <p className="text-sm text-slate-600 mt-1">
            This feature is coming soon. Integration will be available in a future release.
          </p>
          {phase && (
            <span className="inline-block mt-3 px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
              Planned: {phase}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
