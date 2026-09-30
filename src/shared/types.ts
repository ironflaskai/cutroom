export type BackendKind = 'ollama' | 'lmstudio' | 'qwencloud' | 'openrouter'

export type Workflow =
  | 'full_reference'
  | 't2va'
  | 'i2va'
  | 'fl2va'
  | 'l2va'

export type VideoPromptTarget = 'minimax_h3' | 'google_flow_omni'

export type GoogleFlowMode =
  | 'text_to_video'
  | 'first_frame'
  | 'first_last_frames'
  | 'ingredients'
  | 'video_edit'

export type AspectRatio = '16:9' | '9:16' | '1:1' | '21:9'

export type MediaKind = 'picture' | 'video'

/** Roles for still images (<Picture N>) */
export type PictureRole =
  | 'subject_appearance'
  | 'keyframe_composition'
  | 'environment'
  | 'style_reference'
  | 'costume_props'
  | 'lighting_mood'

/** Roles for video assets (<Video N>) — numbered independently from pictures */
export type VideoRole =
  | 'source_edit'
  | 'motion_action'
  | 'camera_structure'
  | 'continuation_source'
  | 'style_tempo'

export type ReferenceRole = PictureRole | VideoRole

export interface AppSettings {
  backend: BackendKind
  ollamaUrl: string
  lmstudioUrl: string
  qwenCloudUrl: string
  qwenCloudApiKey: string
  openRouterApiKey: string
  model: string
  visionModel: string
  temperature: number
  maxTokens: number
  numCtx: number
  enableThinking: boolean
  autoDescribeImages: boolean
  vramGb: number
}

export interface ReferenceAsset {
  id: string
  name: string
  path: string
  dataUrl: string
  mimeType: string
  kind: MediaKind
  role: ReferenceRole
  traits: string
  description?: string
  describing?: boolean
}

export interface LabeledReference {
  id: string
  name: string
  kind: MediaKind
  role: ReferenceRole
  traits: string
  description?: string
  /** 1-based index within its own kind: Picture 1, Picture 2… or Video 1, Video 2… */
  labelIndex: number
  label: string
}

export interface GenerateRequest {
  brief: string
  target: VideoPromptTarget
  workflow: Workflow
  flowMode: GoogleFlowMode
  duration: number
  aspect: AspectRatio
  references: LabeledReference[]
  settings: AppSettings
}

export type WorkspaceTab = 'video' | 'image_meme' | 'library'

export type ImageEngineTarget = 'grok' | 'flux' | 'midjourney' | 'ideogram' | 'sdxl' | 'dalle3'

export type MemeStylePreset =
  | 'photo_candid'
  | 'photo_speech_bubble'
  | 'satirical_3d'
  | 'comic_popart'
  | 'tabloid_paparazzi'
  | 'cinematic_movie'

export type TextOverlayMode = 'speech_bubble' | 'top_bottom_meme' | 'tabloid_headline' | 'none'

export type MemePresetId =
  | 'diner_gossip'
  | 'ultrasound_bet'
  | 'tabloid_breaking'
  | 'crypto_sportsbook'
  | 'test_reveal'
  | 'presale_shower'
  | 'custom'

export interface ImageCharacterSlot {
  label: '@image1' | '@image2' | '@image3'
  name: string
  gender: 'man' | 'woman' | 'other'
  role: string
  outfit: string
  traits: string
  expression: string
  asset?: ReferenceAsset
}

export interface CampaignContext {
  tokenName: string
  presaleGoal: string
  betPool: string
  website: string
}

export interface BrainstormIdea {
  id: string
  title: string
  concept: string
  scene: string
  manOutfit: string
  womanOutfit: string
  background: string
  speechBubble: string
  speechSpeaker: string
  topText: string
  bottomText: string
  headline: string
  style: MemeStylePreset
}

export interface BrainstormRequest {
  topic?: string
  count?: number
  campaignContext: CampaignContext
  settings: AppSettings
}

export interface ImagePromptRequest {
  presetId: MemePresetId
  title: string
  sceneDescription: string
  manCharacter: ImageCharacterSlot
  womanCharacter: ImageCharacterSlot
  backgroundPeople: string
  style: MemeStylePreset
  engine: ImageEngineTarget
  aspect: AspectRatio
  textMode: TextOverlayMode
  speechBubbleText: string
  speechBubbleSpeaker: string
  topMemeText: string
  bottomMemeText: string
  tabloidHeadline: string
  campaignContext: CampaignContext
  settings: AppSettings
}

export interface ImagePromptResult {
  mainPrompt: string
  enginePrompts: {
    grok: string
    flux: string
    midjourney: string
    ideogram: string
    sdxl: string
    dalle3: string
  }
  negativePrompt: string
  socialCopy: string
  textInstructions: string
}

export interface LibraryEntry {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  entryType?: 'video' | 'image_meme'
  brief: string
  workflow?: Workflow
  videoTarget?: VideoPromptTarget
  flowMode?: GoogleFlowMode
  duration?: number
  aspect: AspectRatio
  output: string
  model: string
  engine?: ImageEngineTarget
  presetId?: MemePresetId
  imageResult?: ImagePromptResult
  thumbnails: Array<{
    id: string
    name: string
    dataUrl: string
    role?: ReferenceRole | string
    kind?: MediaKind
  }>
}

export interface ModelInfo {
  id: string
  name: string
  size?: string
  backend: BackendKind
}

export interface ConnectionStatus {
  online: boolean
  backend: BackendKind
  model: string
  message: string
  models: ModelInfo[]
}

export const DEFAULT_CAMPAIGN_CONTEXT: CampaignContext = {
  tokenName: 'Cardi Bee',
  presaleGoal: '$111,000',
  betPool: '$1,000,000',
  website: 'cardibeewap.com'
}

export const DEFAULT_SETTINGS: AppSettings = {
  backend: 'ollama',
  ollamaUrl: 'http://localhost:11434',
  lmstudioUrl: 'http://localhost:1234/v1',
  qwenCloudUrl: 'https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1',
  qwenCloudApiKey: '',
  openRouterApiKey: '',
  model: 'qwen3.5:35b',
  visionModel: 'qwen3.5:35b',
  temperature: 0.7,
  maxTokens: 3072,
  numCtx: 16384,
  enableThinking: false,
  autoDescribeImages: true,
  vramGb: 48
}

export const WORKFLOW_LABELS: Record<Workflow, string> = {
  full_reference: 'Full reference (Ref2VA · 6 sections)',
  t2va: 'T2VA — Text to Video+Audio',
  i2va: 'I2VA — Image to Video+Audio',
  fl2va: 'FL2VA — First/Last frame',
  l2va: 'L2VA — Last frame'
}

export const VIDEO_TARGET_LABELS: Record<VideoPromptTarget, string> = {
  minimax_h3: 'MiniMax H3',
  google_flow_omni: 'Google Flow · Omni Flash 1.1'
}

export const GOOGLE_FLOW_MODE_LABELS: Record<GoogleFlowMode, string> = {
  text_to_video: 'Text to Video',
  first_frame: 'Frames · First',
  first_last_frames: 'Frames · First + Last',
  ingredients: 'Ingredients / References',
  video_edit: 'Video to Video Edit'
}

export const ENGINE_LABELS: Record<ImageEngineTarget, string> = {
  grok: '⚡ Grok (xAI / Twitter — Primary)',
  flux: 'FLUX.1 (Pro / Dev / Schnell)',
  midjourney: 'Midjourney v6.1 (--cref)',
  ideogram: 'Ideogram 2.0 (Speech Bubbles & Text)',
  sdxl: 'Stable Diffusion XL / SD3.5',
  dalle3: 'DALL-E 3 / Imagen 3'
}

export const MEME_STYLE_LABELS: Record<MemeStylePreset, string> = {
  photo_candid: '📸 35mm Candid Flash Photo (Realistic Diner/Street)',
  photo_speech_bubble: '💬 Photorealistic + Comic Speech Bubble',
  satirical_3d: '🎨 Satirical 3D Animated / Pixar Comedy',
  comic_popart: '💥 Vintage Pop-Art / Comic Book Strip',
  tabloid_paparazzi: '📰 TMZ / Paparazzi Tabloid Cover',
  cinematic_movie: '🎬 Cinematic 85mm Movie Still'
}

export const TEXT_MODE_LABELS: Record<TextOverlayMode, string> = {
  speech_bubble: '💬 Cartoon Speech / Thought Bubble',
  top_bottom_meme: '🅰️ Top & Bottom Classic Meme Text',
  tabloid_headline: '📰 Tabloid Banner / Breaking Headline',
  none: '🚫 No Visible Text (Pure Visual Meme)'
}

export const PICTURE_ROLE_LABELS: Record<PictureRole, string> = {
  subject_appearance: 'Subject / appearance → Subject',
  keyframe_composition: 'Keyframe / composition → Picture',
  environment: 'Environment → Subject',
  style_reference: 'Style reference → Subject',
  costume_props: 'Costume / props → Subject',
  lighting_mood: 'Lighting / mood → Subject'
}

export const VIDEO_ROLE_LABELS: Record<VideoRole, string> = {
  source_edit: 'Source video to edit → Video',
  motion_action: 'Motion / action / blocking → Video',
  camera_structure: 'Camera / cuts / rhythm → Video',
  continuation_source: 'Continue from this video → Video',
  style_tempo: 'Style / tempo reference → Video'
}

/** @deprecated use PICTURE_ROLE_LABELS / VIDEO_ROLE_LABELS */
export const ROLE_LABELS: Record<string, string> = {
  ...PICTURE_ROLE_LABELS,
  ...VIDEO_ROLE_LABELS
}

export const ASPECT_OPTIONS: AspectRatio[] = ['16:9', '9:16', '1:1', '21:9']

export function detectMediaKind(mimeType: string, name = ''): MediaKind {
  if (mimeType.startsWith('video/')) return 'video'
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['mp4', 'webm', 'mov', 'mkv', 'm4v'].includes(ext)) return 'video'
  return 'picture'
}

export function defaultRoleForKind(kind: MediaKind): ReferenceRole {
  return kind === 'video' ? 'motion_action' : 'subject_appearance'
}

/** Official H3 rule: Picture and Video indexes are independent namespaces. */
export function labelReferences(assets: ReferenceAsset[]): LabeledReference[] {
  let pictureCount = 0
  let videoCount = 0
  return assets.map((asset) => {
    const kind = asset.kind || detectMediaKind(asset.mimeType, asset.name)
    if (kind === 'video') {
      videoCount += 1
      return {
        id: asset.id,
        name: asset.name,
        kind: 'video',
        role: asset.role,
        traits: asset.traits,
        description: asset.description,
        labelIndex: videoCount,
        label: `<Video ${videoCount}>`
      }
    }
    pictureCount += 1
    return {
      id: asset.id,
      name: asset.name,
      kind: 'picture',
      role: asset.role,
      traits: asset.traits,
      description: asset.description,
      labelIndex: pictureCount,
      label: `<Picture ${pictureCount}>`
    }
  })
}

