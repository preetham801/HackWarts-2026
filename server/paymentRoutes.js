import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import express from 'express'
import Razorpay from 'razorpay'
import {
  buildReceipt,
  sendConfirmationEmail,
  sendShortlistEmail,
} from './paymentMailer.js'
import { listShortlistedTeams, saveShortlistedTeam } from './shortlistedTeamsStore.js'

const router = express.Router()
const tracks = new Set(['Health & Safety', 'Sustainability & Development', 'EdTech & FinTech', 'AgriTech'])
const loginAttempts = new Map()
const loginWindowMs = 15 * 60 * 1000
const maxLoginAttempts = 8

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
  const { gateway, keyId } = getRazorpay()
  const order = await gateway.orders.create({
    amount: 49900,
    currency: 'INR',
    receipt: team.id.slice(0, 40),
    notes: { teamId: team.id, teamName: team.teamName, houseTrack: team.houseTrack },
  })
  team.razorpayOrderId = order.id
  await saveShortlistedTeam(team)
  response.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId })
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
    team.razorpayPaymentId = paymentId
    team.paidAt = new Date().toISOString()
    team.receiptId = `HW-${paymentId.slice(-10).toUpperCase()}`
    team.confirmationEmailSent = false
    await saveShortlistedTeam(team)
  }
  let emailSent = team.confirmationEmailSent
  if (!emailSent) {
    try {
      await sendConfirmationEmail(team)
      team.confirmationEmailSent = true
      await saveShortlistedTeam(team)
      emailSent = true
    } catch (error) {
      console.error('Payment confirmation email was not sent:', error.message)
    }
  }
  response.json({ success: true, team: publicTeam(team), receipt: buildReceipt(team), emailSent })
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
  for (const team of created) await saveShortlistedTeam(team)
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
