import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { PDFDocument } from 'pdf-lib'
import app from './app.js'
import { generateCertificatePdf } from './paymentMailer.js'

const originalFetch = globalThis.fetch
const originalAppsScriptUrl = process.env.APPS_SCRIPT_URL
const originalAppsScriptSecret = process.env.APPS_SCRIPT_STORAGE_SECRET
let server
let baseUrl
let forwardedFeedback

const validFeedback = {
  participantName: 'Minerva McGonagall',
  email: 'minerva@example.com',
  teamName: 'The Transfigurers',
  leaderName: 'Minerva McGonagall',
  domain: 'EdTech & FinTech',
  hearAbout: 'College / Institution',
  overallExperience: 5,
  hackathonExperience: 4,
  evaluationTransparency: 5,
  venueFacilities: 4,
  mentorSessionRating: 5,
  mentorFeedbackUsefulness: 4,
  evaluation1Rating: 5,
  evaluation2Rating: 4,
  evaluation3Rating: 5,
  futureImprovements: 'More workshops, please.',
  branchSemester: 'CSE 5th Sem',
  whatsappPhone: '+91 98765 43210',
  projectName: 'Spellbook Studio',
  gitworkExperience: 5,
  gitworkUsefulFeatures: ['Visual Commit Graph & Branch Tree', 'Stashing, Branching & Rebase'],
  gitworkTimeSaved: 'Yes, it saved us a lot of time on Git conflicts and demoing',
  gitworkIssues: 'None',
  gitworkSessionAttendance: 'Yes, definitely! Send me the meeting invitation on WhatsApp and Email.',
  gitworkLicenseInterest: 'I will decide after attending the free workshop.',
  gitworkRecommend: 'Yes, absolutely!',
}

before(async () => {
  process.env.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/feedback-test/exec'
  process.env.APPS_SCRIPT_STORAGE_SECRET = 'feedback-test-secret'
  globalThis.fetch = async (input, init) => {
    if (String(input).startsWith('https://script.google.com/')) {
      forwardedFeedback = JSON.parse(init.body)
      return new Response(JSON.stringify({ success: false, error: 'That team name is not in the confirmed paid roster.' }), {
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
  if (originalAppsScriptSecret === undefined) delete process.env.APPS_SCRIPT_STORAGE_SECRET
  else process.env.APPS_SCRIPT_STORAGE_SECRET = originalAppsScriptSecret
})

test('feedback route validates the required fields and rating range', async () => {
  const missingRating = await originalFetch(`${baseUrl}/api/feedback`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...validFeedback, evaluation3Rating: 6 }),
  })
  assert.equal(missingRating.status, 400)
  assert.match((await missingRating.json()).error, /rating from 1 to 5/)

  const missingIdentity = await originalFetch(`${baseUrl}/api/feedback`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...validFeedback, teamName: '' }),
  })
  assert.equal(missingIdentity.status, 400)
  assert.match((await missingIdentity.json()).error, /team name/)
})

test('feedback route rejects missing or invalid Gitwork sponsor answers', async () => {
  const invalidPayloads = [
    { ...validFeedback, branchSemester: '' },
    { ...validFeedback, whatsappPhone: '12345' },
    { ...validFeedback, projectName: '' },
    { ...validFeedback, gitworkExperience: 6 },
    { ...validFeedback, gitworkUsefulFeatures: [] },
    { ...validFeedback, gitworkUsefulFeatures: ['Unknown feature'] },
    { ...validFeedback, gitworkTimeSaved: 'Sometimes' },
    { ...validFeedback, gitworkIssues: '' },
    { ...validFeedback, gitworkSessionAttendance: 'Maybe' },
    { ...validFeedback, gitworkLicenseInterest: 'Possibly' },
    { ...validFeedback, gitworkRecommend: 'Definitely' },
  ]
  for (const payload of invalidPayloads) {
    const response = await originalFetch(`${baseUrl}/api/feedback`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    assert.equal(response.status, 400)
    assert.ok((await response.json()).error)
  }
})

test('feedback route forwards validated feedback and returns paid-roster rejection', async () => {
  const response = await originalFetch(`${baseUrl}/api/feedback`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(validFeedback),
  })
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /confirmed paid roster/)
  assert.deepEqual(forwardedFeedback, {
    action: 'submit_feedback',
    secret: 'feedback-test-secret',
    ...validFeedback,
  })
})

test('certificate generator returns a stamped landscape PDF', async () => {
  const output = await generateCertificatePdf('Minerva McGonagall')
  assert.equal(output.subarray(0, 5).toString(), '%PDF-')
  const pdf = await PDFDocument.load(output)
  const [page] = pdf.getPages()
  assert.deepEqual(page.getSize(), { width: 864, height: 576 })
})
