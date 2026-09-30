import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type {
  AppSettings,
  BrainstormIdea,
  BrainstormRequest,
  ConnectionStatus,
  GenerateRequest,
  ImagePromptRequest,
  ImagePromptResult,
  LibraryEntry,
  ModelInfo
} from '../shared/types'

const api = {
  getPathForFile(file: File): string {
    try {
      return webUtils.getPathForFile(file)
    } catch {
      return ''
    }
  },
  getSettings(): Promise<AppSettings> {
    return ipcRenderer.invoke('settings:get')
  },
  setSettings(settings: AppSettings): Promise<AppSettings> {
    return ipcRenderer.invoke('settings:set', settings)
  },
  probeStatus(): Promise<ConnectionStatus> {
    return ipcRenderer.invoke('status:probe')
  },
  listModels(): Promise<ModelInfo[]> {
    return ipcRenderer.invoke('models:list')
  },
  quitApp(): Promise<void> {
    return ipcRenderer.invoke('app:quit')
  },
  unloadModel(): Promise<{ ok: boolean; message: string }> {
    return ipcRenderer.invoke('model:unload')
  },
  startGenerate(request: GenerateRequest): Promise<string | null> {
    return ipcRenderer.invoke('generate:start', request)
  },
  stopGenerate(): Promise<boolean> {
    return ipcRenderer.invoke('generate:stop')
  },
  onGenerateChunk(cb: (chunk: string) => void): () => void {
    const listener = (_: Electron.IpcRendererEvent, chunk: string): void => cb(chunk)
    ipcRenderer.on('generate:chunk', listener)
    return () => ipcRenderer.removeListener('generate:chunk', listener)
  },
  onGenerateStatus(cb: (status: string) => void): () => void {
    const listener = (_: Electron.IpcRendererEvent, status: string): void => cb(status)
    ipcRenderer.on('generate:status', listener)
    return () => ipcRenderer.removeListener('generate:status', listener)
  },
  onGenerateDone(cb: (full: string | null) => void): () => void {
    const listener = (_: Electron.IpcRendererEvent, full: string | null): void => cb(full)
    ipcRenderer.on('generate:done', listener)
    return () => ipcRenderer.removeListener('generate:done', listener)
  },
  onGenerateError(cb: (message: string) => void): () => void {
    const listener = (_: Electron.IpcRendererEvent, message: string): void => cb(message)
    ipcRenderer.on('generate:error', listener)
    return () => ipcRenderer.removeListener('generate:error', listener)
  },
  compileImagePrompt(request: ImagePromptRequest): Promise<ImagePromptResult> {
    return ipcRenderer.invoke('image:compile', request)
  },
  startImageGenerate(request: ImagePromptRequest): Promise<string | null> {
    return ipcRenderer.invoke('image-generate:start', request)
  },
  stopImageGenerate(): Promise<boolean> {
    return ipcRenderer.invoke('image-generate:stop')
  },
  onImageGenerateChunk(cb: (chunk: string) => void): () => void {
    const listener = (_: Electron.IpcRendererEvent, chunk: string): void => cb(chunk)
    ipcRenderer.on('image-generate:chunk', listener)
    return () => ipcRenderer.removeListener('image-generate:chunk', listener)
  },
  onImageGenerateStatus(cb: (status: string) => void): () => void {
    const listener = (_: Electron.IpcRendererEvent, status: string): void => cb(status)
    ipcRenderer.on('image-generate:status', listener)
    return () => ipcRenderer.removeListener('image-generate:status', listener)
  },
  onImageGenerateDone(cb: (full: string | null) => void): () => void {
    const listener = (_: Electron.IpcRendererEvent, full: string | null): void => cb(full)
    ipcRenderer.on('image-generate:done', listener)
    return () => ipcRenderer.removeListener('image-generate:done', listener)
  },
  onImageGenerateError(cb: (message: string) => void): () => void {
    const listener = (_: Electron.IpcRendererEvent, message: string): void => cb(message)
    ipcRenderer.on('image-generate:error', listener)
    return () => ipcRenderer.removeListener('image-generate:error', listener)
  },
  brainstormMemeIdeas(request: BrainstormRequest): Promise<BrainstormIdea[]> {
    return ipcRenderer.invoke('image:brainstorm', request)
  },
  describeImage(payload: {
    dataUrl: string
    name: string
    settings: AppSettings
  }): Promise<string> {
    return ipcRenderer.invoke('vision:describe', payload)
  },
  listLibrary(): Promise<LibraryEntry[]> {
    return ipcRenderer.invoke('library:list')
  },
  saveLibraryEntry(
    entry: Omit<LibraryEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<LibraryEntry> {
    return ipcRenderer.invoke('library:save', entry)
  },
  deleteLibraryEntry(id: string): Promise<LibraryEntry[]> {
    return ipcRenderer.invoke('library:delete', id)
  },
  saveTextFile(payload: { defaultName: string; content: string }): Promise<boolean> {
    return ipcRenderer.invoke('dialog:saveText', payload)
  },
  openImages(): Promise<
    Array<{ path: string; name: string; mimeType: string; dataUrl: string }>
  > {
    return ipcRenderer.invoke('dialog:openImages')
  }
}

contextBridge.exposeInMainWorld('h3', api)

export type H3Api = typeof api
