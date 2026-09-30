import { useState } from 'react'
import {
  BrainCircuit,
  Dice5,
  ImagePlus,
  Loader2,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Square,
  Upload,
  User,
  Wand2,
  X
} from 'lucide-react'
import clsx from 'clsx'
import {
  ASPECT_OPTIONS,
  ENGINE_LABELS,
  MEME_STYLE_LABELS,
  TEXT_MODE_LABELS,
  type AspectRatio,
  type BrainstormIdea,
  type ImageCharacterSlot,
  type ImageEngineTarget,
  type ImagePromptRequest,
  type MemePresetId,
  type MemeStylePreset,
  type ReferenceAsset,
  type TextOverlayMode
} from '@shared/types'
import { MEME_PRESETS, type MemePresetDefinition } from '@shared/imagePromptSystem'

interface Props {
  request: ImagePromptRequest
  generating: boolean
  statusNote: string
  onChange: (patch: Partial<ImagePromptRequest>) => void
  onPickCharacterImage: (slot: 'man' | 'woman') => void
  onDropCharacterFile: (slot: 'man' | 'woman', file: File) => void
  onRemoveCharacterImage: (slot: 'man' | 'woman') => void
  onSelectPreset: (preset: MemePresetDefinition) => void
  onBrainstormIdeas: (topic: string) => Promise<BrainstormIdea[]>
  onCompileInstant: () => void
  onGenerateAI: () => void
  onStop: () => void
}

export default function ImagePromptStudio({
  request,
  generating,
  statusNote,
  onChange,
  onPickCharacterImage,
  onDropCharacterFile,
  onRemoveCharacterImage,
  onSelectPreset,
  onBrainstormIdeas,
  onCompileInstant,
  onGenerateAI,
  onStop
}: Props): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'scene' | 'characters' | 'text' | 'preview'>('scene')
  const [brainstormOpen, setBrainstormOpen] = useState(false)
  const [brainstormTopic, setBrainstormTopic] = useState('')
  const [brainstormLoading, setBrainstormLoading] = useState(false)
  const [brainstormIdeas, setBrainstormIdeas] = useState<BrainstormIdea[]>([])

  const currentPreset =
    MEME_PRESETS.find((p) => p.id === request.presetId) || MEME_PRESETS[0]

  const updateMan = (patch: Partial<ImageCharacterSlot>): void => {
    onChange({ manCharacter: { ...request.manCharacter, ...patch } })
  }

  const updateWoman = (patch: Partial<ImageCharacterSlot>): void => {
    onChange({ womanCharacter: { ...request.womanCharacter, ...patch } })
  }

  const handleRunBrainstorm = async (topic: string): Promise<void> => {
    setBrainstormLoading(true)
    try {
      const ideas = await onBrainstormIdeas(topic)
      setBrainstormIdeas(ideas)
    } finally {
      setBrainstormLoading(false)
    }
  }

  const handleApplyIdea = (idea: BrainstormIdea): void => {
    onChange({
      title: idea.title,
      sceneDescription: idea.scene,
      manCharacter: {
        ...request.manCharacter,
        outfit: idea.manOutfit
      },
      womanCharacter: {
        ...request.womanCharacter,
        outfit: idea.womanOutfit
      },
      backgroundPeople: idea.background,
      speechBubbleText: idea.speechBubble,
      speechBubbleSpeaker: idea.speechSpeaker,
      topMemeText: idea.topText,
      bottomMemeText: idea.bottomText,
      tabloidHeadline: idea.headline,
      style: idea.style
    })
    setBrainstormOpen(false)
  }

  const handleRandomSpin = async (): Promise<void> => {
    setBrainstormLoading(true)
    try {
      const ideas = await onBrainstormIdeas('')
      if (ideas.length > 0) {
        const randomIdea = ideas[Math.floor(Math.random() * ideas.length)]
        handleApplyIdea(randomIdea)
      }
    } finally {
      setBrainstormLoading(false)
    }
  }

  return (
    <section className="flex min-h-0 flex-col border-r border-ink-800/80 bg-ink-900/40">
      {/* Campaign Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800/80 bg-gradient-to-r from-accent/15 via-ink-950/60 to-ink-950/40 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-lg">
            🐝
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-ink-100">
                Cardi Bee Viral Meme Engine
              </h2>
              <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                Presale $111k · $1M Bet
              </span>
            </div>
            <p className="text-xs text-ink-400">
              Official marketing prompt creator for{' '}
              <span className="font-mono text-accent">cardibeewap.com</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-primary !bg-accent/20 !text-accent border border-accent/40 hover:!bg-accent/30 !py-1 text-xs"
            onClick={() => {
              setBrainstormOpen(true)
              if (brainstormIdeas.length === 0) {
                void handleRunBrainstorm('')
              }
            }}
            title="Brainstorm 5 new viral meme scenarios with Qwen"
          >
            <BrainCircuit size={13} className="text-accent" />
            Brainstorm with Qwen
          </button>
          <button
            type="button"
            className="btn-ghost !py-1 text-xs"
            onClick={() => void handleRandomSpin()}
            title="Spin a fresh random viral scenario with Qwen"
            disabled={brainstormLoading}
          >
            {brainstormLoading ? (
              <Loader2 size={13} className="animate-spin text-accent" />
            ) : (
              <Dice5 size={13} className="text-accent" />
            )}
            Random Spin
          </button>
          <button
            type="button"
            className="btn-ghost !py-1 text-xs"
            onClick={() => onSelectPreset(currentPreset)}
            title="Reset current preset defaults"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </div>

      {/* Preset Selector Carousel */}
      <div className="border-b border-ink-800/80 bg-ink-950/70 px-4 py-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="label text-accent">Viral Marketing Presets</span>
          <span className="text-[11px] text-ink-500">Pick a concept or customize</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {MEME_PRESETS.map((preset) => {
            const isSelected = request.presetId === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                className={clsx(
                  'flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-xs transition duration-200',
                  isSelected
                    ? 'border-accent bg-accent/15 text-accent shadow-sm'
                    : 'border-ink-800 bg-ink-900/60 text-ink-300 hover:border-ink-700 hover:text-ink-100'
                )}
                onClick={() => onSelectPreset(preset)}
              >
                <span className="text-base">{preset.icon}</span>
                <div>
                  <p className="font-medium leading-tight">{preset.name}</p>
                  <p className="line-clamp-1 text-[10px] opacity-70">{preset.subtitle}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-ink-800/80 bg-ink-950/40 px-5">
        <button
          type="button"
          className={clsx(
            'border-b-2 px-3 py-2 text-xs font-medium transition',
            activeTab === 'scene'
              ? 'border-accent text-accent'
              : 'border-transparent text-ink-400 hover:text-ink-200'
          )}
          onClick={() => setActiveTab('scene')}
        >
          1. Scene & Style
        </button>
        <button
          type="button"
          className={clsx(
            'border-b-2 px-3 py-2 text-xs font-medium transition',
            activeTab === 'characters'
              ? 'border-accent text-accent'
              : 'border-transparent text-ink-400 hover:text-ink-200'
          )}
          onClick={() => setActiveTab('characters')}
        >
          2. Characters (@image1 / @image2)
        </button>
        <button
          type="button"
          className={clsx(
            'border-b-2 px-3 py-2 text-xs font-medium transition',
            activeTab === 'text'
              ? 'border-accent text-accent'
              : 'border-transparent text-ink-400 hover:text-ink-200'
          )}
          onClick={() => setActiveTab('text')}
        >
          3. Speech Bubbles & Meme Text
        </button>
        <button
          type="button"
          className={clsx(
            'border-b-2 px-3 py-2 text-xs font-medium transition',
            activeTab === 'preview'
              ? 'border-accent text-accent'
              : 'border-transparent text-ink-400 hover:text-ink-200'
          )}
          onClick={() => setActiveTab('preview')}
        >
          4. Live Mockup Preview
        </button>
      </div>

      {/* Main Content Area */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {activeTab === 'scene' && (
          <div className="space-y-4">
            <div>
              <label className="space-y-1.5">
                <span className="label">Meme Title / Concept</span>
                <input
                  className="field"
                  value={request.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  placeholder="e.g. Cardi Bee Diner Table Rumor..."
                />
              </label>
            </div>

            <div>
              <label className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="label">Scene Narrative & Environment</span>
                  <span className="text-[11px] text-ink-500">
                    Describe setting, action & camera angle
                  </span>
                </div>
                <textarea
                  className="field min-h-[140px] resize-y font-mono text-[13px] leading-relaxed"
                  value={request.sceneDescription}
                  onChange={(e) => onChange({ sceneDescription: e.target.value })}
                  placeholder="Describe where they are and what is happening in the scene..."
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="space-y-1.5">
                <span className="label">Target Image Generator</span>
                <select
                  className="field"
                  value={request.engine}
                  onChange={(e) => onChange({ engine: e.target.value as ImageEngineTarget })}
                >
                  {(Object.keys(ENGINE_LABELS) as ImageEngineTarget[]).map((eng) => (
                    <option key={eng} value={eng}>
                      {ENGINE_LABELS[eng]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="label">Visual Aesthetic Style</span>
                <select
                  className="field"
                  value={request.style}
                  onChange={(e) => onChange({ style: e.target.value as MemeStylePreset })}
                >
                  {(Object.keys(MEME_STYLE_LABELS) as MemeStylePreset[]).map((st) => (
                    <option key={st} value={st}>
                      {MEME_STYLE_LABELS[st]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="label">Aspect Ratio</span>
                <select
                  className="field"
                  value={request.aspect}
                  onChange={(e) => onChange({ aspect: e.target.value as AspectRatio })}
                >
                  {ASPECT_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a} {a === '16:9' ? '(X/Twitter)' : a === '9:16' ? '(Story/TikTok)' : '(Square)'}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="label">Background People / Crowd Reaction</span>
                  <span className="text-[11px] text-ink-500">
                    Who is in the background and what are they doing?
                  </span>
                </div>
                <textarea
                  className="field min-h-[70px] resize-y text-xs leading-relaxed"
                  value={request.backgroundPeople}
                  onChange={(e) => onChange({ backgroundPeople: e.target.value })}
                  placeholder="e.g. Neighboring patrons whispering, leaning over booth, pointing, gossiping..."
                />
              </label>
            </div>

            <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-xs text-ink-200">
              <p className="font-semibold text-accent">💡 Marketing Tip for Cardi Bee:</p>
              <p className="mt-1 text-ink-300">
                Memes with subtle background gossip ("I'm sure she gets pregnant soon!") combined with
                the <span className="font-mono text-accent">$1,000,000 bet</span> hook have the highest
                click-through rate for presale conversions.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-ink-800 bg-ink-950/60 p-3">
              <p className="text-xs font-semibold text-accent">
                🔒 Strict Character Identity Locking
              </p>
              <p className="mt-1 text-xs text-ink-400">
                Upload your man character as <span className="font-mono text-accent">@image1</span> and
                your woman character (Cardi Bee) as{' '}
                <span className="font-mono text-accent">@image2</span>. The prompts will enforce exact
                same facial geometry, features, and physique while adapting their outfits to any
                scenario.
              </p>
            </div>

            {/* Man Character @image1 */}
            <div className="rounded-xl border border-ink-800 bg-ink-950/80 p-4">
              <div className="flex items-center justify-between gap-2 border-b border-ink-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/20 text-xs font-bold text-blue-400">
                    @1
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink-100">
                      Man Character Reference (@image1)
                    </h3>
                    <p className="text-[11px] text-ink-500">
                      Primary Male Subject · Face & Body Lock
                    </p>
                  </div>
                </div>
                {request.manCharacter.asset ? (
                  <button
                    type="button"
                    className="btn-ghost !px-2 !py-1 text-xs"
                    onClick={() => onRemoveCharacterImage('man')}
                  >
                    <X size={13} /> Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-ghost !py-1 text-xs"
                    onClick={() => onPickCharacterImage('man')}
                  >
                    <Upload size={13} /> Upload @image1
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex flex-col items-center justify-center">
                  {request.manCharacter.asset ? (
                    <div className="relative h-32 w-full overflow-hidden rounded-lg border border-ink-700 bg-ink-900">
                      <img
                        src={request.manCharacter.asset.dataUrl}
                        alt="Man Reference"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-ink-950/90 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                        @image1
                      </span>
                    </div>
                  ) : (
                    <div
                      className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-ink-700 bg-ink-900/40 p-2 text-center transition hover:border-ink-500"
                      onClick={() => onPickCharacterImage('man')}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (e.dataTransfer.files?.[0]) {
                          onDropCharacterFile('man', e.dataTransfer.files[0])
                        }
                      }}
                    >
                      <User size={24} className="mb-1 text-ink-500" />
                      <p className="text-xs text-ink-300">Drop @image1 still here</p>
                      <p className="text-[10px] text-ink-600">JPG, PNG, WebP</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-ink-300">
                      Man Outfit in This Scene:
                    </span>
                    <input
                      className="field !py-1.5 text-xs"
                      value={request.manCharacter.outfit}
                      onChange={(e) => updateMan({ outfit: e.target.value })}
                      placeholder="e.g. Designer bomber jacket, gold chain, sunglasses..."
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-ink-300">
                      Face/Body Traits & Geometry to Lock:
                    </span>
                    <input
                      className="field !py-1.5 text-xs"
                      value={request.manCharacter.traits}
                      onChange={(e) => updateMan({ traits: e.target.value })}
                      placeholder="e.g. Defined jawline, fade haircut, athletic build, exact face..."
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-ink-300">
                      Expression & Pose:
                    </span>
                    <input
                      className="field !py-1.5 text-xs"
                      value={request.manCharacter.expression}
                      onChange={(e) => updateMan({ expression: e.target.value })}
                      placeholder="e.g. Eating burger, confident smile, engaged with partner..."
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Woman Character @image2 */}
            <div className="rounded-xl border border-ink-800 bg-ink-950/80 p-4">
              <div className="flex items-center justify-between gap-2 border-b border-ink-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-pink-500/20 text-xs font-bold text-pink-400">
                    @2
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink-100">
                      Woman Character Reference (@image2 / Cardi Bee)
                    </h3>
                    <p className="text-[11px] text-ink-500">
                      Primary Female Subject · Face & Body Lock
                    </p>
                  </div>
                </div>
                {request.womanCharacter.asset ? (
                  <button
                    type="button"
                    className="btn-ghost !px-2 !py-1 text-xs"
                    onClick={() => onRemoveCharacterImage('woman')}
                  >
                    <X size={13} /> Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-ghost !py-1 text-xs"
                    onClick={() => onPickCharacterImage('woman')}
                  >
                    <Upload size={13} /> Upload @image2
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex flex-col items-center justify-center">
                  {request.womanCharacter.asset ? (
                    <div className="relative h-32 w-full overflow-hidden rounded-lg border border-ink-700 bg-ink-900">
                      <img
                        src={request.womanCharacter.asset.dataUrl}
                        alt="Woman Reference"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-ink-950/90 px-1.5 py-0.5 font-mono text-[10px] text-pink-400">
                        @image2
                      </span>
                    </div>
                  ) : (
                    <div
                      className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-ink-700 bg-ink-900/40 p-2 text-center transition hover:border-ink-500"
                      onClick={() => onPickCharacterImage('woman')}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (e.dataTransfer.files?.[0]) {
                          onDropCharacterFile('woman', e.dataTransfer.files[0])
                        }
                      }}
                    >
                      <User size={24} className="mb-1 text-ink-500" />
                      <p className="text-xs text-ink-300">Drop @image2 still here</p>
                      <p className="text-[10px] text-ink-600">JPG, PNG, WebP</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-ink-300">
                      Woman Outfit in This Scene:
                    </span>
                    <input
                      className="field !py-1.5 text-xs"
                      value={request.womanCharacter.outfit}
                      onChange={(e) => updateWoman({ outfit: e.target.value })}
                      placeholder="e.g. Rhinestone crop top, high-waisted denim, oversized hoops..."
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-ink-300">
                      Face/Body Traits & Geometry to Lock:
                    </span>
                    <input
                      className="field !py-1.5 text-xs"
                      value={request.womanCharacter.traits}
                      onChange={(e) => updateWoman({ traits: e.target.value })}
                      placeholder="e.g. Exact face, signature eyes/lips, curvy silhouette, long dark hair..."
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-medium text-ink-300">
                      Expression & Pose:
                    </span>
                    <input
                      className="field !py-1.5 text-xs"
                      value={request.womanCharacter.expression}
                      onChange={(e) => updateWoman({ expression: e.target.value })}
                      placeholder="e.g. Radiant knowing smile, drinking milkshake, looking gorgeous..."
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="label">Meme Text Format</span>
              <select
                className="field"
                value={request.textMode}
                onChange={(e) => onChange({ textMode: e.target.value as TextOverlayMode })}
              >
                {(Object.keys(TEXT_MODE_LABELS) as TextOverlayMode[]).map((mode) => (
                  <option key={mode} value={mode}>
                    {TEXT_MODE_LABELS[mode]}
                  </option>
                ))}
              </select>
            </label>

            {request.textMode === 'speech_bubble' && (
              <div className="rounded-xl border border-ink-800 bg-ink-950/80 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-accent" />
                  <h4 className="text-sm font-semibold text-ink-100">
                    Cartoon Speech / Thought Bubble
                  </h4>
                </div>
                <label className="block space-y-1">
                  <span className="text-xs text-ink-300">Dialogue inside speech bubble:</span>
                  <input
                    className="field font-mono text-sm"
                    value={request.speechBubbleText}
                    onChange={(e) => onChange({ speechBubbleText: e.target.value })}
                    placeholder="e.g. I'm sure she gets pregnant soon! Did you bet on Cardi Bee?!"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-ink-300">Who is speaking the bubble?</span>
                  <input
                    className="field text-xs"
                    value={request.speechBubbleSpeaker}
                    onChange={(e) => onChange({ speechBubbleSpeaker: e.target.value })}
                    placeholder="e.g. Nosy diner patron in booth behind them"
                  />
                </label>
              </div>
            )}

            {request.textMode === 'top_bottom_meme' && (
              <div className="rounded-xl border border-ink-800 bg-ink-950/80 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-ink-100">
                  Classic Top & Bottom Meme Text (Impact Font)
                </h4>
                <label className="block space-y-1">
                  <span className="text-xs text-ink-300">Top Text:</span>
                  <input
                    className="field uppercase font-bold text-sm"
                    value={request.topMemeText}
                    onChange={(e) => onChange({ topMemeText: e.target.value })}
                    placeholder="WHEN YOU GO ON A CASUAL DINER DATE"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-ink-300">Bottom Text:</span>
                  <input
                    className="field uppercase font-bold text-sm"
                    value={request.bottomMemeText}
                    onChange={(e) => onChange({ bottomMemeText: e.target.value })}
                    placeholder="BUT EVERYONE IN THE ROOM BET $1M IF SHE GETS PREGNANT"
                  />
                </label>
              </div>
            )}

            {request.textMode === 'tabloid_headline' && (
              <div className="rounded-xl border border-ink-800 bg-ink-950/80 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-ink-100">
                  Breaking News / Tabloid Headline Banner
                </h4>
                <label className="block space-y-1">
                  <span className="text-xs text-ink-300">Tabloid Headline text:</span>
                  <input
                    className="field font-bold uppercase text-sm"
                    value={request.tabloidHeadline}
                    onChange={(e) => onChange({ tabloidHeadline: e.target.value })}
                    placeholder="SPOTTED: CARDI BEE & DATE AMID $1,000,000 PREGNANCY BET SCANDAL"
                  />
                </label>
              </div>
            )}

            {request.textMode === 'none' && (
              <div className="rounded-xl border border-ink-800 bg-ink-950/40 p-4 text-center text-xs text-ink-400">
                No visible text in the image. Pure visual storytelling and photorealism.
              </div>
            )}

            {/* Campaign Context Settings */}
            <div className="rounded-xl border border-ink-800 bg-ink-950/60 p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Memecoin Campaign Parameters
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <label className="space-y-1">
                  <span className="text-[10px] uppercase text-ink-500">Token</span>
                  <input
                    className="field !py-1 text-xs"
                    value={request.campaignContext.tokenName}
                    onChange={(e) =>
                      onChange({
                        campaignContext: { ...request.campaignContext, tokenName: e.target.value }
                      })
                    }
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] uppercase text-ink-500">Presale Goal</span>
                  <input
                    className="field !py-1 text-xs"
                    value={request.campaignContext.presaleGoal}
                    onChange={(e) =>
                      onChange({
                        campaignContext: { ...request.campaignContext, presaleGoal: e.target.value }
                      })
                    }
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] uppercase text-ink-500">Bet Pool</span>
                  <input
                    className="field !py-1 text-xs"
                    value={request.campaignContext.betPool}
                    onChange={(e) =>
                      onChange({
                        campaignContext: { ...request.campaignContext, betPool: e.target.value }
                      })
                    }
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] uppercase text-ink-500">Website URL</span>
                  <input
                    className="field !py-1 text-xs font-mono text-accent"
                    value={request.campaignContext.website}
                    onChange={(e) =>
                      onChange({
                        campaignContext: { ...request.campaignContext, website: e.target.value }
                      })
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="label text-accent">Live Meme Mockup Card</span>
              <span className="text-xs text-ink-500">Visual composition simulator</span>
            </div>

            {/* Visual Simulator Canvas */}
            <div className="relative mx-auto flex aspect-video max-w-lg flex-col justify-between overflow-hidden rounded-xl border-2 border-ink-700 bg-gradient-to-br from-amber-950/40 via-ink-950 to-purple-950/40 p-4 shadow-2xl">
              {/* Background Reference Images or Graphic Placeholders */}
              <div className="absolute inset-0 -z-10 grid grid-cols-2 opacity-30">
                {request.manCharacter.asset ? (
                  <img
                    src={request.manCharacter.asset.dataUrl}
                    alt="Man reference"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center border-r border-ink-800 text-xs text-ink-600">
                    Man @image1
                  </div>
                )}
                {request.womanCharacter.asset ? (
                  <img
                    src={request.womanCharacter.asset.dataUrl}
                    alt="Woman reference"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-ink-600">
                    Woman @image2 (Cardi Bee)
                  </div>
                )}
              </div>

              {/* Top Meme Text */}
              {request.textMode === 'top_bottom_meme' && request.topMemeText && (
                <div className="text-center font-black uppercase tracking-wide text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)] [text-shadow:_2px_2px_0_#000,_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000]">
                  <p className="text-base sm:text-lg">{request.topMemeText}</p>
                </div>
              )}

              {/* Speech Bubble Simulation */}
              {request.textMode === 'speech_bubble' && request.speechBubbleText && (
                <div className="relative z-10 my-auto ml-auto max-w-[70%] animate-fadeUp rounded-2xl border-2 border-black bg-white p-3 text-black shadow-xl">
                  <div className="flex items-center gap-1.5 border-b border-gray-200 pb-1 text-[10px] font-bold uppercase text-gray-500">
                    <span>💬 {request.speechBubbleSpeaker || 'Whispering Patron'}:</span>
                  </div>
                  <p className="mt-1 text-xs font-bold leading-tight sm:text-sm">
                    "{request.speechBubbleText}"
                  </p>
                  {/* Bubble Pointer Tail */}
                  <div className="absolute -bottom-2 left-6 h-4 w-4 rotate-45 border-b-2 border-r-2 border-black bg-white" />
                </div>
              )}

              {/* Tabloid Headline */}
              {request.textMode === 'tabloid_headline' && request.tabloidHeadline && (
                <div className="z-10 mt-auto rounded-lg border border-red-600 bg-red-600/90 px-3 py-1.5 text-center text-xs font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-sm">
                  🔥 {request.tabloidHeadline}
                </div>
              )}

              {/* Bottom Meme Text */}
              {request.textMode === 'top_bottom_meme' && request.bottomMemeText && (
                <div className="mt-auto text-center font-black uppercase tracking-wide text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)] [text-shadow:_2px_2px_0_#000,_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000]">
                  <p className="text-base sm:text-lg">{request.bottomMemeText}</p>
                </div>
              )}

              {/* Watermark badge */}
              <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[9px] font-mono text-accent">
                {request.campaignContext.website}
              </div>
            </div>

            <div className="rounded-lg border border-ink-800 bg-ink-950/60 p-3 text-xs text-ink-300">
              <span className="font-semibold text-ink-100">Simulation Summary:</span>{' '}
              {request.sceneDescription.slice(0, 140)}...
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="flex flex-wrap items-center gap-2 border-t border-ink-800/80 bg-ink-950/80 px-5 py-3">
        {generating ? (
          <button type="button" className="btn-danger flex-1" onClick={onStop}>
            <Square size={14} />
            Stop Generation
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn-ghost flex-1 py-2"
              onClick={onCompileInstant}
              title="Instant zero-latency compilation formatted for Midjourney, FLUX, Ideogram, SDXL"
            >
              <Wand2 size={14} className="text-accent" />
              Instant Compile (0s)
            </button>
            <button
              type="button"
              className="btn-primary flex-1 py-2"
              onClick={onGenerateAI}
              title="Stream viral prompt expansion & social copy using local LLM"
            >
              <Sparkles size={14} />
              AI Viral Generator
            </button>
          </>
        )}
      </div>

      {/* Brainstorm Modal / Drawer */}
      {brainstormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeUp">
          <div className="panel flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-ink-700 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <BrainCircuit size={20} className="text-accent" />
                <div>
                  <h3 className="text-base font-semibold text-ink-100">
                    Qwen AI Viral Meme Brainstormer
                  </h3>
                  <p className="text-xs text-ink-400">
                    Generate viral, hilarious concepts for Cardi Bee ($111k presale & $1M pregnancy bet)
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost !px-2 !py-1"
                onClick={() => setBrainstormOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="border-b border-ink-800 bg-ink-950/60 px-6 py-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void handleRunBrainstorm(brainstormTopic)
                }}
                className="flex gap-2"
              >
                <input
                  className="field flex-1 text-xs"
                  value={brainstormTopic}
                  onChange={(e) => setBrainstormTopic(e.target.value)}
                  placeholder="Enter a custom theme (e.g. Nightclub VIP, Courtroom, Subway, Yacht) or leave blank for surprise ideas..."
                />
                <button
                  type="submit"
                  className="btn-primary !px-4 !py-1 text-xs"
                  disabled={brainstormLoading}
                >
                  {brainstormLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Sparkles size={13} />
                  )}
                  Brainstorm
                </button>
              </form>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-6">
              {brainstormLoading ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <Loader2 size={32} className="animate-spin text-accent" />
                  <p className="mt-3 text-sm font-medium text-ink-200">
                    Qwen is cooking 5 viral meme scenarios…
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    Engineering comedic timing, gossip dialogues, and pregnancy bet angles
                  </p>
                </div>
              ) : brainstormIdeas.length === 0 ? (
                <div className="py-12 text-center text-ink-400">
                  <p>No ideas yet. Click "Brainstorm" to start generating concepts with Qwen.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {brainstormIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="group rounded-xl border border-ink-800 bg-ink-950/70 p-4 transition duration-200 hover:border-accent/50 hover:bg-ink-950"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-ink-100 group-hover:text-accent">
                          {idea.title}
                        </h4>
                        <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[9px] font-mono uppercase text-accent">
                          {idea.style.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-ink-300">
                        {idea.concept || idea.scene.slice(0, 120) + '...'}
                      </p>

                      {idea.speechBubble && (
                        <div className="mt-2 rounded bg-ink-900/80 px-2.5 py-1.5 text-[11px] text-ink-200 border-l-2 border-accent">
                          <span className="font-semibold text-accent">💬 Bubble: </span>
                          "{idea.speechBubble}"
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between border-t border-ink-800/80 pt-2">
                        <span className="text-[10px] text-ink-500">
                          {idea.manOutfit.slice(0, 24)}...
                        </span>
                        <button
                          type="button"
                          className="btn-primary !py-1 !px-3 text-xs"
                          onClick={() => handleApplyIdea(idea)}
                        >
                          Apply Concept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-ink-800 bg-ink-950/80 px-6 py-3 text-xs text-ink-500">
              <span>Click "Apply Concept" on any card to load it directly into the Studio</span>
              <button
                type="button"
                className="btn-ghost !py-1 text-xs"
                onClick={() => setBrainstormOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
