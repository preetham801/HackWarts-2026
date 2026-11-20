import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dataFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'shortlisted-teams.json')
const redisKey = 'hackwarts:shortlisted-teams'
let fileWriteQueue = Promise.resolve()

function isVercel() {
  return process.env.VERCEL === '1'
}

async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw Object.assign(new Error('Shortlisted-team storage is not configured for this deployment.'), { status: 503 })
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw Object.assign(new Error('Shortlisted-team storage is temporarily unavailable.'), { status: 503 })
  const body = await response.json()
  if (body.error) throw Object.assign(new Error('Shortlisted-team storage is temporarily unavailable.'), { status: 503 })
  return body.result
}

async function readFileRecords() {
  try {
    return JSON.parse(await readFile(dataFile, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

export async function listShortlistedTeams() {
  if (isVercel()) {
    const result = await redis(['HGETALL', redisKey])
    if (!result) return []
    const entries = Array.isArray(result) ? result : Object.entries(result).flat()
    const records = []
    for (let index = 0; index < entries.length; index += 2) {
      try { records.push(JSON.parse(entries[index + 1])) } catch { /* Ignore malformed legacy rows. */ }
    }
    return records
  }
  return readFileRecords()
}

export async function getShortlistedTeam(id) {
  if (isVercel()) {
    const result = await redis(['HGET', redisKey, id])
    return result ? JSON.parse(result) : undefined
  }
  return (await readFileRecords()).find((team) => team.id === id)
}

export async function saveShortlistedTeam(team) {
  if (isVercel()) {
    await redis(['HSET', redisKey, team.id, JSON.stringify(team)])
    return team
  }
  const write = async () => {
    const records = await readFileRecords()
    const index = records.findIndex((record) => record.id === team.id)
    if (index < 0) records.push(team)
    else records[index] = team
    await mkdir(path.dirname(dataFile), { recursive: true })
    const temporaryFile = `${dataFile}.${process.pid}.tmp`
    await writeFile(temporaryFile, `${JSON.stringify(records, null, 2)}\n`, 'utf8')
    await rename(temporaryFile, dataFile)
    return team
  }
  const result = fileWriteQueue.then(write, write)
  fileWriteQueue = result.then(() => undefined, () => undefined)
  return result
}
