import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import app from './app.js'

const originalFetch = globalThis.fetch
const originalAppsScriptUrl = process.env.APPS_SCRIPT_URL
let server
let baseUrl
let forwardedRegistration

const registration = {
  teamName: 'The Spellbinders',
  leaderName: 'Hermione Granger',
  email: 'leader@example.com',
  phone: '1234567890',
  college: 'Hogwarts',
  teamSize: 2,
  member1: 'Ron Weasley',
  member2: '',
  member3: '',
  member4: '',
  house: 'Gryffindor',
  pptBase64: Buffer.from('%PDF-1.4').toString('base64'),
  pptFileName: 'project.pdf',
  pptMimeType: 'application/pdf',
}

before(async () => {
  process.env.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/test/exec'
  globalThis.fetch = async (input, init) => {
    if (String(input).startsWith('https://script.google.com/')) {
      forwardedRegistration = JSON.parse(init.body)
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return originalFetch(input, init)
  }
  server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  globalThis.fetch = originalFetch
  if (originalAppsScriptUrl === undefined) delete process.env.APPS_SCRIPT_URL
  else process.env.APPS_SCRIPT_URL = originalAppsScriptUrl
})

test('validates, relays, and confirms a registration with its Project PPT', async () => {
  const response = await originalFetch(`${baseUrl}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registration),
  })

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { success: true })
  assert.deepEqual(forwardedRegistration, registration)
})

test('rejects invalid team details', async () => {
  const response = await originalFetch(`${baseUrl}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...registration, teamSize: 5 }),
  })

  assert.equal(response.status, 400)
  assert.equal((await response.json()).error, 'Valid team details and a supported Project PPT file are required.')
})

test('rejects a Project PPT whose signature does not match its file type', async () => {
  const response = await originalFetch(`${baseUrl}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...registration, pptBase64: Buffer.from('not a pdf').toString('base64') }),
  })

  assert.equal(response.status, 400)
  assert.equal(
    (await response.json()).error,
    'The Project PPT must be a valid .ppt, .pptx, or .pdf file no larger than 3 MB.',
  )
})

test('rejects a PPT payload larger than 3 MB', async () => {
  const response = await originalFetch(`${baseUrl}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...registration,
      pptBase64: Buffer.concat([
        Buffer.from('%PDF-1.4'),
        Buffer.alloc(3 * 1024 * 1024 - 4),
      ]).toString('base64'),
    }),
  })

  assert.equal(response.status, 400)
  assert.equal(
    (await response.json()).error,
    'The Project PPT must be a valid .ppt, .pptx, or .pdf file no larger than 3 MB.',
  )
})
