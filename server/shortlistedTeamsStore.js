import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const localDataFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'shortlisted-teams.json')
const vercelFallbackFile = path.join(os.tmpdir(), 'shortlisted-teams.json')
const redisKey = 'hackwarts:shortlisted-teams'
let fileWriteQueue = Promise.resolve()
let warnedAboutEphemeralStore = false

function isVercel() {
  return process.env.VERCEL === '1'
}

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || process.env.KV_REST_API_READ_WRITE_TOKEN
  return url && token ? { url, token } : undefined
}

async function redis(command) {
  const config = getRedisConfig()
  if (!config) throw new Error('Redis storage is not configured.')
  const response = await fetch(config.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error('Redis storage is temporarily unavailable.')
  const body = await response.json()
  if (body.error) throw new Error('Redis storage is temporarily unavailable.')
  return body.result
}

async function appsScriptAction(action, values = {}) {
  const url = process.env.APPS_SCRIPT_URL
  const secret = process.env.APPS_SCRIPT_STORAGE_SECRET
  const enabled = process.env.APPS_SCRIPT_SHORTLIST_STORAGE_ENABLED === '1'
  if (!url || !secret || !enabled) throw new Error('Apps Script shortlist storage is not enabled.')

  const response = await fetch(url, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, storageSecret: secret, ...values }),
    signal: AbortSignal.timeout(10000),
  })
  const raw = (await response.text()).trim()
  let body
  try {
    body = JSON.parse(raw)
  } catch {
    throw new Error('Apps Script does not have the shortlist storage handler deployed.')
  }
  if (!response.ok || body?.success !== true || body?.storageVersion !== 'hackwarts-shortlist-v1') {
    throw new Error(typeof body?.error === 'string' ? body.error : 'Apps Script shortlist storage is unavailable.')
  }
  return body
}

function fallbackFile() {
  return isVercel() ? vercelFallbackFile : localDataFile
}

async function readFileRecords() {
  try {
    const records = JSON.parse(await readFile(fallbackFile(), 'utf8'))
    return Array.isArray(records) ? records : []
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

function logFallback(source, error) {
  console.warn(`${source} shortlist storage unavailable; using the next configured store.`, error.message)
}

function warnAboutEphemeralStore() {
  if (isVercel() && !warnedAboutEphemeralStore) {
    console.warn('No durable shortlist store responded; using ephemeral /tmp storage for this function instance.')
    warnedAboutEphemeralStore = true
  }
}

async function listFromVercelStore() {
  if (process.env.APPS_SCRIPT_URL && process.env.APPS_SCRIPT_STORAGE_SECRET && process.env.APPS_SCRIPT_SHORTLIST_STORAGE_ENABLED === '1') {
    try {
      const result = await appsScriptAction('shortlist_list')
      return Array.isArray(result.teams) ? result.teams : []
    } catch (error) {
      logFallback('Apps Script', error)
    }
  }

  if (getRedisConfig()) {
    try {
      const result = await redis(['HGETALL', redisKey])
      if (!result) return []
      const entries = Array.isArray(result) ? result : Object.entries(result).flat()
      const records = []
      for (let index = 0; index < entries.length; index += 2) {
        try { records.push(JSON.parse(entries[index + 1])) } catch { /* Ignore malformed legacy rows. */ }
      }
      return records
    } catch (error) {
      logFallback('Redis', error)
    }
  }

  warnAboutEphemeralStore()
  return readFileRecords()
}

async function saveToVercelStore(teams) {
  if (process.env.APPS_SCRIPT_URL && process.env.APPS_SCRIPT_STORAGE_SECRET && process.env.APPS_SCRIPT_SHORTLIST_STORAGE_ENABLED === '1') {
    try {
      if (teams.length === 1) await appsScriptAction('shortlist_upsert', { team: teams[0] })
      else await appsScriptAction('shortlist_bulk_upsert', { teams })
      return true
    } catch (error) {
      logFallback('Apps Script', error)
    }
  }

  if (getRedisConfig()) {
    try {
      const command = ['HSET', redisKey]
      for (const team of teams) command.push(team.id, JSON.stringify(team))
      await redis(command)
      return true
    } catch (error) {
      logFallback('Redis', error)
    }
  }

  warnAboutEphemeralStore()
}

async function saveToFile(teams) {
  const records = await readFileRecords()
  const byId = new Map(records.map((record) => [record.id, record]))
  for (const team of teams) byId.set(team.id, team)
  const file = fallbackFile()
  await mkdir(path.dirname(file), { recursive: true })
  const temporaryFile = `${file}.${process.pid}.tmp`
  await writeFile(temporaryFile, `${JSON.stringify([...byId.values()], null, 2)}\n`, 'utf8')
  await rename(temporaryFile, file)
}

export async function listShortlistedTeams() {
  if (isVercel()) return listFromVercelStore()
  return readFileRecords()
}

export async function getShortlistedTeam(id) {
  if (isVercel() && getRedisConfig() && !(process.env.APPS_SCRIPT_URL && process.env.APPS_SCRIPT_STORAGE_SECRET && process.env.APPS_SCRIPT_SHORTLIST_STORAGE_ENABLED === '1')) {
    try {
      const result = await redis(['HGET', redisKey, id])
      return result ? JSON.parse(result) : undefined
    } catch (error) {
      logFallback('Redis', error)
    }
  }
  return (await listShortlistedTeams()).find((team) => team.id === id)
}

export async function saveShortlistedTeam(team) {
  return saveShortlistedTeams([team]).then(() => team)
}

export async function saveShortlistedTeams(teams) {
  if (teams.length === 0) return
  if (isVercel() && await saveToVercelStore(teams)) return

  const write = () => saveToFile(teams)
  const result = fileWriteQueue.then(write, write)
  fileWriteQueue = result.then(() => undefined, () => undefined)
  return result
}
