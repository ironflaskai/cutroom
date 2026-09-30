import { useState } from 'react'
import { Check, Copy, Download, MessageCircle, Save, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import type { ImageEngineTarget, ImagePromptResult } from '@shared/types'
import { ENGINE_LABELS } from '@shared/types'

interface Props {
  result: ImagePromptResult | null
  streamingOutput: string
  generating: boolean
  statusNote: string
  targetEngine: ImageEngineTarget
  onCopy: (text: string, label: string) => void
  onSave: () => void
  onDownload: () => void
}

type OutputTab = 'primary' | 'all_engines' | 'negative' | 'social'

export default function ImageOutputPanel({
  result,
  streamingOutput,
  generating,
  statusNote,
  targetEngine,
  onCopy,
  onSave,
  onDownload
}: Props): React.JSX.Element {
  const [tab, setTab] = useState<OutputTab>('primary')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = (text: string, key: string, label: string): void => {
    onCopy(text, label)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const currentPrompt =
    result?.enginePrompts[targetEngine] || result?.mainPrompt || streamingOutput

  return (
    <section className="flex min-h-0 flex-col bg-ink-950/50">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800/80 px-5 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="label text-accent">Viral Prompt Package</h2>
            <span className="rounded bg-ink-800 px-1.5 py-0.5 text-[10px] font-mono text-ink-300">
              {ENGINE_LABELS[targetEngine]}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-400">
            Multi-engine prompts, speech bubbles & marketing copy
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost !py-1 text-xs"
            onClick={() => handleCopy(currentPrompt, 'main', 'Copied Main Prompt')}
            disabled={!currentPrompt}
          >
            {copiedKey === 'main' ? <Check size={13} className="text-ok" /> : <Copy size={13} />}
            Copy Prompt
          </button>
          {result?.socialCopy && (
            <button
              type="button"
              className="btn-ghost !py-1 text-xs"
              onClick={() =>
                handleCopy(result.socialCopy, 'social', 'Copied Twitter/Telegram Copy')
              }
            >
              {copiedKey === 'social' ? (
                <Check size={13} className="text-ok" />
              ) : (
                <MessageCircle size={13} className="text-accent" />
              )}
              Copy Tweet
            </button>
          )}
          <button
            type="button"
            className="btn-ghost !py-1 text-xs"
            onClick={onSave}
            disabled={!currentPrompt}
          >
            <Save size={13} />
            Save
          </button>
          <button
            type="button"
            className="btn-ghost !py-1 text-xs"
            onClick={onDownload}
            disabled={!currentPrompt}
          >
            <Download size={13} />
            .txt
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-ink-800/80 bg-ink-950/40 px-5">
        <button
          type="button"
          className={clsx(
            'border-b-2 px-3 py-2 text-xs font-medium transition',
            tab === 'primary'
              ? 'border-accent text-accent'
              : 'border-transparent text-ink-400 hover:text-ink-200'
          )}
          onClick={() => setTab('primary')}
        >
          {ENGINE_LABELS[targetEngine].split(' ')[0]} Prompt
        </button>
        <button
          type="button"
          className={clsx(
            'border-b-2 px-3 py-2 text-xs font-medium transition',
            tab === 'all_engines'
              ? 'border-accent text-accent'
              : 'border-transparent text-ink-400 hover:text-ink-200'
          )}
          onClick={() => setTab('all_engines')}
        >
          All Engine Variations
        </button>
        <button
          type="button"
          className={clsx(
            'border-b-2 px-3 py-2 text-xs font-medium transition',
            tab === 'social'
              ? 'border-accent text-accent'
              : 'border-transparent text-ink-400 hover:text-ink-200'
          )}
          onClick={() => setTab('social')}
        >
          Viral Marketing Copy (X/TG)
        </button>
        <button
          type="button"
          className={clsx(
            'border-b-2 px-3 py-2 text-xs font-medium transition',
            tab === 'negative'
              ? 'border-accent text-accent'
              : 'border-transparent text-ink-400 hover:text-ink-200'
          )}
          onClick={() => setTab('negative')}
        >
          Negative Prompt
        </button>
      </div>

      {/* Main Output Box */}
      <div className="min-h-0 flex-1 p-5">
        <div
          className={clsx(
            'panel relative h-full overflow-hidden rounded-xl',
            generating && 'animate-streamGlow'
          )}
        >
          {generating ? (
            <pre
              className="h-full overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-relaxed text-ink-200"
              aria-live="polite"
            >
              {streamingOutput || (
                <span className="text-ink-500">Contacting local AI model to craft prompt…</span>
              )}
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-accent align-middle" />
            </pre>
          ) : tab === 'primary' ? (
            <div className="flex h-full flex-col">
              <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-relaxed text-ink-200">
                {currentPrompt || (
                  <span className="text-ink-600">
                    Click "Instant Compile" or "AI Viral Generator" to produce your prompt package.
                  </span>
                )}
              </pre>
            </div>
          ) : tab === 'all_engines' ? (
            <div className="h-full space-y-3 overflow-y-auto p-4">
              {result ? (
                <>
                  <div className="rounded-lg border border-accent/60 bg-accent/10 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-bold text-accent">⚡ Grok (xAI / Twitter)</span>
                      <button
                        type="button"
                        className="btn-primary !px-2.5 !py-0.5 text-[11px]"
                        onClick={() =>
                          handleCopy(result.enginePrompts.grok, 'grok', 'Copied Grok prompt')
                        }
                      >
                        Copy Grok Prompt
                      </button>
                    </div>
                    <p className="font-mono text-xs text-ink-100 select-all">
                      {result.enginePrompts.grok}
                    </p>
                  </div>

                  <div className="rounded-lg border border-ink-800 bg-ink-950/60 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink-300">FLUX.1 Prompt</span>
                      <button
                        type="button"
                        className="btn-ghost !px-2 !py-0.5 text-[11px]"
                        onClick={() =>
                          handleCopy(result.enginePrompts.flux, 'flux', 'Copied FLUX prompt')
                        }
                      >
                        Copy FLUX
                      </button>
                    </div>
                    <p className="font-mono text-xs text-ink-300 select-all">
                      {result.enginePrompts.flux}
                    </p>
                  </div>

                  <div className="rounded-lg border border-ink-800 bg-ink-950/60 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-accent">
                        Midjourney v6.1 (--cref)
                      </span>
                      <button
                        type="button"
                        className="btn-ghost !px-2 !py-0.5 text-[11px]"
                        onClick={() =>
                          handleCopy(
                            result.enginePrompts.midjourney,
                            'mj',
                            'Copied Midjourney prompt'
                          )
                        }
                      >
                        Copy Midjourney
                      </button>
                    </div>
                    <p className="font-mono text-xs text-ink-300 select-all">
                      {result.enginePrompts.midjourney}
                    </p>
                  </div>

                  <div className="rounded-lg border border-ink-800 bg-ink-950/60 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-accent">
                        Ideogram 2.0 (Speech Bubbles & Text)
                      </span>
                      <button
                        type="button"
                        className="btn-ghost !px-2 !py-0.5 text-[11px]"
                        onClick={() =>
                          handleCopy(
                            result.enginePrompts.ideogram,
                            'ideo',
                            'Copied Ideogram prompt'
                          )
                        }
                      >
                        Copy Ideogram
                      </button>
                    </div>
                    <p className="font-mono text-xs text-ink-300 select-all">
                      {result.enginePrompts.ideogram}
                    </p>
                  </div>

                  <div className="rounded-lg border border-ink-800 bg-ink-950/60 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-accent">SDXL / SD3.5</span>
                      <button
                        type="button"
                        className="btn-ghost !px-2 !py-0.5 text-[11px]"
                        onClick={() =>
                          handleCopy(result.enginePrompts.sdxl, 'sdxl', 'Copied SDXL prompt')
                        }
                      >
                        Copy SDXL
                      </button>
                    </div>
                    <p className="font-mono text-xs text-ink-300 select-all">
                      {result.enginePrompts.sdxl}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-ink-500">Compile or generate a prompt first.</p>
              )}
            </div>
          ) : tab === 'social' ? (
            <div className="flex h-full flex-col p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Ready-to-Post Twitter/X & Telegram Marketing Copy
                </span>
                <button
                  type="button"
                  className="btn-ghost !px-3 !py-1 text-xs"
                  onClick={() =>
                    result &&
                    handleCopy(result.socialCopy, 'social', 'Copied Twitter/Telegram Copy')
                  }
                >
                  <Copy size={13} /> Copy Marketing Copy
                </button>
              </div>
              <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-ink-800 bg-ink-950 p-4 font-mono text-xs leading-relaxed text-ink-200">
                {result?.socialCopy || (
                  <span className="text-ink-600">
                    Marketing copy will appear here once compiled or generated.
                  </span>
                )}
              </pre>
            </div>
          ) : (
            <div className="flex h-full flex-col p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-warn">
                  Negative Prompt
                </span>
                <button
                  type="button"
                  className="btn-ghost !px-3 !py-1 text-xs"
                  onClick={() =>
                    result &&
                    handleCopy(result.negativePrompt, 'neg', 'Copied Negative Prompt')
                  }
                >
                  <Copy size={13} /> Copy Negative Prompt
                </button>
              </div>
              <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-ink-800 bg-ink-950 p-4 font-mono text-xs leading-relaxed text-ink-300">
                {result?.negativePrompt || (
                  <span className="text-ink-600">Negative prompt will appear here.</span>
                )}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between border-t border-ink-800/80 px-5 py-2 text-xs text-ink-500">
        <span>
          {statusNote ||
            `Target: ${ENGINE_LABELS[targetEngine]} · Presale $111k · $1M Bet @ cardibeewap.com`}
        </span>
        <span className="text-[11px] text-ink-600">Cutroom Meme Studio</span>
      </div>
    </section>
  )
}
