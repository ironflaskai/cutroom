import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import TopBar from './components/TopBar'
import CreativeBrief from './components/CreativeBrief'
import OutputPanel from './components/OutputPanel'
import ImagePromptStudio from './components/ImagePromptStudio'
import ImageOutputPanel from './components/ImageOutputPanel'
import LibraryView from './components/LibraryView'
import SettingsDrawer from './components/SettingsDrawer'
import {
  ASPECT_OPTIONS,
  DEFAULT_CAMPAIGN_CONTEXT,
  DEFAULT_SETTINGS,
  defaultRoleForKind,
  detectMediaKind,
  labelReferences,
  type AppSettings,
  type AspectRatio,
  type ConnectionStatus,
  type ImagePromptRequest,
  type ImagePromptResult,
  type GoogleFlowMode,
  type LibraryEntry,
  type ReferenceAsset,
  type ReferenceRole,
  type VideoPromptTarget,
  type Workflow,
  type WorkspaceTab
} from '@shared/types'
import { MEME_PRESETS, type MemePresetDefinition } from '@shared/imagePromptSystem'

const BRIEF_PLACEHOLDER = `Keep the camera, blocking, and pacing of the reference clip, but replace the on-screen person with my character from the still.

[Shot 1] Live-action, cinematic — follow <Video 1> staging while <Subject 1> (appearance from <Picture 1>) performs the same actions.
[Shot 2] At 00:04.000, continue matching <Video 1> cuts/camera; identity stays <Subject 1>.`

const CHARACTER_INTO_VIDEO_BRIEF = `Rewrite the attached reference clip with my character.

Use Full-reference (Ref2VA):
- Appearance identity from the still (<Picture 1> → <Subject 1>)
- Motion, camera path, cuts, and pacing from the clip (<Video 1>)
- Replace the original performer; do not keep them on screen

summary should use [video editing + reference generation] (or [reference generation] if only guiding motion).
retention: <Subject 1> fully_preserved from the still; <Video 1> partially_preserved for camera/blocking/environment.`

function fileToAsset(file: {
  name: string
  path: string
  mimeType: string
  dataUrl: string
}): ReferenceAsset {
  const kind = detectMediaKind(file.mimeType, file.name)
  return {
    id: uuid(),
    name: file.name,
    path: file.path,
    dataUrl: file.dataUrl,
    mimeType: file.mimeType || (kind === 'video' ? 'video/mp4' : 'image/jpeg'),
    kind,
    role: defaultRoleForKind(kind),
    traits: ''
  }
}

function initialImageRequest(settings: AppSettings): ImagePromptRequest {
  const p = MEME_PRESETS[0]
  return {
    presetId: p.id,
    title: p.defaultTitle,
    sceneDescription: p.defaultScene,
    manCharacter: {
      label: '@image1',
      name: 'Man Character',
      gender: 'man',
      role: 'Primary Male Partner',
      outfit: p.defaultManOutfit,
      traits: 'Strict facial identity lock matching @image1',
      expression: 'Confident, relaxed, eating burger and drinking milkshake'
    },
    womanCharacter: {
      label: '@image2',
      name: 'Woman Character (Cardi Bee)',
      gender: 'woman',
      role: 'Primary Female Subject (Cardi Bee)',
      outfit: p.defaultWomanOutfit,
      traits: 'Strict facial geometry and body shape lock matching @image2',
      expression: 'Radiant knowing smile, sipping drink, glamorous'
    },
    backgroundPeople: p.defaultBackground,
    style: p.defaultStyle,
    engine: 'grok',
    aspect: '16:9',
    textMode: 'speech_bubble',
    speechBubbleText: p.defaultSpeechBubble,
    speechBubbleSpeaker: p.defaultSpeechSpeaker,
    topMemeText: p.defaultTopText,
    bottomMemeText: p.defaultBottomText,
    tabloidHeadline: p.defaultHeadline,
    campaignContext: { ...DEFAULT_CAMPAIGN_CONTEXT },
    settings
  }
}

export default function App(): React.JSX.Element {
  const [tab, setTab] = useState<WorkspaceTab>('image_meme')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [status, setStatus] = useState<ConnectionStatus>({
    online: false,
    backend: 'ollama',
    model: '',
    message: 'Checking local model…',
    models: []
  })

  // Video State
  const [brief, setBrief] = useState(BRIEF_PLACEHOLDER)
  const [videoTarget, setVideoTarget] = useState<VideoPromptTarget>('minimax_h3')
  const [workflow, setWorkflow] = useState<Workflow>('full_reference')
  const [flowMode, setFlowMode] = useState<GoogleFlowMode>('ingredients')
  const [duration, setDuration] = useState<number>(12)
  const [aspect, setAspect] = useState<AspectRatio>('16:9')
  const [references, setReferences] = useState<ReferenceAsset[]>([])
  const [output, setOutput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [statusNote, setStatusNote] = useState('')

  // Meme & Image Studio State
  const [imageRequest, setImageRequest] = useState<ImagePromptRequest>(() =>
    initialImageRequest(DEFAULT_SETTINGS)
  )
  const [imageResult, setImageResult] = useState<ImagePromptResult | null>(null)
  const [imageStreamingOutput, setImageStreamingOutput] = useState('')
  const [imageGenerating, setImageGenerating] = useState(false)
  const [imageStatusNote, setImageStatusNote] = useState('')

  const [library, setLibrary] = useState<LibraryEntry[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2500)
  }, [])

  const refreshStatus = useCallback(async () => {
    try {
      const next = await window.h3.probeStatus()
      setStatus(next)
      setSettings((prev) => {
        if (next.model && next.model !== prev.model) {
          const updated = { ...prev, model: next.model }
          void window.h3.setSettings(updated)
          return updated
        }
        return prev
      })
    } catch (err) {
      setStatus((s) => ({
        ...s,
        online: false,
        message: err instanceof Error ? err.message : 'Offline'
      }))
    }
  }, [])

  useEffect(() => {
    void (async () => {
      const s = await window.h3.getSettings()
      const merged = {
        ...DEFAULT_SETTINGS,
        ...s,
        numCtx: s.numCtx || 4096,
        enableThinking: Boolean(s.enableThinking),
        autoDescribeImages: Boolean(s.autoDescribeImages),
        vramGb: s.vramGb || 20
      }
      setSettings(merged)
      setImageRequest((prev) => ({ ...prev, settings: merged }))

      const lib = await window.h3.listLibrary()
      setLibrary(lib)
      await refreshStatus()
    })()

    const timer = window.setInterval(() => {
      void refreshStatus()
    }, 12000)
    return () => window.clearInterval(timer)
  }, [refreshStatus])

  // Video generation listeners
  useEffect(() => {
    const offChunk = window.h3.onGenerateChunk((chunk) => {
      setOutput((prev) => prev + chunk)
    })
    const offStatus = window.h3.onGenerateStatus((status) => {
      setStatusNote(status)
    })
    const offDone = window.h3.onGenerateDone(() => {
      setGenerating(false)
      setStatusNote('Generation complete')
    })
    const offErr = window.h3.onGenerateError((message) => {
      setGenerating(false)
      setStatusNote(message)
      showToast(message)
    })
    return () => {
      offChunk()
      offStatus()
      offDone()
      offErr()
    }
  }, [showToast])

  // Image prompt generation listeners
  useEffect(() => {
    const offChunk = window.h3.onImageGenerateChunk((chunk) => {
      setImageStreamingOutput((prev) => prev + chunk)
    })
    const offStatus = window.h3.onImageGenerateStatus((status) => {
      setImageStatusNote(status)
    })
    const offDone = window.h3.onImageGenerateDone((full) => {
      setImageGenerating(false)
      setImageStatusNote('AI prompt generation complete')
      if (full) {
        // Also update imageResult mainPrompt
        setImageResult((prev) => ({
          mainPrompt: full,
          enginePrompts: {
            grok: full,
            flux: full,
            midjourney: `/imagine prompt: ${full} --ar 16:9 --v 6.1 --style raw`,
            ideogram: full,
            sdxl: full,
            dalle3: full
          },
          negativePrompt: prev?.negativePrompt || 'bad anatomy, deformed face, blurry',
          socialCopy: prev?.socialCopy || '',
          textInstructions: prev?.textInstructions || ''
        }))
      }
    })
    const offErr = window.h3.onImageGenerateError((message) => {
      setImageGenerating(false)
      setImageStatusNote(message)
      showToast(message)
    })
    return () => {
      offChunk()
      offStatus()
      offDone()
      offErr()
    }
  }, [showToast])

  const vramWarning = useMemo(() => {
    const m = (settings.model || '').toLowerCase()
    if (!m) return null
    if (settings.vramGb <= 20 && /27b|32b|30b/.test(m) && /q4_k_xl|q5_/.test(m)) {
      return 'RTX A4500 (~20GB): Q4_K_XL is very tight. Prefer smtek/Qwen3.8-27B:Q3_K_M, Context 4096, Thinking OFF. Click Unload Model if you hit OOM.'
    }
    if (settings.vramGb <= 24 && /27b|32b|30b|70b|72b/.test(m) && !/q4|q5|q3|q2|iq/.test(m)) {
      return '24 GB VRAM: prefer Q4_K_M / Q5_K_M quantizations for 27B+ models.'
    }
    return null
  }, [settings.model, settings.vramGb])

  const persistSettings = async (next: AppSettings): Promise<void> => {
    setSettings(next)
    setImageRequest((prev) => ({ ...prev, settings: next }))
    await window.h3.setSettings(next)
    await refreshStatus()
  }

  // Video Methods
  const describeAsset = async (
    asset: ReferenceAsset,
    currentSettings: AppSettings
  ): Promise<void> => {
    if (!currentSettings.autoDescribeImages) return
    if (!asset.mimeType.startsWith('image/')) return
    setReferences((prev) =>
      prev.map((r) => (r.id === asset.id ? { ...r, describing: true } : r))
    )
    try {
      const description = await window.h3.describeImage({
        dataUrl: asset.dataUrl,
        name: asset.name,
        settings: currentSettings
      })
      setReferences((prev) =>
        prev.map((r) =>
          r.id === asset.id ? { ...r, description, describing: false } : r
        )
      )
    } catch {
      setReferences((prev) =>
        prev.map((r) => (r.id === asset.id ? { ...r, describing: false } : r))
      )
    }
  }

  const addFiles = async (
    files: Array<{ name: string; path: string; mimeType: string; dataUrl: string }>
  ): Promise<void> => {
    const assets = files.map((f) => fileToAsset(f))
    setReferences((prev) => [...prev, ...assets])
    for (const asset of assets) {
      void describeAsset(asset, settings)
    }
  }

  const onPickImages = async (): Promise<void> => {
    const files = await window.h3.openImages()
    if (files.length) await addFiles(files)
  }

  const onDropFiles = async (fileList: FileList): Promise<void> => {
    const mapped = []
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })
      mapped.push({
        name: file.name,
        path: window.h3.getPathForFile(file) || file.name,
        mimeType: file.type || 'image/jpeg',
        dataUrl
      })
    }
    if (mapped.length) await addFiles(mapped)
  }

  const clearBrief = (): void => {
    setBrief('')
    setReferences([])
  }

  const generateVideo = async (): Promise<void> => {
    if (generating) return
    setOutput('')
    setGenerating(true)
    setStatusNote('Streaming from local model…')
    setTab('video')
    try {
      await window.h3.startGenerate({
        brief,
        target: videoTarget,
        workflow,
        flowMode,
        duration,
        aspect,
        references: labelReferences(references),
        settings
      })
    } catch (err) {
      setGenerating(false)
      const message = err instanceof Error ? err.message : 'Generation failed'
      setStatusNote(message)
      showToast(message)
    }
  }

  const stopVideo = async (): Promise<void> => {
    await window.h3.stopGenerate()
    setGenerating(false)
    setStatusNote('Stopped')
  }

  const copyVideoOutput = async (): Promise<void> => {
    if (!output.trim()) return
    await navigator.clipboard.writeText(output)
    showToast('Copied to clipboard')
  }

  const downloadVideoOutput = async (): Promise<void> => {
    if (!output.trim()) return
    const ok = await window.h3.saveTextFile({
      defaultName: `${videoTarget === 'google_flow_omni' ? 'google-flow-omni' : 'h3'}-prompt-${Date.now()}.txt`,
      content: output
    })
    if (ok) showToast('Downloaded .txt')
  }

  const saveVideoToLibrary = async (): Promise<void> => {
    if (!output.trim()) return
    const title =
      brief
        .split('\n')
        .map((l) => l.trim())
        .find(Boolean)
        ?.slice(0, 72) || (videoTarget === 'google_flow_omni' ? 'Untitled Google Flow prompt' : 'Untitled H3 prompt')
    const entry = await window.h3.saveLibraryEntry({
      entryType: 'video',
      title,
      brief,
      workflow,
      videoTarget,
      flowMode,
      duration,
      aspect,
      output,
      model: settings.model,
      thumbnails: references.slice(0, 6).map((r) => ({
        id: r.id,
        name: r.name,
        dataUrl: r.dataUrl,
        role: r.role,
        kind: r.kind
      }))
    })
    setLibrary((prev) => [entry, ...prev.filter((x) => x.id !== entry.id)])
    showToast(`Saved ${videoTarget === 'google_flow_omni' ? 'Google Flow' : 'MiniMax'} prompt to library`)
  }

  // Meme & Image Methods
  const handleSelectPreset = (preset: MemePresetDefinition): void => {
    setImageRequest((prev) => ({
      ...prev,
      presetId: preset.id,
      title: preset.defaultTitle,
      sceneDescription: preset.defaultScene,
      manCharacter: {
        ...prev.manCharacter,
        outfit: preset.defaultManOutfit
      },
      womanCharacter: {
        ...prev.womanCharacter,
        outfit: preset.defaultWomanOutfit
      },
      backgroundPeople: preset.defaultBackground,
      style: preset.defaultStyle,
      speechBubbleText: preset.defaultSpeechBubble,
      speechBubbleSpeaker: preset.defaultSpeechSpeaker,
      topMemeText: preset.defaultTopText,
      bottomMemeText: preset.defaultBottomText,
      tabloidHeadline: preset.defaultHeadline
    }))
    showToast(`Loaded preset: ${preset.name}`)
  }

  const handlePickCharacterImage = async (slot: 'man' | 'woman'): Promise<void> => {
    const files = await window.h3.openImages()
    if (!files.length) return
    const f = files[0]
    const asset: ReferenceAsset = {
      id: uuid(),
      name: f.name,
      path: f.path,
      dataUrl: f.dataUrl,
      mimeType: f.mimeType,
      kind: 'picture',
      role: 'subject_appearance',
      traits: ''
    }
    if (slot === 'man') {
      setImageRequest((prev) => ({
        ...prev,
        manCharacter: { ...prev.manCharacter, asset }
      }))
      showToast('Loaded @image1 (Man Reference)')
    } else {
      setImageRequest((prev) => ({
        ...prev,
        womanCharacter: { ...prev.womanCharacter, asset }
      }))
      showToast('Loaded @image2 (Woman / Cardi Bee Reference)')
    }
  }

  const handleDropCharacterFile = async (slot: 'man' | 'woman', file: File): Promise<void> => {
    if (!file.type.startsWith('image/')) return
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    const asset: ReferenceAsset = {
      id: uuid(),
      name: file.name,
      path: window.h3.getPathForFile(file) || file.name,
      dataUrl,
      mimeType: file.type || 'image/jpeg',
      kind: 'picture',
      role: 'subject_appearance',
      traits: ''
    }
    if (slot === 'man') {
      setImageRequest((prev) => ({
        ...prev,
        manCharacter: { ...prev.manCharacter, asset }
      }))
      showToast('Loaded @image1 (Man Reference)')
    } else {
      setImageRequest((prev) => ({
        ...prev,
        womanCharacter: { ...prev.womanCharacter, asset }
      }))
      showToast('Loaded @image2 (Woman / Cardi Bee Reference)')
    }
  }

  const handleRemoveCharacterImage = (slot: 'man' | 'woman'): void => {
    if (slot === 'man') {
      setImageRequest((prev) => ({
        ...prev,
        manCharacter: { ...prev.manCharacter, asset: undefined }
      }))
    } else {
      setImageRequest((prev) => ({
        ...prev,
        womanCharacter: { ...prev.womanCharacter, asset: undefined }
      }))
    }
  }

  const compileInstantImage = async (): Promise<void> => {
    const res = await window.h3.compileImagePrompt({
      ...imageRequest,
      settings
    })
    setImageResult(res)
    setImageStreamingOutput('')
    setImageStatusNote(`Instant prompt compiled for ${imageRequest.engine.toUpperCase()}`)
    showToast('Compiled prompt package in 0.0s')
  }

  const generateAIImage = async (): Promise<void> => {
    if (imageGenerating) return
    setImageStreamingOutput('')
    setImageGenerating(true)
    setImageStatusNote('Streaming viral prompt from local LLM…')
    try {
      await window.h3.startImageGenerate({
        ...imageRequest,
        settings
      })
    } catch (err) {
      setImageGenerating(false)
      const message = err instanceof Error ? err.message : 'AI prompt generation failed'
      setImageStatusNote(message)
      showToast(message)
    }
  }

  const stopAIImage = async (): Promise<void> => {
    await window.h3.stopImageGenerate()
    setImageGenerating(false)
    setImageStatusNote('Stopped')
  }

  const saveImageToLibrary = async (): Promise<void> => {
    const activeText =
      imageResult?.enginePrompts[imageRequest.engine] ||
      imageResult?.mainPrompt ||
      imageStreamingOutput
    if (!activeText.trim()) return

    const thumbs: Array<{ id: string; name: string; dataUrl: string; role?: string }> = []
    if (imageRequest.manCharacter.asset) {
      thumbs.push({
        id: imageRequest.manCharacter.asset.id,
        name: imageRequest.manCharacter.asset.name,
        dataUrl: imageRequest.manCharacter.asset.dataUrl,
        role: '@image1 (Man)'
      })
    }
    if (imageRequest.womanCharacter.asset) {
      thumbs.push({
        id: imageRequest.womanCharacter.asset.id,
        name: imageRequest.womanCharacter.asset.name,
        dataUrl: imageRequest.womanCharacter.asset.dataUrl,
        role: '@image2 (Woman / Cardi Bee)'
      })
    }

    const entry = await window.h3.saveLibraryEntry({
      entryType: 'image_meme',
      title: imageRequest.title || 'Cardi Bee Viral Meme',
      brief: imageRequest.sceneDescription,
      aspect: imageRequest.aspect,
      output: activeText,
      model: settings.model || 'instant-compiler',
      engine: imageRequest.engine,
      presetId: imageRequest.presetId,
      imageResult: imageResult || undefined,
      thumbnails: thumbs
    })
    setLibrary((prev) => [entry, ...prev.filter((x) => x.id !== entry.id)])
    showToast('Saved meme prompt to library')
  }

  const downloadImageOutput = async (): Promise<void> => {
    const activeText =
      imageResult?.enginePrompts[imageRequest.engine] ||
      imageResult?.mainPrompt ||
      imageStreamingOutput
    if (!activeText.trim()) return
    const content = `=== CARDI BEE MEME PROMPT ===
Title: ${imageRequest.title}
Engine: ${imageRequest.engine}
Aspect: ${imageRequest.aspect}
Scene: ${imageRequest.sceneDescription}

[MAIN PROMPT]
${activeText}

[NEGATIVE PROMPT]
${imageResult?.negativePrompt || 'N/A'}

[VIRAL MARKETING COPY]
${imageResult?.socialCopy || 'N/A'}`

    const ok = await window.h3.saveTextFile({
      defaultName: `cardibee-meme-${Date.now()}.txt`,
      content
    })
    if (ok) showToast('Downloaded .txt')
  }

  // Unified Library opener
  const openLibraryEntry = (entry: LibraryEntry): void => {
    if (entry.entryType === 'image_meme') {
      const preset = MEME_PRESETS.find((p) => p.id === entry.presetId) || MEME_PRESETS[0]
      setImageRequest((prev) => ({
        ...prev,
        title: entry.title,
        sceneDescription: entry.brief || prev.sceneDescription,
        aspect: entry.aspect,
        engine: entry.engine || 'flux',
        presetId: entry.presetId || preset.id
      }))
      if (entry.imageResult) {
        setImageResult(entry.imageResult)
      } else {
        setImageStreamingOutput(entry.output)
      }
      setTab('image_meme')
      showToast('Opened meme prompt from library')
    } else {
      setBrief(entry.brief)
      setVideoTarget(entry.videoTarget || 'minimax_h3')
      setWorkflow(entry.workflow || 'full_reference')
      setFlowMode(entry.flowMode || 'ingredients')
      setDuration(entry.duration || 12)
      setAspect(entry.aspect)
      setOutput(entry.output)
      setReferences(
        entry.thumbnails.map((t) => {
          const kind = t.kind || detectMediaKind('', t.name)
          return {
            id: t.id,
            name: t.name,
            path: t.name,
            dataUrl: t.dataUrl,
            mimeType: kind === 'video' ? 'video/mp4' : 'image/jpeg',
            kind,
            role: (t.role as ReferenceRole) || 'subject_appearance',
            traits: ''
          }
        })
      )
      setTab('video')
      showToast('Opened video prompt from library')
    }
  }

  const deleteLibraryEntry = async (id: string): Promise<void> => {
    const next = await window.h3.deleteLibraryEntry(id)
    setLibrary(next)
    showToast('Deleted from library')
  }

  const handleBrainstormIdeas = async (topic: string) => {
    try {
      const ideas = await window.h3.brainstormMemeIdeas({
        topic,
        count: 5,
        campaignContext: imageRequest.campaignContext,
        settings
      })
      showToast(`Qwen generated ${ideas.length} fresh viral meme concepts`)
      return ideas
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Brainstorm failed'
      showToast(msg)
      return []
    }
  }

  return (
    <div className="flex h-full flex-col text-ink-100">
      <TopBar
        status={status}
        settings={settings}
        models={status.models}
        tab={tab}
        onTabChange={setTab}
        onSwitchModel={async (model) => {
          await persistSettings({ ...settings, model })
        }}
        onUnload={async () => {
          const res = await window.h3.unloadModel()
          showToast(res.message)
          await refreshStatus()
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        onCloseApp={() => void window.h3.quitApp()}
      />

      {vramWarning && (
        <div className="border-b border-warn/30 bg-warn-soft px-4 py-2 text-sm text-warn">
          {vramWarning}
        </div>
      )}

      {tab === 'video' ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-2">
          <CreativeBrief
            brief={brief}
            target={videoTarget}
            workflow={workflow}
            flowMode={flowMode}
            duration={duration}
            aspect={aspect}
            references={references}
            durationOptions={[4, 6, 8, 10]}
            aspectOptions={videoTarget === 'google_flow_omni' ? ['16:9', '9:16'] : ASPECT_OPTIONS}
            generating={generating}
            onBriefChange={setBrief}
            onTargetChange={(next) => {
              setVideoTarget(next)
              if (next === 'google_flow_omni') {
                if (![4, 6, 8, 10].includes(duration)) setDuration(8)
                if (aspect !== '16:9' && aspect !== '9:16') setAspect('16:9')
              }
              setOutput('')
            }}
            onWorkflowChange={setWorkflow}
            onFlowModeChange={setFlowMode}
            onDurationChange={setDuration}
            onAspectChange={setAspect}
            onClear={clearBrief}
            onPickImages={() => void onPickImages()}
            onDropFiles={(files) => void onDropFiles(files)}
            onUpdateReference={(id, patch) => {
              setReferences((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
            }}
            onRemoveReference={(id) => {
              setReferences((prev) => prev.filter((r) => r.id !== id))
            }}
            onApplyCharacterIntoVideoRecipe={() => {
              setWorkflow('full_reference')
              setBrief(CHARACTER_INTO_VIDEO_BRIEF)
              setReferences((prev) =>
                prev.map((r) => {
                  if (r.kind === 'picture') {
                    return { ...r, role: 'subject_appearance' as ReferenceRole }
                  }
                  if (r.kind === 'video') {
                    return { ...r, role: 'source_edit' as ReferenceRole }
                  }
                  return r
                })
              )
              showToast('Recipe applied — Full reference + character→video roles')
            }}
            onGenerate={() => void generateVideo()}
            onStop={() => void stopVideo()}
          />
          <OutputPanel
            output={output}
            generating={generating}
            statusNote={statusNote}
            workflow={workflow}
            target={videoTarget}
            flowMode={flowMode}
            onCopy={() => void copyVideoOutput()}
            onSave={() => void saveVideoToLibrary()}
            onDownload={() => void downloadVideoOutput()}
          />
        </div>
      ) : tab === 'image_meme' ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-2">
          <ImagePromptStudio
            request={imageRequest}
            generating={imageGenerating}
            statusNote={imageStatusNote}
            onChange={(patch) => setImageRequest((prev) => ({ ...prev, ...patch }))}
            onPickCharacterImage={handlePickCharacterImage}
            onDropCharacterFile={handleDropCharacterFile}
            onRemoveCharacterImage={handleRemoveCharacterImage}
            onSelectPreset={handleSelectPreset}
            onBrainstormIdeas={handleBrainstormIdeas}
            onCompileInstant={() => void compileInstantImage()}
            onGenerateAI={() => void generateAIImage()}
            onStop={() => void stopAIImage()}
          />
          <ImageOutputPanel
            result={imageResult}
            streamingOutput={imageStreamingOutput}
            generating={imageGenerating}
            statusNote={imageStatusNote}
            targetEngine={imageRequest.engine}
            onCopy={async (text, label) => {
              await navigator.clipboard.writeText(text)
              showToast(label || 'Copied to clipboard')
            }}
            onSave={() => void saveImageToLibrary()}
            onDownload={() => void downloadImageOutput()}
          />
        </div>
      ) : (
        <LibraryView
          entries={library}
          onOpen={openLibraryEntry}
          onCopy={async (entry) => {
            await navigator.clipboard.writeText(entry.output)
            showToast('Copied')
          }}
          onDelete={(id) => void deleteLibraryEntry(id)}
        />
      )}

      <SettingsDrawer
        open={settingsOpen}
        settings={settings}
        models={status.models}
        onClose={() => setSettingsOpen(false)}
        onSave={(next) => void persistSettings(next)}
      />

      {toast && (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 animate-fadeUp rounded-md border border-ink-700 bg-ink-850 px-4 py-2 text-sm text-ink-100 shadow-panel">
          {toast}
        </div>
      )}
    </div>
  )
}
