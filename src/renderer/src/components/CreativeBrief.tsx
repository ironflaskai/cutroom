import { useMemo, useState } from 'react'
import { ImagePlus, Loader2, Square, Wand2, X } from 'lucide-react'
import clsx from 'clsx'
import {
  PICTURE_ROLE_LABELS,
  VIDEO_ROLE_LABELS,
  VIDEO_TARGET_LABELS,
  GOOGLE_FLOW_MODE_LABELS,
  WORKFLOW_LABELS,
  labelReferences,
  type AspectRatio,
  type PictureRole,
  type GoogleFlowMode,
  type ReferenceAsset,
  type ReferenceRole,
  type VideoRole,
  type VideoPromptTarget,
  type Workflow
} from '@shared/types'

interface Props {
  brief: string
  target: VideoPromptTarget
  workflow: Workflow
  flowMode: GoogleFlowMode
  duration: number
  aspect: AspectRatio
  references: ReferenceAsset[]
  durationOptions: number[]
  aspectOptions: AspectRatio[]
  generating: boolean
  onBriefChange: (value: string) => void
  onTargetChange: (value: VideoPromptTarget) => void
  onWorkflowChange: (value: Workflow) => void
  onFlowModeChange: (value: GoogleFlowMode) => void
  onDurationChange: (value: number) => void
  onAspectChange: (value: AspectRatio) => void
  onClear: () => void
  onPickImages: () => void
  onDropFiles: (files: FileList) => void
  onUpdateReference: (id: string, patch: Partial<ReferenceAsset>) => void
  onRemoveReference: (id: string) => void
  onApplyCharacterIntoVideoRecipe: () => void
  onGenerate: () => void
  onStop: () => void
}

export default function CreativeBrief({
  brief,
  target,
  workflow,
  flowMode,
  duration,
  aspect,
  references,
  durationOptions,
  aspectOptions,
  generating,
  onBriefChange,
  onTargetChange,
  onWorkflowChange,
  onFlowModeChange,
  onDurationChange,
  onAspectChange,
  onClear,
  onPickImages,
  onDropFiles,
  onUpdateReference,
  onRemoveReference,
  onApplyCharacterIntoVideoRecipe,
  onGenerate,
  onStop
}: Props): React.JSX.Element {
  const [dragging, setDragging] = useState(false)

  const labeled = useMemo(() => labelReferences(references), [references])
  const labelById = useMemo(() => new Map(labeled.map((l) => [l.id, l])), [labeled])
  const hasPicture = references.some((r) => r.kind === 'picture')
  const hasVideo = references.some((r) => r.kind === 'video')

  return (
    <section className="flex min-h-0 flex-col border-r border-ink-800/80 bg-ink-900/40">
      <div className="flex items-center justify-between border-b border-ink-800/80 px-5 py-3">
        <h2 className="label text-accent">Creative Brief</h2>
        <button type="button" className="btn-ghost !py-1 text-xs" onClick={onClear}>
          Clear
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <textarea
          className="field min-h-[220px] resize-y font-mono text-[13px] leading-relaxed"
          value={brief}
          onChange={(e) => onBriefChange(e.target.value)}
          placeholder="Describe the shot list / rewrite intent…"
          spellCheck={false}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2">
            <span className="label">Prompt target</span>
            <select
              className="field"
              value={target}
              onChange={(e) => onTargetChange(e.target.value as VideoPromptTarget)}
            >
              {(Object.keys(VIDEO_TARGET_LABELS) as VideoPromptTarget[]).map((key) => (
                <option key={key} value={key}>{VIDEO_TARGET_LABELS[key]}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="label">{target === 'google_flow_omni' ? 'Flow input mode' : 'Workflow'}</span>
            <select
              className="field"
              value={target === 'google_flow_omni' ? flowMode : workflow}
              onChange={(e) => target === 'google_flow_omni'
                ? onFlowModeChange(e.target.value as GoogleFlowMode)
                : onWorkflowChange(e.target.value as Workflow)}
            >
              {target === 'google_flow_omni'
                ? (Object.keys(GOOGLE_FLOW_MODE_LABELS) as GoogleFlowMode[]).map((key) => (
                    <option key={key} value={key}>{GOOGLE_FLOW_MODE_LABELS[key]}</option>
                  ))
                : (Object.keys(WORKFLOW_LABELS) as Workflow[]).map((key) => (
                    <option key={key} value={key}>{WORKFLOW_LABELS[key]}</option>
                  ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="label">
              Duration {target === 'minimax_h3' ? '· seconds' : ''}
            </span>
            {target === 'google_flow_omni' ? (
              <select
                className="field"
                value={duration}
                onChange={(e) => onDurationChange(Number(e.target.value))}
              >
                {durationOptions.map((d) => (
                  <option key={d} value={d}>{d} sec</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                className="field"
                min={1}
                step={1}
                value={duration}
                onChange={(e) => {
                  const next = Number(e.target.value)
                  if (Number.isFinite(next) && next >= 1) onDurationChange(next)
                }}
                aria-label="MiniMax video duration in seconds"
              />
            )}
          </label>

          <label className="space-y-1.5">
            <span className="label">Aspect</span>
            <select
              className="field"
              value={aspect}
              onChange={(e) => onAspectChange(e.target.value as AspectRatio)}
            >
              {aspectOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="label">Visual references</h3>
            <span className="text-xs text-ink-500">
              {references.filter((r) => r.kind === 'picture').length} pic ·{' '}
              {references.filter((r) => r.kind === 'video').length} vid
            </span>
          </div>

          {target === 'minimax_h3' && hasPicture && hasVideo && (
            <div className="rounded-lg border border-accent/30 bg-accent-soft px-3 py-3 text-sm text-ink-200">
              <p className="font-medium text-accent">Picture ≠ Video (official H3)</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-300">
                Your still is <span className="font-mono text-accent">&lt;Picture 1&gt;</span> and
                your clip is <span className="font-mono text-accent">&lt;Video 1&gt;</span> — separate
                indexes. For “same video, my character,” use Full reference: appearance from the
                picture, motion/camera from the video.
              </p>
              <button
                type="button"
                className="btn-ghost mt-3 !py-1.5 text-xs"
                onClick={onApplyCharacterIntoVideoRecipe}
              >
                <Wand2 size={14} />
                Apply character → video recipe
              </button>
            </div>
          )}

          <div
            className={clsx(
              'rounded-lg border border-dashed px-4 py-8 text-center transition duration-200 ease-outExpo',
              dragging
                ? 'border-accent bg-accent-soft'
                : 'border-ink-700 bg-ink-950/50 hover:border-ink-600'
            )}
            onDragEnter={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              if (e.dataTransfer.files?.length) onDropFiles(e.dataTransfer.files)
            }}
          >
            <ImagePlus className="mx-auto mb-3 text-ink-400" size={28} />
            <p className="text-sm text-ink-200">Drag & drop reference images or videos</p>
            <p className="mt-1 text-xs text-ink-500">
              {target === 'google_flow_omni'
                ? 'Add the same assets you will attach in Flow'
                : 'Stills → Picture N · Clips → Video N (never mixed)'}
            </p>
            <button type="button" className="btn-ghost mt-4" onClick={onPickImages}>
              Add images or videos
            </button>
          </div>

          <ul className="space-y-3">
            {references.map((ref) => {
              const labeledRef = labelById.get(ref.id)
              const badge = labeledRef?.label.replace(/[<>]/g, '') ?? '?'
              const isVideo = ref.kind === 'video'
              return (
                <li
                  key={ref.id}
                  className="animate-fadeUp rounded-lg border border-ink-800 bg-ink-950/60 p-3"
                >
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-ink-800 bg-ink-900">
                      {isVideo ? (
                        <video src={ref.dataUrl} className="h-full w-full object-cover" muted />
                      ) : (
                        <img
                          src={ref.dataUrl}
                          alt={ref.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <span className="absolute bottom-1 left-1 rounded bg-ink-950/80 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                        {badge}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink-100">{ref.name}</p>
                          <p className="mt-0.5 text-[11px] uppercase tracking-wider text-ink-500">
                            {isVideo ? 'Video asset' : 'Picture asset'} · {labeledRef?.label}
                          </p>
                          {ref.describing ? (
                            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-accent">
                              <Loader2 size={12} className="animate-spin" />
                              Describing…
                            </p>
                          ) : ref.description ? (
                            <p className="mt-0.5 line-clamp-2 text-xs text-ink-400">
                              {ref.description}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="btn-ghost !px-2 !py-1"
                          onClick={() => onRemoveReference(ref.id)}
                          title="Remove"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <label className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-ink-500">
                            Role
                          </span>
                          <select
                            className="field !py-1.5"
                            value={ref.role}
                            onChange={(e) =>
                              onUpdateReference(ref.id, {
                                role: e.target.value as ReferenceRole
                              })
                            }
                          >
                            {isVideo
                              ? (Object.keys(VIDEO_ROLE_LABELS) as VideoRole[]).map((role) => (
                                  <option key={role} value={role}>
                                    {VIDEO_ROLE_LABELS[role]}
                                  </option>
                                ))
                              : (Object.keys(PICTURE_ROLE_LABELS) as PictureRole[]).map((role) => (
                                  <option key={role} value={role}>
                                    {PICTURE_ROLE_LABELS[role]}
                                  </option>
                                ))}
                          </select>
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-ink-500">
                            {isVideo ? 'Notes' : 'Character traits'}
                          </span>
                          <input
                            className="field !py-1.5"
                            value={ref.traits}
                            onChange={(e) =>
                              onUpdateReference(ref.id, { traits: e.target.value })
                            }
                            placeholder={
                              isVideo ? 'Optional motion notes…' : 'Optional traits…'
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-ink-800/80 px-5 py-3">
        {generating ? (
          <button type="button" className="btn-danger flex-1" onClick={onStop}>
            <Square size={14} />
            Stop generation
          </button>
        ) : (
          <button type="button" className="btn-primary flex-1" onClick={onGenerate}>
            Generate {target === 'google_flow_omni' ? 'Google Flow' : 'H3'} prompt
          </button>
        )}
      </div>
    </section>
  )
}
