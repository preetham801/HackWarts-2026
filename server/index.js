import 'dotenv/config'
import express from 'express'
import Razorpay from 'razorpay'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyPaymentSignature } from './payment.js'

const app = express()
const port = Number(process.env.PORT) || 3001
const registrationAmount = 49900
const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')

app.use(express.json({ limit: '16kb' }))

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    const error = new Error('Razorpay server credentials are not configured.')
    error.statusCode = 503
    throw error
  }

  return { keyId, keySecret }
}

app.post('/api/create-order', async (request, response) => {
  const { amount } = request.body ?? {}
  if (!Number.isInteger(amount) || amount < 100) {
    response.status(400).json({ error: 'Amount must be an integer of at least 100 paise.' })
    return
  }
  if (amount !== registrationAmount) {
    response.status(400).json({ error: 'The registration amount must be ₹499.' })
    return
  }

  try {
    const { keyId, keySecret } = getRazorpayCredentials()
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const order = await razorpay.orders.create({
      amount: registrationAmount,
      currency: 'INR',
      receipt: `hw_${randomUUID().replaceAll('-', '')}`,
    })

    response.status(201).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    })
  } catch (error) {
    if (error?.statusCode === 401) {
      response.status(401).json({ error: 'Razorpay rejected the server credentials.' })
      return
    }
    if (error?.statusCode === 503) {
      response.status(503).json({ error: error.message })
      return
    }
    console.error('Razorpay order creation failed.')
    response.status(500).json({ error: 'Could not create a Razorpay order. Please try again.' })
  }
})

app.post('/api/verify-payment', (request, response) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = request.body ?? {}
  if (
    typeof orderId !== 'string' || !orderId ||
    typeof paymentId !== 'string' || !paymentId ||
    typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    response.status(400).json({ error: 'Order ID, payment ID, and a valid signature are required.' })
    return
  }

  try {
    const { keySecret } = getRazorpayCredentials()
    if (!verifyPaymentSignature({ orderId, paymentId, signature, secret: keySecret })) {
      response.status(400).json({ error: 'Payment signature verification failed.' })
      return
    }
    response.json({ verified: true })
  } catch (error) {
    if (error?.statusCode === 503) {
      response.status(503).json({ error: error.message })
      return
    }
    console.error('Razorpay payment verification failed.')
    response.status(500).json({ error: 'Could not verify payment. Please contact the event organizers.' })
  }
})

app.post('/api/submit-registration', async (request, response) => {
  const {
    teamName,
    leaderName,
    email,
    phone,
    college,
    teamSize,
    member1 = '',
    member2 = '',
    member3 = '',
    member4 = '',
    house = '',
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = request.body ?? {}

  if (
    typeof teamName !== 'string' || !teamName.trim() ||
    typeof leaderName !== 'string' || !leaderName.trim() ||
    typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof phone !== 'string' || !/^\d{10}$/.test(phone) ||
    typeof college !== 'string' || !college.trim() ||
    !Number.isInteger(teamSize) || teamSize < 1 ||
    ![member1, member2, member3, member4, house].every((value) => typeof value === 'string') ||
    typeof orderId !== 'string' || !orderId ||
    typeof paymentId !== 'string' || !paymentId ||
    typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    response.status(400).json({ error: 'Registration details and valid Razorpay payment fields are required.' })
    return
  }

  let keySecret
  try {
    ({ keySecret } = getRazorpayCredentials())
  } catch (error) {
    response.status(error.statusCode ?? 503).json({ error: error.message })
    return
  }

  if (!verifyPaymentSignature({ orderId, paymentId, signature, secret: keySecret })) {
    response.status(400).json({ error: 'Payment signature verification failed.' })
    return
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL || process.env.VITE_APPS_SCRIPT_URL
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
        member1,
        member2,
        member3,
        member4,
        house,
        paymentId,
      }),
      signal: AbortSignal.timeout(20000),
    })
  } catch (error) {
    const timedOut = error.name === 'TimeoutError'
    response.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? 'Google Sheets did not respond in time. Keep your payment ID and contact the event organizers before retrying.'
        : 'Could not reach Google Sheets. Keep your payment ID and contact the event organizers before retrying.',
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
    if (!['success', 'saved', 'ok'].includes(resultText.toLowerCase())) {
      response.status(502).json({
        error: 'Google Sheets did not confirm the row was saved. Make the Apps Script doPost handler return JSON { "success": true } after writing the row.',
      })
      return
    }
  }

  if (result !== undefined && result?.success !== true) {
    response.status(502).json({
      error: typeof result?.error === 'string'
        ? `Google Sheets could not save the registration: ${result.error}`
        : 'Google Sheets did not confirm the row was saved. Make the Apps Script doPost handler return JSON { "success": true } after writing the row.',
    })
    return
  }

  response.json({ verified: true, saved: true, paymentId })
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
  console.error('Unhandled API error.')
  response.status(500).json({ error: 'An unexpected server error occurred.' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`HackWarts API listening on port ${port}.`)
})
