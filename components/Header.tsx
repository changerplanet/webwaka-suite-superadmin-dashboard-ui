'use client'

interface HeaderProps {
  title: string
  contextHash: string
  resolvedAt: string
  isSnapshot: boolean
  showDevMode: boolean
  onToggleDevMode: () => void
}

export default function Header({
  title,
  contextHash,
  resolvedAt,
  isSnapshot,
  showDevMode,
  onToggleDevMode,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
            <span>Hash: {contextHash.slice(0, 8)}</span>
            <span className="text-slate-300">|</span>
            <span>Resolved: {new Date(resolvedAt).toLocaleTimeString()}</span>
            {isSnapshot && (
              <>
                <span className="text-slate-300">|</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                  Snapshot Mode
                </span>
              </>
            )}
          </div>
        </div>
        
        <button
          onClick={onToggleDevMode}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showDevMode
              ? 'bg-purple-100 text-purple-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {showDevMode ? 'Dev Mode ON' : 'Dev Mode OFF'}
        </button>
      </div>
    </header>
  )
}
