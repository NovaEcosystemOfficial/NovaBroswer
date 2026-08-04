import { app, BrowserWindow, session, shell, type DownloadItem } from 'electron'
import { basename, join } from 'node:path'
import { randomUUID } from 'node:crypto'

export type DownloadState = 'progressing' | 'completed' | 'cancelled' | 'interrupted'

export type DownloadSnapshot = {
  id: string
  filename: string
  url: string
  savePath: string
  receivedBytes: number
  totalBytes: number
  state: DownloadState
  startedAt: number
  endedAt?: number
}

type DownloadListener = (item: DownloadSnapshot) => void

const activeItems = new Map<string, DownloadItem>()
const startedAtMap = new Map<string, number>()
const listeners = new Set<DownloadListener>()
let registered = false

function toState(raw: string): DownloadState {
  if (raw === 'completed' || raw === 'cancelled' || raw === 'interrupted' || raw === 'progressing') {
    return raw
  }
  return 'progressing'
}

function snapshotFromItem(id: string, item: DownloadItem): DownloadSnapshot {
  const startedAt = startedAtMap.get(id) ?? Date.now()
  const savePath = item.getSavePath()
  const state = toState(item.getState())
  return {
    id,
    filename: basename(savePath || item.getFilename()),
    url: item.getURL(),
    savePath,
    receivedBytes: item.getReceivedBytes(),
    totalBytes: item.getTotalBytes(),
    state,
    startedAt,
    endedAt: state === 'progressing' ? undefined : Date.now(),
  }
}

function emit(snapshot: DownloadSnapshot): void {
  for (const listener of listeners) {
    listener(snapshot)
  }
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('download:update', snapshot)
  }
}

export function onDownloadUpdate(listener: DownloadListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function registerDownloadHandlers(): void {
  if (registered) return
  registered = true

  session.defaultSession.on('will-download', (_event, item) => {
    const id = randomUUID()
    const startedAt = Date.now()
    const filename = item.getFilename()
    item.setSavePath(join(app.getPath('downloads'), filename))

    activeItems.set(id, item)
    startedAtMap.set(id, startedAt)
    emit(snapshotFromItem(id, item))

    item.on('updated', () => {
      emit(snapshotFromItem(id, item))
    })

    item.once('done', () => {
      emit(snapshotFromItem(id, item))
      activeItems.delete(id)
      startedAtMap.delete(id)
    })
  })
}

export function cancelDownload(id: string): boolean {
  const item = activeItems.get(id)
  if (!item) return false
  item.cancel()
  return true
}

export async function openDownload(id: string, savePath: string): Promise<boolean> {
  const item = activeItems.get(id)
  const path = item?.getSavePath() || savePath
  if (!path) return false
  const result = await shell.openPath(path)
  return result === ''
}

export function showDownloadInFolder(id: string, savePath: string): boolean {
  const item = activeItems.get(id)
  const path = item?.getSavePath() || savePath
  if (!path) return false
  shell.showItemInFolder(path)
  return true
}

export function getDownloadsPath(): string {
  return app.getPath('downloads')
}
