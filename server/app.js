import 'dotenv/config'
import express from 'express'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const maxPptBytes = 3 * 1024 * 1024
const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
const allowedPptTypes = new Map([
  ['.ppt', 'application/vnd.ms-powerpoint'],
  ['.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  ['.pdf', 'application/pdf'],
])

function hasExpectedFileSignature(buffer, extension) {
  if (extension === '.pdf') return buffer.subarray(0, 5).toString() === '%PDF-'
  if (extension === '.ppt') return buffer.subarray(0, 8).equals(Buffer.from('D0CF11E0A1B11AE1', 'hex'))
  return buffer.subarray(0, 4).equals(Buffer.from('504B0304', 'hex'))
}

app.use(express.json({ limit: '6mb' }))

app.post('/api/register', async (request, response) => {
  const {
    teamName,
    leaderName,
    email,
    phone,
    college,
    teamSize,
    member1,
    member2,
    member3,
    member4,
    house,
    pptBase64,
    pptFileName,
    pptMimeType,
  } = request.body ?? {}

  const requiredTextFields = [teamName, leaderName, college]
  const optionalTextFields = [member1, member2, member3, member4, house]
  if (
    !requiredTextFields.every((value) => typeof value === 'string' && value.trim().length > 0) ||
    typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof phone !== 'string' || !/^\d{10}$/.test(phone) ||
    !Number.isInteger(teamSize) || teamSize < 2 || teamSize > 4 ||
    !optionalTextFields.every((value) => typeof value === 'string') ||
    !['', 'Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'].includes(house) ||
    typeof pptFileName !== 'string' || !/^[^\\/:*?"<>|]+\.(ppt|pptx|pdf)$/i.test(pptFileName) ||
    typeof pptBase64 !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(pptBase64) ||
    typeof pptMimeType !== 'string'
  ) {
    response.status(400).json({ error: 'Valid team details and a supported Project PPT file are required.' })
    return
  }

  const pptBuffer = Buffer.from(pptBase64, 'base64')
  const pptExtension = path.extname(pptFileName).toLowerCase()
  if (
    pptBuffer.length === 0 ||
    pptBuffer.length > maxPptBytes ||
    pptBuffer.toString('base64') !== pptBase64 ||
    allowedPptTypes.get(pptExtension) !== pptMimeType ||
    !hasExpectedFileSignature(pptBuffer, pptExtension)
  ) {
    response.status(400).json({ error: 'The Project PPT must be a valid .ppt, .pptx, or .pdf file no larger than 3 MB.' })
    return
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL
  if (!appsScriptUrl) {
    response.status(503).json({ error: 'Google Sheets submission is not configured on the server.' })
    return
  }

  let appsScriptTarget
  try {
    const target = new URL(appsScriptUrl)
    if (target.protocol !== 'https:' || target.hostname !== 'script.google.com') {
      throw new Error('Unsupported Google Apps Script URL.')
    }
    appsScriptTarget = `${target.origin}${target.pathname}`
  } catch {
    response.status(503).json({ error: 'Google Sheets URL must be a valid HTTPS Apps Script deployment URL.' })
    return
  }

  console.info(`Posting registration to Google Apps Script: ${appsScriptTarget}`)

  let appsScriptResponse
  try {
    appsScriptResponse = await fetch(appsScriptUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamName: teamName.trim(),
        leaderName: leaderName.trim(),
        email: email.trim(),
        phone,
        college: college.trim(),
        teamSize,
        member1: member1.trim(),
        member2: member2.trim(),
        member3: member3.trim(),
        member4: member4.trim(),
        house,
        pptBase64,
        pptFileName,
        pptMimeType,
      }),
      signal: AbortSignal.timeout(20000),
    })
  } catch (error) {
    const timedOut = error.name === 'TimeoutError'
    response.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? 'Google Apps Script did not respond in time. Please contact the event organizers before retrying.'
        : 'Could not reach Google Apps Script. Please try again or contact the event organizers.',
    })
    return
  }

  if (!appsScriptResponse.ok) {
    const finalUrl = new URL(appsScriptResponse.url)
    const finalTarget = `${finalUrl.origin}${finalUrl.pathname}`
    console.error(`Google Apps Script returned HTTP ${appsScriptResponse.status} at ${finalTarget}.`)
    response.status(502).json({
      error: `Google Apps Script returned HTTP ${appsScriptResponse.status} at ${finalTarget}. Confirm that the deployment exists, is set to execute as you, and allows access to anyone.`,
    })
    return
  }

  const resultText = (await appsScriptResponse.text()).trim()
  let result
  try {
    result = JSON.parse(resultText)
  } catch {
    response.status(502).json({
      error: 'Google Apps Script did not confirm the registration. Make its doPost handler return JSON { "success": true } after saving the PPT and sending the confirmation email.',
    })
    return
  }

  if (result?.success !== true) {
    response.status(502).json({
      error: typeof result?.error === 'string'
        ? `Google Apps Script could not complete the registration: ${result.error}`
        : 'Google Apps Script did not confirm the registration.',
    })
    return
  }

  response.json({ success: true })
})

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'API endpoint not found.' })
})

if (existsSync(path.join(webRoot, 'index.html'))) {
  app.use(express.static(webRoot))
  app.get('*path', (_request, response) => {
    response.sendFile(path.join(webRoot, 'index.html'))
  })
}

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({ error: 'Request body must be valid JSON.' })
    return
  }
  if (error?.type === 'entity.too.large') {
    response.status(413).json({ error: 'The registration request is too large. Project PPT files must be 3 MB or smaller.' })
    return
  }
  console.error('Unhandled API error.')
  response.status(500).json({ error: 'An unexpected server error occurred.' })
})

export default app
