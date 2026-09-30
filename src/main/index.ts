import { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } from 'electron'
import { join } from 'path'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { randomUUID } from 'crypto'
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type BrainstormIdea,
  type BrainstormRequest,
  type ConnectionStatus,
  type GenerateRequest,
  type ImagePromptRequest,
  type ImagePromptResult,
  type LibraryEntry,
  type ModelInfo
} from '../shared/types'
import {
  buildGoogleFlowSystemPrompt,
  buildGoogleFlowUserPrompt,
  buildSystemPrompt,
  buildUserPrompt
} from '../shared/systemPrompt'
import {
  buildBrainstormSystemPrompt,
  buildBrainstormUserPrompt,
  buildImageSystemPrompt,
  buildImageUserPrompt,
  compileInstantImagePrompt,
  parseBrainstormResponse
} from '../shared/imagePromptSystem'

nativeTheme.themeSource = 'dark'

let mainWindow: BrowserWindow | null = null
let abortController: AbortController | null = null
let imageAbortController: AbortController | null = null

function dataDir(): string {
  return join(app.getPath('userData'), 'cutroom')
}

function settingsPath(): string {
  return join(dataDir(), 'settings.json')
}

function libraryPath(): string {
  return join(dataDir(), 'library.json')
}

async function ensureDataDir(): Promise<void> {
  if (!existsSync(dataDir())) {
    await mkdir(dataDir(), { recursive: true })
  }
}

async function loadSettings(): Promise<AppSettings> {
  await ensureDataDir()
  try {
    const raw = await readFile(settingsPath(), 'utf-8')
    const loaded = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AppSettings
    // Cutroom's distributable build is local-only. Migrate any former cloud selection
    // back to Ollama and remove saved cloud credentials from the active settings file.
    if (loaded.backend === 'qwencloud' || loaded.backend === 'openrouter') {
      loaded.backend = 'ollama'
      loaded.model = DEFAULT_SETTINGS.model
      loaded.visionModel = DEFAULT_SETTINGS.visionModel
      loaded.qwenCloudApiKey = ''
      loaded.openRouterApiKey = ''
      await saveSettings(loaded)
    }
    return loaded
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  await ensureDataDir()
  await writeFile(settingsPath(), JSON.stringify(settings, null, 2), 'utf-8')
  return settings
}

async function loadLibrary(): Promise<LibraryEntry[]> {
  await ensureDataDir()
  try {
    const raw = await readFile(libraryPath(), 'utf-8')
    return JSON.parse(raw) as LibraryEntry[]
  } catch {
    return []
  }
}

async function saveLibrary(entries: LibraryEntry[]): Promise<LibraryEntry[]> {
  await ensureDataDir()
  await writeFile(libraryPath(), JSON.stringify(entries, null, 2), 'utf-8')
  return entries
}

function baseUrl(settings: AppSettings): string {
  if (settings.backend === 'ollama') return settings.ollamaUrl.replace(/\/$/, '')
  if (settings.backend === 'qwencloud') return settings.qwenCloudUrl.replace(/\/$/, '')
  if (settings.backend === 'openrouter') return 'https://openrouter.ai/api/v1'
  return settings.lmstudioUrl.replace(/\/$/, '')
}

function apiHeaders(settings: AppSettings): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(settings.backend === 'qwencloud' && settings.qwenCloudApiKey
      ? { Authorization: `Bearer ${settings.qwenCloudApiKey}` }
      : {}),
    ...(settings.backend === 'openrouter' && settings.openRouterApiKey
      ? { Authorization: `Bearer ${settings.openRouterApiKey}` }
      : {})
  }
}

async function fetchOllamaModels(url: string): Promise<ModelInfo[]> {
  const res = await fetch(`${url}/api/tags`)
  if (!res.ok) throw new Error(`Ollama ${res.status}`)
  const data = (await res.json()) as { models?: Array<{ name: string; size?: number }> }
  return (data.models ?? []).map((m) => ({
    id: m.name,
    name: m.name,
    size: m.size ? `${(m.size / 1e9).toFixed(1)} GB` : undefined,
    backend: 'ollama' as const
  }))
}

async function fetchOpenAIModels(settings: AppSettings): Promise<ModelInfo[]> {
  if (settings.backend === 'qwencloud' && !settings.qwenCloudApiKey) {
    throw new Error('Enter your Qwen Token Plan API key (sk-sp-…) in Settings')
  }
  if (settings.backend === 'openrouter' && !settings.openRouterApiKey) {
    throw new Error('Enter your OpenRouter API key in Settings')
  }
  const res = await fetch(`${baseUrl(settings)}/models`, { headers: apiHeaders(settings) })
  if (!res.ok) throw new Error(`${settings.backend === 'qwencloud' ? 'Qwen Cloud' : settings.backend === 'openrouter' ? 'OpenRouter' : 'LM Studio'} ${res.status}`)
  const data = (await res.json()) as { data?: Array<{ id: string }> }
  return (data.data ?? []).map((m) => ({
    id: m.id,
    name: m.id,
    backend: settings.backend
  }))
}

async function probeStatus(settings: AppSettings): Promise<ConnectionStatus> {
  try {
    const models =
      settings.backend === 'ollama'
        ? await fetchOllamaModels(baseUrl(settings))
        : await fetchOpenAIModels(settings)

    const preferred =
      models.find((m) => m.id === settings.model)?.id ??
      models.find((m) => m.id === 'qwen3.8-max')?.id ??
      models.find((m) => /qwen/i.test(m.id))?.id ??
      models[0]?.id ??
      ''

    return {
      online: models.length > 0,
      backend: settings.backend,
      model: preferred,
      message: preferred ? `${settings.backend === 'ollama' ? 'Ollama' : 'LM Studio'} ready` : 'Connected — pick a model',
      models
    }
  } catch (err) {
    return {
      online: false,
      backend: settings.backend,
      model: settings.model,
      message: err instanceof Error ? err.message : 'Offline',
      models: []
    }
  }
}

async function streamOllama(
  settings: AppSettings,
  system: string,
  user: string,
  signal: AbortSignal,
  onChunk: (text: string) => void,
  onStatus?: (status: string) => void
): Promise<string> {
  onStatus?.('Contacting Ollama…')
  const res = await fetch(`${baseUrl(settings)}/api/chat`, {
    method: 'POST',
    headers: apiHeaders(settings),
    signal,
    body: JSON.stringify({
      model: settings.model,
      stream: true,
      // Qwen3.x defaults to long silent "thinking" — keep it off for prompt crafting
      think: settings.enableThinking,
      options: {
        temperature: settings.temperature,
        num_predict: settings.maxTokens,
        // Model card defaults to 128K ctx which stalls 24GB cards — keep prompts fast
        num_ctx: Math.min(settings.numCtx || 4096, 8192)
      },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  })

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '')
    if (/out of memory|cudaMalloc|failed to allocate/i.test(detail)) {
      throw new Error(
        'GPU out of memory. Click Unload Model, close other GPU apps, and retry. On RTX A4500 (20GB) prefer Q3_K_M / smaller quant, Context 4096, Thinking OFF.'
      )
    }
    throw new Error(`Ollama generate failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`)
  }

  onStatus?.('Waiting for first token…')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''
  let buffer = ''
  let sawContent = false
  let thinkingChars = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        const json = JSON.parse(trimmed) as {
          message?: { content?: string; thinking?: string }
          done?: boolean
          error?: string
        }
        if (json.error) throw new Error(json.error)

        const thinking = json.message?.thinking ?? ''
        if (thinking) {
          thinkingChars += thinking.length
          onStatus?.(`Model thinking… ${thinkingChars} chars (enable Thinking in Settings to show it)`)
        }

        const piece = json.message?.content ?? ''
        if (piece) {
          if (!sawContent) {
            sawContent = true
            onStatus?.('Writing prompt…')
          }
          full += piece
          onChunk(piece)
        }
      } catch (err) {
        if (err instanceof Error && err.message && !err.message.includes('JSON')) throw err
        // skip partial json
      }
    }
  }

  if (!full.trim()) {
    throw new Error(
      'Model finished with empty output. For Qwen3.x keep Thinking OFF, Context at 8192, and Stop any stuck job first.'
    )
  }

  return full
}

async function streamOpenAI(
  settings: AppSettings,
  system: string,
  user: string,
  signal: AbortSignal,
  onChunk: (text: string) => void
): Promise<string> {
  if (settings.backend === 'qwencloud' && !settings.qwenCloudApiKey) {
    throw new Error('Enter your Qwen Token Plan API key (sk-sp-…) in Settings')
  }
  if (settings.backend === 'openrouter' && !settings.openRouterApiKey) {
    throw new Error('Enter your OpenRouter API key in Settings')
  }
  const res = await fetch(`${baseUrl(settings)}/chat/completions`, {
    method: 'POST',
    headers: apiHeaders(settings),
    signal,
    body: JSON.stringify({
      model: settings.model,
      stream: true,
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
      ...(settings.backend === 'qwencloud' ? { enable_thinking: settings.enableThinking } : {}),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  })

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '')
    throw new Error(`${settings.backend === 'qwencloud' ? 'Qwen Cloud' : settings.backend === 'openrouter' ? 'OpenRouter' : 'LM Studio'} generate failed (${res.status})${detail ? `: ${detail.slice(0, 180)}` : ''}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n')
    buffer = parts.pop() ?? ''
    for (const line of parts) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (payload === '[DONE]') continue
      try {
        const json = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>
        }
        const piece = json.choices?.[0]?.delta?.content ?? ''
        if (piece) {
          full += piece
          onChunk(piece)
        }
      } catch {
        // skip
      }
    }
  }

  return full
}

async function describeImage(
  settings: AppSettings,
  dataUrl: string,
  name: string
): Promise<string> {
  const visionModel = settings.visionModel || settings.model
  if (!visionModel) throw new Error('No vision model selected')

  const prompt =
    'Describe this reference image for video prompt engineering. Cover subject identity, wardrobe, pose, environment, lighting, color palette, and composition. Be concrete and compact (80-140 words).'

  if (settings.backend === 'ollama') {
    const res = await fetch(`${baseUrl(settings)}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: visionModel,
        stream: false,
        messages: [
          {
            role: 'user',
            content: prompt,
            images: [dataUrl.replace(/^data:image\/\w+;base64,/, '')]
          }
        ]
      })
    })
    if (!res.ok) throw new Error(`Vision describe failed (${res.status})`)
    const data = (await res.json()) as { message?: { content?: string } }
    return data.message?.content?.trim() || `Reference still: ${name}`
  }

  const res = await fetch(`${baseUrl(settings)}/chat/completions`, {
    method: 'POST',
    headers: apiHeaders(settings),
    body: JSON.stringify({
      model: visionModel,
      temperature: 0.2,
      max_tokens: 400,
      ...(settings.backend === 'qwencloud' ? { enable_thinking: false } : {}),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }
      ]
    })
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Vision describe failed (${res.status})${detail ? `: ${detail.slice(0, 180)}` : ''}`)
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return data.choices?.[0]?.message?.content?.trim() || `Reference still: ${name}`
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#1a120c',
    show: false,
    title: 'Cutroom',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpc(): void {
  ipcMain.handle('settings:get', async () => loadSettings())
  ipcMain.handle('settings:set', async (_e, settings: AppSettings) => saveSettings(settings))

  ipcMain.handle('status:probe', async () => {
    const settings = await loadSettings()
    const status = await probeStatus(settings)
    if (status.online && status.model && status.model !== settings.model) {
      settings.model = status.model
      await saveSettings(settings)
    }
    return status
  })

  ipcMain.handle('models:list', async () => {
    const settings = await loadSettings()
    const status = await probeStatus(settings)
    return status.models
  })

  ipcMain.handle('app:quit', () => {
    app.quit()
  })

  ipcMain.handle('model:unload', async () => {
    const settings = await loadSettings()
    if (settings.backend !== 'ollama' || !settings.model) {
      return { ok: false, message: 'Unload is supported for Ollama models.' }
    }
    try {
      await fetch(`${baseUrl(settings)}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: settings.model, keep_alive: 0, prompt: '' })
      })
      // Also kill leaked llama-server children that can hold VRAM after OOM
      try {
        const { execFile } = await import('child_process')
        const { promisify } = await import('util')
        const execFileAsync = promisify(execFile)
        if (process.platform === 'win32') {
          await execFileAsync('taskkill', ['/IM', 'llama-server.exe', '/F'], { windowsHide: true })
        }
      } catch {
        // ignore if not running
      }
      return { ok: true, message: `Unloaded ${settings.model} (VRAM cleared)` }
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : 'Unload failed'
      }
    }
  })

  ipcMain.handle('generate:stop', () => {
    abortController?.abort()
    abortController = null
    return true
  })

  ipcMain.handle('generate:start', async (event, request: GenerateRequest) => {
    abortController?.abort()
    abortController = new AbortController()
    const settings = { ...request.settings }
    await saveSettings(settings)

    if (!settings.model) {
      throw new Error('No model selected. Choose a model in Settings.')
    }

    const isFlow = request.target === 'google_flow_omni'
    const system = isFlow
      ? buildGoogleFlowSystemPrompt(request.flowMode, request.duration, request.aspect)
      : buildSystemPrompt(request.workflow, request.duration, request.aspect)
    const user = isFlow ? buildGoogleFlowUserPrompt(request) : buildUserPrompt(request)

    const onChunk = (text: string): void => {
      event.sender.send('generate:chunk', text)
    }
    const onStatus = (status: string): void => {
      event.sender.send('generate:status', status)
    }

    try {
      onStatus('Starting generation…')
      const full =
        settings.backend === 'ollama'
          ? await streamOllama(settings, system, user, abortController.signal, onChunk, onStatus)
          : await streamOpenAI(settings, system, user, abortController.signal, onChunk)
      event.sender.send('generate:done', full)
      return full
    } catch (err) {
      if (abortController?.signal.aborted) {
        event.sender.send('generate:done', null)
        return null
      }
      const message = err instanceof Error ? err.message : 'Generation failed'
      event.sender.send('generate:error', message)
      throw err
    } finally {
      abortController = null
    }
  })

  ipcMain.handle('image:compile', async (_event, request: ImagePromptRequest): Promise<ImagePromptResult> => {
    return compileInstantImagePrompt(request)
  })

  ipcMain.handle('image-generate:stop', () => {
    imageAbortController?.abort()
    imageAbortController = null
    return true
  })

  ipcMain.handle('image-generate:start', async (event, request: ImagePromptRequest) => {
    imageAbortController?.abort()
    imageAbortController = new AbortController()
    const settings = { ...request.settings }
    await saveSettings(settings)

    if (!settings.model) {
      throw new Error('No model selected. Choose a model in Settings.')
    }

    const system = buildImageSystemPrompt()
    const user = buildImageUserPrompt(request)

    const onChunk = (text: string): void => {
      event.sender.send('image-generate:chunk', text)
    }
    const onStatus = (status: string): void => {
      event.sender.send('image-generate:status', status)
    }

    try {
      onStatus('Crafting viral image prompt package…')
      const full =
        settings.backend === 'ollama'
          ? await streamOllama(settings, system, user, imageAbortController.signal, onChunk, onStatus)
          : await streamOpenAI(settings, system, user, imageAbortController.signal, onChunk)
      event.sender.send('image-generate:done', full)
      return full
    } catch (err) {
      if (imageAbortController?.signal.aborted) {
        event.sender.send('image-generate:done', null)
        return null
      }
      const message = err instanceof Error ? err.message : 'Image prompt generation failed'
      event.sender.send('image-generate:error', message)
      throw err
    } finally {
      imageAbortController = null
    }
  })

  ipcMain.handle('image:brainstorm', async (_event, request: BrainstormRequest): Promise<BrainstormIdea[]> => {
    const settings = { ...request.settings }
    await saveSettings(settings)

    if (!settings.model) {
      return parseBrainstormResponse('')
    }

    const system = buildBrainstormSystemPrompt()
    const user = buildBrainstormUserPrompt(request)
    const signal = AbortSignal.timeout(35000)

    try {
      let full = ''
      if (settings.backend === 'ollama') {
        const res = await fetch(`${baseUrl(settings)}/api/chat`, {
          method: 'POST',
          headers: apiHeaders(settings),
          signal,
          body: JSON.stringify({
            model: settings.model,
            stream: false,
            think: false,
            options: {
              temperature: 0.85,
              num_predict: 2048,
              num_ctx: Math.min(settings.numCtx || 4096, 8192)
            },
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user }
            ]
          })
        })
        if (!res.ok) throw new Error(`Ollama brainstorm failed (${res.status})`)
        const data = (await res.json()) as { message?: { content?: string } }
        full = data.message?.content || ''
      } else {
        const res = await fetch(`${baseUrl(settings)}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            model: settings.model,
            temperature: 0.85,
            max_tokens: 2048,
            ...(settings.backend === 'qwencloud' ? { enable_thinking: false } : {}),
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user }
            ]
          })
        })
        if (!res.ok) throw new Error(`${settings.backend === 'qwencloud' ? 'Qwen Cloud' : 'LM Studio'} brainstorm failed (${res.status})`)
        const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
        full = data.choices?.[0]?.message?.content || ''
      }
      return parseBrainstormResponse(full)
    } catch {
      return parseBrainstormResponse('')
    }
  })

  ipcMain.handle(
    'vision:describe',
    async (_e, payload: { dataUrl: string; name: string; settings: AppSettings }) => {
      await saveSettings(payload.settings)
      return describeImage(payload.settings, payload.dataUrl, payload.name)
    }
  )

  ipcMain.handle('library:list', async () => loadLibrary())

  ipcMain.handle('library:save', async (_e, entry: Omit<LibraryEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const list = await loadLibrary()
    const now = new Date().toISOString()
    if (entry.id) {
      const idx = list.findIndex((x) => x.id === entry.id)
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...entry, id: entry.id, updatedAt: now }
        await saveLibrary(list)
        return list[idx]
      }
    }
    const created: LibraryEntry = {
      ...entry,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now
    }
    list.unshift(created)
    await saveLibrary(list)
    return created
  })

  ipcMain.handle('library:delete', async (_e, id: string) => {
    const next = (await loadLibrary()).filter((x) => x.id !== id)
    await saveLibrary(next)
    return next
  })

  ipcMain.handle('dialog:saveText', async (_e, payload: { defaultName: string; content: string }) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: 'Download prompt',
      defaultPath: payload.defaultName,
      filters: [{ name: 'Text', extensions: ['txt'] }]
    })
    if (result.canceled || !result.filePath) return false
    await writeFile(result.filePath, payload.content, 'utf-8')
    return true
  })

  ipcMain.handle('dialog:openImages', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: 'Add visual references',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Media', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'mp4', 'webm', 'mov'] }
      ]
    })
    if (result.canceled) return []

    const files = []
    for (const filePath of result.filePaths) {
      const buf = await readFile(filePath)
      const ext = filePath.split('.').pop()?.toLowerCase() ?? 'png'
      const mime =
        ext === 'png'
          ? 'image/png'
          : ext === 'webp'
            ? 'image/webp'
            : ext === 'gif'
              ? 'image/gif'
              : ext === 'mp4'
                ? 'video/mp4'
                : ext === 'webm'
                  ? 'video/webm'
                  : ext === 'mov'
                    ? 'video/quicktime'
                    : 'image/jpeg'
      const name = filePath.split(/[/\\]/).pop() ?? 'reference'
      files.push({
        path: filePath,
        name,
        mimeType: mime,
        dataUrl: `data:${mime};base64,${buf.toString('base64')}`
      })
    }
    return files
  })
}

app.whenReady().then(() => {
  registerIpc()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
