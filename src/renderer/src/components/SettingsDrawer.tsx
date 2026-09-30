import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { AppSettings, BackendKind, ModelInfo } from '@shared/types'

interface Props {
  open: boolean
  settings: AppSettings
  models: ModelInfo[]
  onClose: () => void
  onSave: (settings: AppSettings) => void
}

export default function SettingsDrawer({
  open,
  settings,
  models,
  onClose,
  onSave
}: Props): React.JSX.Element | null {
  const [draft, setDraft] = useState(settings)

  useEffect(() => {
    if (open) setDraft(settings)
  }, [open, settings])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink-950/55 backdrop-blur-[2px]">
      <button type="button" className="flex-1 cursor-default" aria-label="Close settings" onClick={onClose} />
      <aside className="panel flex h-full w-full max-w-md flex-col border-l border-ink-800 animate-fadeUp">
        <div className="flex items-center justify-between border-b border-ink-800 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink-100">Settings</h2>
            <p className="text-xs text-ink-500">Settings are stored locally on this machine</p>
          </div>
          <button type="button" className="btn-ghost !px-2" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <label className="block space-y-1.5">
            <span className="label">Backend</span>
            <select
              className="field"
              value={draft.backend}
              onChange={(e) => {
                const backend = e.target.value as BackendKind
                setDraft({
                  ...draft,
                  backend,
                  model: backend === 'ollama' ? 'qwen3.5:35b' : '',
                  visionModel: backend === 'ollama' ? 'qwen3.5:35b' : '',
                  autoDescribeImages: backend === 'ollama' ? true : draft.autoDescribeImages,
                  enableThinking: false
                })
              }}
            >
              <option value="ollama">Ollama (localhost:11434)</option>
              <option value="lmstudio">LM Studio / OpenAI-compatible</option>
            </select>
          </label>

          {draft.backend === 'ollama' && (
            <label className="block space-y-1.5">
              <span className="label">Ollama URL</span>
              <input className="field font-mono text-xs" value={draft.ollamaUrl} onChange={(e) => setDraft({ ...draft, ollamaUrl: e.target.value })} />
            </label>
          )}

          {draft.backend === 'lmstudio' && (
            <label className="block space-y-1.5">
              <span className="label">LM Studio URL</span>
              <input className="field font-mono text-xs" value={draft.lmstudioUrl} onChange={(e) => setDraft({ ...draft, lmstudioUrl: e.target.value })} />
            </label>
          )}

          <label className="block space-y-1.5">
            <span className="label">Chat model</span>
            {(
              <select className="field" value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })}>
                <option value="">Select model</option>
                {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            )}
          </label>

          <label className="block space-y-1.5">
            <span className="label">Vision model (optional)</span>
            {<select
              className="field"
              value={draft.visionModel}
              onChange={(e) => setDraft({ ...draft, visionModel: e.target.value })}
            >
              <option value="">Same as chat model</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>}
          </label>

          <label className="block space-y-1.5">
            <span className="label">Temperature · {draft.temperature.toFixed(2)}</span>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.05}
              value={draft.temperature}
              onChange={(e) => setDraft({ ...draft, temperature: Number(e.target.value) })}
              className="w-full accent-[oklch(0.78_0.145_55)]"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="label">Max tokens</span>
            <input
              type="number"
              className="field"
              min={512}
              max={16384}
              value={draft.maxTokens}
              onChange={(e) => setDraft({ ...draft, maxTokens: Number(e.target.value) })}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="label">Context window (num_ctx)</span>
            <input
              type="number"
              className="field"
              min={2048}
              max={32768}
              step={1024}
              value={draft.numCtx ?? 4096}
              onChange={(e) => setDraft({ ...draft, numCtx: Number(e.target.value) })}
            />
            <p className="text-xs text-ink-500">
              Keep at 4096 on RTX A4500 (20GB). Large context is the usual OOM cause with 27B.
            </p>
          </label>

          <label className="flex items-center gap-3 rounded-md border border-ink-800 bg-ink-950/50 px-3 py-3">
            <input
              type="checkbox"
              checked={Boolean(draft.enableThinking)}
              onChange={(e) => setDraft({ ...draft, enableThinking: e.target.checked })}
              className="accent-[oklch(0.78_0.145_55)]"
            />
            <span className="text-sm text-ink-200">
              Enable Qwen thinking (slower; leave OFF for prompt writing)
            </span>
          </label>

          <label className="block space-y-1.5">
            <span className="label">GPU VRAM (GB)</span>
            <input
              type="number"
              className="field"
              min={4}
              max={128}
              value={draft.vramGb}
              onChange={(e) => setDraft({ ...draft, vramGb: Number(e.target.value) })}
            />
            <p className="text-xs text-ink-500">
              Used for 24 GB guidance — recommend Q4_K_M / Q5_K_M for 27B Qwen variants.
            </p>
          </label>

          <label className="flex items-center gap-3 rounded-md border border-ink-800 bg-ink-950/50 px-3 py-3">
            <input
              type="checkbox"
              checked={draft.autoDescribeImages}
              onChange={(e) => setDraft({ ...draft, autoDescribeImages: e.target.checked })}
              className="accent-[oklch(0.78_0.145_55)]"
            />
            <span className="text-sm text-ink-200">
              Auto-describe references with the selected vision model
            </span>
          </label>
        </div>

        <div className="flex gap-2 border-t border-ink-800 px-5 py-4">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={() => {
              onSave(draft)
              onClose()
            }}
          >
            Save settings
          </button>
        </div>
      </aside>
    </div>
  )
}
