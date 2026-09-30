import { Copy, Download, Save } from 'lucide-react'
import clsx from 'clsx'
import type { GoogleFlowMode, VideoPromptTarget, Workflow } from '@shared/types'
import { footerHintForWorkflow, placeholderForGoogleFlow, placeholderForWorkflow } from '@shared/systemPrompt'

interface Props {
  output: string
  generating: boolean
  statusNote: string
  workflow: Workflow
  target: VideoPromptTarget
  flowMode: GoogleFlowMode
  onCopy: () => void
  onSave: () => void
  onDownload: () => void
}

export default function OutputPanel({
  output,
  generating,
  statusNote,
  workflow,
  target,
  flowMode,
  onCopy,
  onSave,
  onDownload
}: Props): React.JSX.Element {
  return (
    <section className="flex min-h-0 flex-col bg-ink-950/50">
      <div className="flex items-center justify-between border-b border-ink-800/80 px-5 py-3">
        <div>
          <h2 className="label text-accent">
            {target === 'google_flow_omni' ? 'Google Flow · Omni Flash 1.1' : 'MiniMax H3 Output'}
          </h2>
          <p className="mt-1 text-sm text-ink-400">Your finished prompt</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost" onClick={onCopy} disabled={!output}>
            <Copy size={14} />
            Copy
          </button>
          <button type="button" className="btn-ghost" onClick={onSave} disabled={!output}>
            <Save size={14} />
            Save to Library
          </button>
          <button type="button" className="btn-ghost" onClick={onDownload} disabled={!output}>
            <Download size={14} />
            Download (.txt)
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-5">
        <div
          className={clsx(
            'panel relative h-full overflow-hidden rounded-xl',
            generating && 'animate-streamGlow'
          )}
        >
          <pre
            className="h-full overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-relaxed text-ink-200"
            aria-live="polite"
          >
            {output || <span className="text-ink-600">{target === 'google_flow_omni' ? placeholderForGoogleFlow(flowMode) : placeholderForWorkflow(workflow)}</span>}
            {generating && (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-accent align-middle" />
            )}
          </pre>
        </div>
      </div>

      <div className="border-t border-ink-800/80 px-5 py-2 text-xs text-ink-500">
        {statusNote || (target === 'google_flow_omni'
          ? 'Paste-ready Flow prompt: natural language, @ingredient references, camera, action, lighting, and synchronized audio.'
          : footerHintForWorkflow(workflow))}
      </div>
    </section>
  )
}
