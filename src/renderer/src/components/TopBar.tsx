import { BookMarked, Clapperboard, Image as ImageIcon, Power, Settings2, Square } from 'lucide-react'
import type { AppSettings, ConnectionStatus, ModelInfo, WorkspaceTab } from '@shared/types'
import clsx from 'clsx'

interface Props {
  status: ConnectionStatus
  settings: AppSettings
  models: ModelInfo[]
  tab: WorkspaceTab
  onTabChange: (tab: WorkspaceTab) => void
  onSwitchModel: (model: string) => void
  onUnload: () => void
  onOpenSettings: () => void
  onCloseApp: () => void
}

export default function TopBar({
  status,
  settings,
  models,
  tab,
  onTabChange,
  onSwitchModel,
  onUnload,
  onOpenSettings,
  onCloseApp
}: Props): React.JSX.Element {
  const ready = status.online && Boolean(settings.model || status.model)

  return (
    <header className="flex items-center gap-4 border-b border-ink-800/90 bg-ink-950/80 px-4 py-3 backdrop-blur-md">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <h1 className="truncate text-lg font-semibold tracking-tight text-ink-100">
            Cutroom
          </h1>
          <p className="hidden truncate text-sm text-ink-400 sm:block">
            Video & Meme Prompt Studio · Private local models only
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-md border border-ink-800 bg-ink-900/70 p-1">
        <button
          type="button"
          className={clsx(
            'rounded px-3 py-1 text-sm transition',
            tab === 'video' ? 'bg-ink-800 text-ink-100 shadow-sm' : 'text-ink-400 hover:text-ink-200'
          )}
          onClick={() => onTabChange('video')}
        >
          <span className="inline-flex items-center gap-1.5">
            <Clapperboard size={14} className={tab === 'video' ? 'text-accent' : ''} />
            Video Desk
          </span>
        </button>
        <button
          type="button"
          className={clsx(
            'rounded px-3 py-1 text-sm transition',
            tab === 'image_meme'
              ? 'bg-ink-800 text-accent font-medium shadow-sm'
              : 'text-ink-400 hover:text-ink-200'
          )}
          onClick={() => onTabChange('image_meme')}
        >
          <span className="inline-flex items-center gap-1.5">
            <ImageIcon size={14} className={tab === 'image_meme' ? 'text-accent' : ''} />
            Meme & Image Studio
          </span>
        </button>
        <button
          type="button"
          className={clsx(
            'rounded px-3 py-1 text-sm transition',
            tab === 'library' ? 'bg-ink-800 text-ink-100 shadow-sm' : 'text-ink-400 hover:text-ink-200'
          )}
          onClick={() => onTabChange('library')}
        >
          <span className="inline-flex items-center gap-1.5">
            <BookMarked size={14} className={tab === 'library' ? 'text-accent' : ''} />
            Library
          </span>
        </button>
      </div>

      <div
        className={clsx(
          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm',
          ready
            ? 'border-ok/40 bg-ok-soft text-ok'
            : 'border-danger/40 bg-danger-soft text-danger'
        )}
        title={status.message}
      >
        <span
          className={clsx(
            'h-2 w-2 rounded-full',
            ready ? 'bg-ok animate-pulseDot' : 'bg-danger'
          )}
        />
        {ready ? status.message : 'Offline'}
      </div>

      <label className="hidden items-center gap-2 text-sm text-ink-300 md:flex">
        <span className="text-ink-500">Model</span>
        <select
          className="field max-w-[220px] py-1.5"
          value={settings.model || status.model || ''}
          onChange={(e) => onSwitchModel(e.target.value)}
          disabled={!models.length}
        >
          {!models.length && <option value="">No models found</option>}
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
              {m.size ? ` (${m.size})` : ''}
            </option>
          ))}
        </select>
      </label>

      {settings.backend === 'ollama' && (
        <button type="button" className="btn-ghost" onClick={onUnload} title="Unload model from VRAM">
          <Square size={14} />
          Unload Model
        </button>
      )}
      <button type="button" className="btn-ghost" onClick={onOpenSettings} title="Settings">
        <Settings2 size={14} />
      </button>
      <button type="button" className="btn-danger" onClick={onCloseApp} title="Close app">
        <Power size={14} />
        Close App
      </button>
    </header>
  )
}
