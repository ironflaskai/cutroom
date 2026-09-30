import { useMemo, useState } from 'react'
import { Clapperboard, Copy, Image as ImageIcon, Search, Trash2 } from 'lucide-react'
import type { LibraryEntry } from '@shared/types'
import { ENGINE_LABELS, GOOGLE_FLOW_MODE_LABELS, VIDEO_TARGET_LABELS, WORKFLOW_LABELS } from '@shared/types'
import clsx from 'clsx'

interface Props {
  entries: LibraryEntry[]
  onOpen: (entry: LibraryEntry) => void
  onCopy: (entry: LibraryEntry) => void
  onDelete: (id: string) => void
}

type FilterKind = 'all' | 'video' | 'image_meme'

export default function LibraryView({
  entries,
  onOpen,
  onCopy,
  onDelete
}: Props): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKind>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((e) => {
      const isImage = e.entryType === 'image_meme'
      if (filter === 'video' && isImage) return false
      if (filter === 'image_meme' && !isImage) return false

      if (!q) return true
      return (
        e.title.toLowerCase().includes(q) ||
        e.output.toLowerCase().includes(q) ||
        (e.brief && e.brief.toLowerCase().includes(q)) ||
        (e.model && e.model.toLowerCase().includes(q))
      )
    })
  }, [entries, query, filter])

  const videoCount = entries.filter((e) => e.entryType !== 'image_meme').length
  const imageCount = entries.filter((e) => e.entryType === 'image_meme').length

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink-100">Prompt Library</h2>
          <p className="mt-1 text-sm text-ink-400">
            Local collection of saved Video and Meme/Image prompts — stored only on this machine.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-md border border-ink-800 bg-ink-950 p-1">
            <button
              type="button"
              className={clsx(
                'rounded px-2.5 py-1 text-xs transition',
                filter === 'all'
                  ? 'bg-ink-800 text-ink-100 font-medium'
                  : 'text-ink-400 hover:text-ink-200'
              )}
              onClick={() => setFilter('all')}
            >
              All ({entries.length})
            </button>
            <button
              type="button"
              className={clsx(
                'rounded px-2.5 py-1 text-xs transition',
                filter === 'video'
                  ? 'bg-ink-800 text-ink-100 font-medium'
                  : 'text-ink-400 hover:text-ink-200'
              )}
              onClick={() => setFilter('video')}
            >
              <span className="inline-flex items-center gap-1">
                <Clapperboard size={12} /> Video ({videoCount})
              </span>
            </button>
            <button
              type="button"
              className={clsx(
                'rounded px-2.5 py-1 text-xs transition',
                filter === 'image_meme'
                  ? 'bg-ink-800 text-accent font-medium'
                  : 'text-ink-400 hover:text-ink-200'
              )}
              onClick={() => setFilter('image_meme')}
            >
              <span className="inline-flex items-center gap-1">
                <ImageIcon size={12} /> Meme & Image ({imageCount})
              </span>
            </button>
          </div>

          <label className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
            />
            <input
              className="field pl-9 !py-1.5 text-xs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prompts…"
            />
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel rounded-xl px-6 py-16 text-center">
          <p className="text-ink-200">No matching prompts found</p>
          <p className="mt-2 text-sm text-ink-500">
            Generate a prompt in Video Desk or Meme Studio, then click Save to Library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((entry) => {
            const isImage = entry.entryType === 'image_meme'
            return (
              <article
                key={entry.id}
                className="panel animate-fadeUp flex flex-col overflow-hidden rounded-xl border border-ink-800/80"
              >
                <div className="grid grid-cols-3 gap-0.5 bg-ink-950">
                  {entry.thumbnails && entry.thumbnails.length > 0 ? (
                    entry.thumbnails.slice(0, 3).map((t) => (
                      <img
                        key={t.id}
                        src={t.dataUrl}
                        alt={t.name}
                        className="aspect-video h-20 w-full object-cover"
                      />
                    ))
                  ) : (
                    <div className="col-span-3 flex h-20 items-center justify-center text-xs text-ink-600">
                      {isImage ? '🐝 Cardi Bee Meme' : 'No reference thumbnails'}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span
                        className={clsx(
                          'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                          isImage
                            ? 'bg-accent/20 text-accent'
                            : 'bg-blue-500/20 text-blue-400'
                        )}
                      >
                        {isImage
                          ? 'Meme / Image'
                          : entry.videoTarget === 'google_flow_omni'
                            ? 'Google Flow'
                            : 'H3 Video'}
                      </span>
                      <span className="text-[11px] text-ink-500">{entry.aspect}</span>
                    </div>
                    <h3 className="line-clamp-2 text-sm font-semibold text-ink-100">
                      {entry.title}
                    </h3>
                    <p className="mt-1 text-xs text-ink-400">
                      {isImage
                        ? entry.engine
                          ? ENGINE_LABELS[entry.engine]
                          : 'Cardi Bee Viral Meme'
                        : entry.videoTarget === 'google_flow_omni'
                          ? `${VIDEO_TARGET_LABELS.google_flow_omni} · ${GOOGLE_FLOW_MODE_LABELS[entry.flowMode || 'ingredients']}`
                          : entry.workflow
                          ? WORKFLOW_LABELS[entry.workflow]
                          : 'H3 Video'}{' '}
                      {entry.duration ? `· ${entry.duration}s` : ''}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-600">
                      {new Date(entry.createdAt).toLocaleString()} · {entry.model || 'instant compiler'}
                    </p>
                  </div>

                  <pre className="line-clamp-4 overflow-hidden font-mono text-[11px] leading-relaxed text-ink-300">
                    {entry.output}
                  </pre>

                  <div className="mt-auto flex gap-2 pt-2">
                    <button
                      type="button"
                      className="btn-primary flex-1 !py-1 text-xs"
                      onClick={() => onOpen(entry)}
                    >
                      Open in Studio
                    </button>
                    <button
                      type="button"
                      className="btn-ghost !px-2.5 !py-1"
                      onClick={() => onCopy(entry)}
                      title="Copy Prompt"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn-danger !px-2 !py-1"
                      onClick={() => onDelete(entry.id)}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

