import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import express from 'express'
import Razorpay from 'razorpay'
import {
  buildReceipt,
  sendConfirmationEmail,
  sendManualPaymentConfirmationEmail,
  sendShortlistEmail,
} from './paymentMailer.js'
import { listShortlistedTeams, saveShortlistedTeam, saveShortlistedTeams } from './shortlistedTeamsStore.js'

const router = express.Router()
const tracks = new Set(['Health & Safety', 'Sustainability & Development', 'EdTech & FinTech', 'AgriTech'])
const loginAttempts = new Map()
const loginWindowMs = 15 * 60 * 1000
const maxLoginAttempts = 8
const confirmationTasks = new Map()

function headerKey(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function normalizeRegistration(row, headers = []) {
  const record = Array.isArray(row)
    ? Object.fromEntries(headers.map((header, index) => [header, row[index]]))
    : row && typeof row === 'object' ? row : {}
  const values = new Map(Object.entries(record).map(([key, value]) => [headerKey(key), value]))
  const pick = (...keys) => {
    for (const key of keys) {
      const value = values.get(headerKey(key))
      if (value !== undefined && value !== null && String(value).trim()) return String(value).trim()
    }
    return ''
  }
  const members = pick('members', 'membernames').split(/[;,|]/).map((name) => name.trim()).filter(Boolean)
  for (let index = 1; index <= 4; index++) {
    const member = pick(`member${index}`, `team member ${index}`)
    if (member && !members.includes(member)) members.push(member)
  }
  return {
    teamName: pick('teamName', 'team'),
    track: pick('selectedTrack', 'track', 'house', 'trackProblemStatement', 'problemStatementTrack', 'problemStatement', 'problemDomain'),
    teamSize: pick('teamSize', 'size', 'memberCount', 'teamMembers'),
    leaderName: pick('leaderName', 'teamLeader', 'name'),
    leaderEmail: pick('leaderEmail', 'email', 'emailAddress', 'registeredEmail'),
    leaderPhone: pick('leaderPhone', 'phone', 'phoneNumber', 'mobile'),
    collegeName: pick('college', 'collegeName', 'institution'),
    members,
    pptLink: pick('pptLink', 'pptUrl', 'projectPpt', 'presentationLink'),
    timestamp: pick('timestamp', 'submittedAt', 'registrationTimestamp', 'date'),
  }
}

function publicTeam(team) {
  const result = {
    id: team.id,
    teamName: team.teamName,
    collegeName: team.collegeName,
    houseTrack: team.houseTrack,
    leaderName: team.leaderName,
    leaderEmail: team.leaderEmail,
    leaderPhone: team.leaderPhone,
    members: team.members,
    memberCount: team.members.length,
    amount: 499,
    paymentStatus: team.paymentStatus,
  }
  if (team.paymentStatus === 'PAID') {
    result.paidAt = team.paidAt
    result.receipt = buildReceipt(team)
    result.confirmationEmailSent = team.confirmationEmailSent
  }
  return result
}

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) throw Object.assign(new Error('Razorpay is not configured on the server.'), { status: 503 })
  return { gateway: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId, keySecret }
}

function paymentGateway() {
  const configured = process.env.PAYMENT_GATEWAY?.trim().toLowerCase()
  if (configured && !['instamojo', 'razorpay'].includes(configured)) {
    throw Object.assign(new Error('PAYMENT_GATEWAY must be instamojo or razorpay.'), { status: 503 })
  }
  if (configured) return configured
  return process.env.INSTAMOJO_API_KEY && process.env.INSTAMOJO_AUTH_TOKEN ? 'instamojo' : 'razorpay'
}

function getInstamojoConfig() {
  const apiKey = process.env.INSTAMOJO_API_KEY
  const authToken = process.env.INSTAMOJO_AUTH_TOKEN
  const salt = process.env.INSTAMOJO_SALT
  if (!apiKey || !authToken || !salt) {
    throw Object.assign(new Error('Instamojo API key, auth token, and salt must be configured.'), { status: 503 })
  }
  const baseUrl = (process.env.INSTAMOJO_BASE_URL || 'https://www.instamojo.com/api/1.1').replace(/\/+$/, '')
  return { apiKey, authToken, salt, baseUrl }
}

function getPublicSiteUrl() {
  const configured = process.env.PUBLIC_SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  if (!configured) throw Object.assign(new Error('PUBLIC_SITE_URL is not configured on the server.'), { status: 503 })
  const url = new URL(configured)
  if (!['http:', 'https:'].includes(url.protocol)) throw Object.assign(new Error('PUBLIC_SITE_URL must use HTTP or HTTPS.'), { status: 503 })
  return url.origin
}

function indianMobileNumber(phone) {
  let digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  if (!/^[6-9]\d{9}$/.test(digits)) {
    throw Object.assign(new Error('The team leader phone must be a valid 10-digit Indian mobile number for Instamojo.'), { status: 400 })
  }
  return digits
}

async function instamojoFetch(path, options = {}) {
  const config = getInstamojoConfig()
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...options,
    headers: {
      'X-Api-Key': config.apiKey,
      'X-Auth-Token': config.authToken,
      Accept: 'application/json',
      ...options.headers,
    },
    signal: AbortSignal.timeout(15000),
  })
  const raw = await response.text()
  let result
  try { result = JSON.parse(raw) } catch {
    throw Object.assign(new Error('Instamojo returned an invalid response.'), { status: 502 })
  }
  if (!response.ok || result.success === false) {
    throw Object.assign(new Error(result.message || result.error || 'Instamojo could not process the payment request.'), { status: 502 })
  }
  return result
}

function instamojoMacIsValid(fields) {
  const { salt } = getInstamojoConfig()
  const suppliedMac = String(fields.mac || '')
  if (!/^[a-f\d]{40}$/i.test(suppliedMac)) return false
  const message = Object.entries(fields)
    .filter(([key]) => key.toLowerCase() !== 'mac')
    .sort(([left], [right]) => left.toLowerCase().localeCompare(right.toLowerCase()))
    .map(([, value]) => Array.isArray(value) ? value.join(',') : String(value ?? ''))
    .join('|')
  const expectedMac = createHmac('sha1', salt).update(message).digest('hex')
  return constantTimeStringEqual(suppliedMac.toLowerCase(), expectedMac)
}

async function confirmInstamojoPayment(paymentRequestId, paymentId) {
  const paymentRequest = encodeURIComponent(paymentRequestId)
  const payment = encodeURIComponent(paymentId)
  const result = await instamojoFetch(`/payment-requests/${paymentRequest}/${payment}/`)
  const details = result.payment || result
  if (details.status !== 'Credit' || Number(details.amount) < 499 || (details.currency && details.currency !== 'INR')) {
    throw Object.assign(new Error('Instamojo has not confirmed a successful ₹499 payment.'), { status: 409 })
  }
  if (details.payment_request_id && details.payment_request_id !== paymentRequestId) {
    throw Object.assign(new Error('Instamojo payment does not match this payment request.'), { status: 409 })
  }
  const teams = await listShortlistedTeams()
  const team = teams.find((entry) => entry.instamojoPaymentRequestId === paymentRequestId)
  if (!team) throw Object.assign(new Error('No shortlisted team matched this Instamojo payment request.'), { status: 404 })
  if (team.paymentStatus === 'PAID' && (team.paymentId || team.instamojoPaymentId) !== paymentId) {
    throw Object.assign(new Error('A different payment is already recorded for this team.'), { status: 409 })
  }
  if (team.paymentStatus !== 'PAID') {
    team.paymentStatus = 'PAID'
    team.paymentProvider = 'instamojo'
    team.paymentId = paymentId
    team.orderId = paymentRequestId
    team.instamojoPaymentId = paymentId
    team.paidAt = new Date().toISOString()
    team.receiptId = `HW-${paymentId.slice(-10).toUpperCase()}`
    team.confirmationEmailSent = false
    await saveShortlistedTeam(team)
  }
  return team
}

async function sendConfirmationOnce(team) {
  if (team.confirmationEmailSent) return true
  const inFlight = confirmationTasks.get(team.id)
  if (inFlight) {
    const sent = await inFlight
    if (sent) team.confirmationEmailSent = true
    return sent
  }
  const task = (async () => {
    const current = (await listShortlistedTeams()).find((entry) => entry.id === team.id)
    if (!current || current.confirmationEmailSent) return Boolean(current?.confirmationEmailSent)
    try {
      await sendConfirmationEmail(current)
      current.confirmationEmailSent = true
      await saveShortlistedTeam(current)
      Object.assign(team, current)
      return true
    } catch (error) {
      console.error('Payment confirmation email was not sent:', error.message)
      return false
    }
  })()
  confirmationTasks.set(team.id, task)
  try { return await task } finally { confirmationTasks.delete(team.id) }
}

function constantTimeStringEqual(left, right) {
  const leftBuffer = Buffer.from(String(left))
  const rightBuffer = Buffer.from(String(right))
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function issueAdminToken() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PORTAL_PASSWORD
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000, nonce: randomBytes(12).toString('hex') })).toString('base64url')
  const signature = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

function isValidAdminToken(token) {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PORTAL_PASSWORD
  if (!secret || typeof token !== 'string') return false
  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra) return false
  const expected = createHmac('sha256', secret).update(payload).digest('base64url')
  if (!constantTimeStringEqual(signature, expected)) return false
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now() } catch { return false }
}

function requireAdmin(request, response, next) {
  const authorization = request.get('authorization') || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!isValidAdminToken(token)) {
    response.status(401).json({ error: 'Organizer sign-in is required.' })
    return
  }
  next()
}

async function findTeamByToken(token) {
  if (!token) return undefined
  return (await listShortlistedTeams()).find((team) => team.token === token)
}

async function findTeamByQuery(query) {
  const value = String(query ?? '').trim()
  if (!value) return undefined
  const teams = await listShortlistedTeams()
  return teams.find((team) => team.id.toLowerCase() === value.toLowerCase())
    ?? teams.find((team) => team.leaderEmail.toLowerCase() === value.toLowerCase())
}

async function findTeamForOrder(body) {
  if (body.token) return findTeamByToken(body.token)
  if (!body.teamId || !body.leaderEmail) return undefined
  const teams = await listShortlistedTeams()
  return teams.find((team) => team.id === body.teamId && team.leaderEmail.toLowerCase() === String(body.leaderEmail).toLowerCase())
}

function normalizeTeam(input) {
  const fields = ['teamName', 'collegeName', 'leaderName', 'leaderEmail', 'leaderPhone', 'houseTrack']
  if (!input || !fields.every((field) => typeof input[field] === 'string' && input[field].trim())) {
    throw Object.assign(new Error('Team name, college, House Track, and leader contact details are required.'), { status: 400 })
  }
  const team = Object.fromEntries(fields.map((field) => [field, input[field].trim()]))
  if (!tracks.has(team.houseTrack)) throw Object.assign(new Error('Choose one of the four approved House Tracks.'), { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(team.leaderEmail)) throw Object.assign(new Error('Enter a valid team leader email address.'), { status: 400 })
  if (!/^[+\d()\s-]{8,20}$/.test(team.leaderPhone)) throw Object.assign(new Error('Enter a valid team leader phone number.'), { status: 400 })
  let members = input.members ?? []
  if (typeof members === 'string') members = members.split(/[;,]/)
  if (!Array.isArray(members)) throw Object.assign(new Error('Members must be supplied as a list of names.'), { status: 400 })
  members = members.map((name) => String(name).trim()).filter(Boolean)
  if (members.length === 1 || members.length > 4) throw Object.assign(new Error('Provide no member list or between 2 and 4 member names.'), { status: 400 })
  return {
    id: `HW-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`,
    token: randomBytes(24).toString('base64url'),
    ...team,
    members,
    amount: 499,
    shortlistEmailSent: false,
    paymentStatus: 'PENDING',
    razorpayOrderId: '',
    razorpayPaymentId: '',
    paidAt: '',
    confirmationEmailSent: false,
    createdAt: new Date().toISOString(),
  }
}

function loginLimiter(request, response, next) {
  const key = request.ip || request.socket.remoteAddress || 'unknown'
  const now = Date.now()
  const current = loginAttempts.get(key)
  if (current && current.expires > now && current.count >= maxLoginAttempts) {
    response.status(429).json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' })
    return
  }
  if (!current || current.expires <= now) loginAttempts.set(key, { count: 1, expires: now + loginWindowMs })
  else current.count += 1
  next()
}

router.get('/api/payment/team', async (request, response) => {
  const team = request.query.token
    ? await findTeamByToken(request.query.token)
    : await findTeamByQuery(request.query.query)
  if (!team) {
    response.status(404).json({ error: 'No shortlisted team matched those details. Check the private link or contact the organizers.' })
    return
  }
  response.json({ team: publicTeam(team) })
})

router.post('/api/payment/create-order', async (request, response) => {
  const team = await findTeamForOrder(request.body ?? {})
  if (!team) {
    response.status(404).json({ error: 'Shortlisted team could not be verified. Reload using the private payment link or verify Team ID and leader email.' })
    return
  }
  if (team.paymentStatus === 'PAID') {
    response.status(409).json({ error: 'This team already has a confirmed payment.' })
    return
  }
  const provider = paymentGateway()
  if (provider === 'instamojo') {
    const mobile = indianMobileNumber(team.leaderPhone)
    const publicUrl = getPublicSiteUrl()
    const body = new URLSearchParams({
      purpose: `HackWarts 2026 Finale - ${team.teamName}`,
      amount: '499',
      buyer_name: team.leaderName,
      email: team.leaderEmail,
      phone: mobile,
      redirect_url: `${publicUrl}/payment?token=${encodeURIComponent(team.token)}`,
      webhook: `${publicUrl}/api/payment/instamojo-webhook`,
      send_email: 'false',
      send_sms: 'false',
      allow_repeated_payments: 'false',
    })
    const result = await instamojoFetch('/payment-requests/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    const paymentRequest = result.payment_request
    if (!paymentRequest?.id || !paymentRequest?.longurl) {
      throw Object.assign(new Error('Instamojo did not return a checkout link.'), { status: 502 })
    }
    team.paymentProvider = 'instamojo'
    team.instamojoPaymentRequestId = paymentRequest.id
    team.paymentRequestLongUrl = paymentRequest.longurl
    await saveShortlistedTeam(team)
    response.json({ provider: 'instamojo', paymentRequestId: paymentRequest.id, checkoutUrl: paymentRequest.longurl })
    return
  }

  const { gateway, keyId } = getRazorpay()
  const order = await gateway.orders.create({
    amount: 49900,
    currency: 'INR',
    receipt: team.id.slice(0, 40),
    notes: { teamId: team.id, teamName: team.teamName, houseTrack: team.houseTrack },
  })
  team.razorpayOrderId = order.id
  team.paymentProvider = 'razorpay'
  team.orderId = order.id
  await saveShortlistedTeam(team)
  response.json({ provider: 'razorpay', orderId: order.id, amount: order.amount, currency: order.currency, keyId })
})

router.post('/api/payment/verify', async (request, response) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = request.body ?? {}
  if (![orderId, paymentId, signature].every((value) => typeof value === 'string' && value.length > 0)) {
    response.status(400).json({ error: 'Razorpay returned incomplete payment verification details.' })
    return
  }
  const { gateway, keySecret } = getRazorpay()
  const team = (await listShortlistedTeams()).find((entry) => entry.razorpayOrderId === orderId)
  if (!team) {
    response.status(404).json({ error: 'No pending team order matched this payment.' })
    return
  }
  const expected = createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex')
  if (!constantTimeStringEqual(signature.toLowerCase(), expected)) {
    response.status(400).json({ error: 'Payment signature could not be verified.' })
    return
  }
  if (team.paymentStatus !== 'PAID' || team.razorpayPaymentId !== paymentId) {
    if (team.paymentStatus === 'PAID' && team.razorpayPaymentId !== paymentId) {
      response.status(409).json({ error: 'A different payment is already recorded for this team.' })
      return
    }
    let payment = await gateway.payments.fetch(paymentId)
    if (payment.order_id !== orderId || payment.amount !== 49900 || payment.currency !== 'INR' || payment.status !== 'captured') {
      if (payment.order_id === orderId && payment.amount === 49900 && payment.currency === 'INR' && payment.status === 'authorized') {
        payment = await gateway.payments.capture(paymentId, 49900, 'INR')
      }
      if (payment.order_id !== orderId || payment.amount !== 49900 || payment.currency !== 'INR' || payment.status !== 'captured') {
        response.status(409).json({ error: 'The payment is verified but not captured for the expected amount. Contact the organizers before retrying.' })
        return
      }
    }
    team.paymentStatus = 'PAID'
    team.paymentProvider = 'razorpay'
    team.paymentId = paymentId
    team.orderId = orderId
    team.razorpayPaymentId = paymentId
    team.paidAt = new Date().toISOString()
    team.receiptId = `HW-${paymentId.slice(-10).toUpperCase()}`
    team.confirmationEmailSent = false
    await saveShortlistedTeam(team)
  }
  const emailSent = await sendConfirmationOnce(team)
  response.json({ success: true, team: publicTeam(team), receipt: buildReceipt(team), emailSent })
})

router.get('/api/payment/verify-instamojo', async (request, response) => {
  const token = String(request.query.token || '')
  const paymentId = String(request.query.payment_id || '')
  const paymentRequestId = String(request.query.payment_request_id || '')
  if (!token || !paymentId || !paymentRequestId) {
    response.status(400).json({ error: 'Instamojo returned incomplete payment verification details.' })
    return
  }
  if (request.query.payment_status && request.query.payment_status !== 'Credit') {
    response.status(409).json({ error: 'Instamojo did not report a successful payment.' })
    return
  }
  const linkedTeam = await findTeamByToken(token)
  if (!linkedTeam || linkedTeam.instamojoPaymentRequestId !== paymentRequestId) {
    response.status(404).json({ error: 'This payment does not match the shortlisted team link.' })
    return
  }
  const team = await confirmInstamojoPayment(paymentRequestId, paymentId)
  const emailSent = await sendConfirmationOnce(team)
  response.json({ success: true, team: publicTeam(team), receipt: buildReceipt(team), emailSent })
})

router.post('/api/payment/instamojo-webhook', async (request, response) => {
  const fields = request.body ?? {}
  if (!instamojoMacIsValid(fields)) {
    response.status(401).json({ error: 'Instamojo webhook signature could not be verified.' })
    return
  }
  if (fields.status !== 'Credit') {
    response.json({ success: true, ignored: true })
    return
  }
  const paymentId = String(fields.payment_id || '')
  const paymentRequestId = String(fields.payment_request_id || '')
  if (!paymentId || !paymentRequestId) {
    response.status(400).json({ error: 'Instamojo webhook omitted payment identifiers.' })
    return
  }
  const team = await confirmInstamojoPayment(paymentRequestId, paymentId)
  const emailSent = await sendConfirmationOnce(team)
  response.json({ success: true, emailSent })
})

router.post('/api/admin/login', loginLimiter, (request, response) => {
  const configuredPassword = process.env.ADMIN_PORTAL_PASSWORD
  const password = request.body?.password
  if (!configuredPassword) {
    response.status(503).json({ error: 'Organizer sign-in is not configured on the server.' })
    return
  }
  if (typeof password !== 'string' || !constantTimeStringEqual(password, configuredPassword)) {
    response.status(401).json({ error: 'The organizer password was not accepted.' })
    return
  }
  loginAttempts.delete(request.ip || request.socket.remoteAddress || 'unknown')
  response.json({ token: issueAdminToken(), expiresIn: 8 * 60 * 60 })
})

router.get('/api/admin/teams', requireAdmin, async (_request, response) => {
  const teams = await listShortlistedTeams()
  teams.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  response.json({ teams })
})

router.get('/api/admin/registrations', requireAdmin, async (_request, response) => {
  const scriptUrl = process.env.APPS_SCRIPT_URL
  const secret = process.env.APPS_SCRIPT_STORAGE_SECRET
  if (!scriptUrl || !secret) {
    response.status(503).json({ error: 'Google Sheets registration access is not configured on the server.' })
    return
  }
  const sheetResponse = await fetch(scriptUrl, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'registrations_list', secret }),
    signal: AbortSignal.timeout(12000),
  })
  const raw = await sheetResponse.text()
  let data
  try { data = JSON.parse(raw) } catch {
    response.status(502).json({ error: 'Google Sheets returned an unreadable registrations response. Deploy the updated Apps Script.' })
    return
  }
  if (!sheetResponse.ok || data?.success !== true) {
    response.status(502).json({ error: data?.error || 'Google Sheets could not return Round 1 registrations.' })
    return
  }
  const headers = Array.isArray(data.headers) ? data.headers : []
  const rows = Array.isArray(data.rows) ? data.rows : Array.isArray(data.registrations) ? data.registrations : []
  const registrations = rows.map((row) => normalizeRegistration(row, headers))
    .filter((row) => row.teamName || row.leaderEmail)
  response.json({ registrations })
})

router.post('/api/admin/shortlist', requireAdmin, async (request, response) => {
  const registration = normalizeRegistration(request.body)
  let team
  try {
    team = normalizeTeam({
      teamName: registration.teamName,
      collegeName: registration.collegeName,
      houseTrack: registration.track,
      leaderName: registration.leaderName,
      leaderEmail: registration.leaderEmail,
      leaderPhone: registration.leaderPhone,
      members: registration.members,
    })
  } catch (error) {
    response.status(error.status || 400).json({ error: error.message })
    return
  }
  const existing = (await listShortlistedTeams()).find((entry) => entry.leaderEmail.toLowerCase() === team.leaderEmail.toLowerCase())
  if (existing) {
    response.status(409).json({ error: 'This registered leader is already on the shortlist.', team: existing })
    return
  }
  await saveShortlistedTeam(team)
  try {
    await sendShortlistEmail(team)
    team.shortlistEmailSent = true
    team.shortlistEmailSentAt = new Date().toISOString()
    await saveShortlistedTeam(team)
    response.status(201).json({ success: true, team, emailSent: true })
  } catch (error) {
    console.error('Shortlist invitation email was not sent:', error.message)
    response.status(201).json({ success: true, team, emailSent: false, emailError: 'Team was shortlisted, but the invitation email could not be sent. Use Resend Shortlist Email.' })
  }
})

router.post('/api/admin/teams', requireAdmin, async (request, response) => {
  const input = Array.isArray(request.body?.teams) ? request.body.teams : [request.body]
  if (input.length === 0 || input.length > 500) {
    response.status(400).json({ error: 'Submit between 1 and 500 shortlisted teams at a time.' })
    return
  }
  const existing = await listShortlistedTeams()
  const existingEmails = new Set(existing.map((team) => team.leaderEmail.toLowerCase()))
  const created = []
  for (const row of input) {
    const team = normalizeTeam(row)
    if (existingEmails.has(team.leaderEmail.toLowerCase())) {
      response.status(409).json({ error: `A shortlisted team already uses ${team.leaderEmail}. No new teams from this batch were saved.` })
      return
    }
    existingEmails.add(team.leaderEmail.toLowerCase())
    created.push(team)
  }
  await saveShortlistedTeams(created)
  response.status(201).json({ teams: created })
})

router.post('/api/admin/send-shortlist-email', requireAdmin, async (request, response) => {
  const teams = await listShortlistedTeams()
  const team = teams.find((entry) => entry.id === request.body?.teamId)
  if (!team) {
    response.status(404).json({ error: 'Shortlisted team not found.' })
    return
  }
  if (team.paymentStatus === 'PAID') {
    response.status(409).json({ error: 'This team has already paid; use the confirmation receipt action instead.' })
    return
  }
  await sendShortlistEmail(team)
  team.shortlistEmailSent = true
  team.shortlistEmailSentAt = new Date().toISOString()
  await saveShortlistedTeam(team)
  response.json({ success: true, team })
})

router.post('/api/admin/shortlist/mark-paid', requireAdmin, async (request, response) => {
  const teamId = String(request.body?.teamId || '').trim()
  const paymentId = String(request.body?.paymentId || '').trim()
  if (!teamId || !/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
    response.status(400).json({ error: 'Enter the team ID and a valid Razorpay transaction ID (pay_…).'} )
    return
  }
  const team = (await listShortlistedTeams()).find((entry) => entry.id === teamId)
  if (!team) {
    response.status(404).json({ error: 'Shortlisted team not found.' })
    return
  }
  const wasPending = team.paymentStatus !== 'PAID'
  const changedPaymentId = team.paymentId !== paymentId
  team.paymentStatus = 'PAID'
  team.paymentProvider = 'razorpay'
  team.paymentId = paymentId
  team.razorpayPaymentId = paymentId
  team.orderId ||= team.razorpayOrderId || ''
  team.paidAt = new Date().toISOString()
  if (changedPaymentId) {
    team.receiptId = `HW-${paymentId.slice(-10).toUpperCase()}`
    team.confirmationEmailSentAt = ''
  } else {
    team.receiptId ||= `HW-${paymentId.slice(-10).toUpperCase()}`
  }
  await saveShortlistedTeam(team)
  if (!wasPending && !changedPaymentId && team.confirmationEmailSentAt) {
    response.json({ success: true, team, emailSent: true, alreadySent: true })
    return
  }
  try {
    await sendManualPaymentConfirmationEmail(team)
    team.confirmationEmailSent = true
    team.confirmationEmailSentAt = new Date().toISOString()
    await saveShortlistedTeam(team)
    response.json({ success: true, team, emailSent: true })
  } catch (error) {
    console.error('Manual payment confirmation email was not sent:', error.message)
    response.json({ success: true, team, emailSent: false, emailError: 'Payment was recorded, but the confirmation email could not be sent. Use Resend Confirmation Email.' })
  }
})

router.post('/api/admin/shortlist/send-confirmation', requireAdmin, async (request, response) => {
  const team = (await listShortlistedTeams()).find((entry) => entry.id === request.body?.teamId)
  if (!team || team.paymentStatus !== 'PAID' || !team.paymentId) {
    response.status(409).json({ error: 'Mark this team as paid with its Razorpay transaction ID before sending confirmation.' })
    return
  }
  await sendManualPaymentConfirmationEmail(team)
  team.confirmationEmailSent = true
  team.confirmationEmailSentAt = new Date().toISOString()
  await saveShortlistedTeam(team)
  response.json({ success: true, team })
})

router.post('/api/admin/resend-confirmation', requireAdmin, async (request, response) => {
  const teams = await listShortlistedTeams()
  const team = teams.find((entry) => entry.id === request.body?.teamId)
  if (!team || team.paymentStatus !== 'PAID') {
    response.status(404).json({ error: 'A paid team was not found.' })
    return
  }
  await sendConfirmationEmail(team)
  team.confirmationEmailSent = true
  await saveShortlistedTeam(team)
  response.json({ success: true, team })
})

export default router
