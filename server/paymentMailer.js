import nodemailer from 'nodemailer'

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

function createTransporter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) throw Object.assign(new Error('Email delivery is not configured on the server.'), { status: 503 })
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user, pass },
  })
}

function publicSiteUrl() {
  const value = process.env.PUBLIC_SITE_URL
  if (!value) throw Object.assign(new Error('PUBLIC_SITE_URL is not configured on the server.'), { status: 503 })
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol)) throw Object.assign(new Error('PUBLIC_SITE_URL must use HTTP or HTTPS.'), { status: 503 })
  return url.origin
}

function emailFrame(title, content) {
  return `<!doctype html><html><body style="margin:0;background:#080d17;color:#eee4d0;font-family:Georgia,serif;padding:28px"><main style="max-width:680px;margin:auto;border:1px solid #c9a15b;padding:28px;background:#101b2a"><p style="color:#d9bd77;letter-spacing:.16em;text-transform:uppercase">HackWarts 2026</p><h1 style="color:#f4df9b">${title}</h1>${content}<p style="color:#bdb5a7;font-size:13px">Sri Siddhartha School of Engineering (SSSE), Tumkur · November 25 &amp; 26, 2026</p></main></body></html>`
}

export function buildReceipt(team) {
  const receiptId = team.receiptId || `HW-${String(team.razorpayPaymentId || '').slice(-10).toUpperCase()}`
  return {
    receiptId,
    teamId: team.id,
    razorpayPaymentId: team.razorpayPaymentId,
    razorpayOrderId: team.razorpayOrderId,
    teamName: team.teamName,
    collegeName: team.collegeName,
    houseTrack: team.houseTrack,
    leaderName: team.leaderName,
    amount: 499,
    currency: 'INR',
    paymentStatus: 'PAID',
    paidAt: team.paidAt,
  }
}

function receiptRows(receipt) {
  const values = [
    ['Receipt ID', receipt.receiptId],
    ['Razorpay Payment ID', receipt.razorpayPaymentId],
    ['Razorpay Order ID', receipt.razorpayOrderId],
    ['Team Name', receipt.teamName],
    ['College', receipt.collegeName],
    ['House / Track', receipt.houseTrack],
    ['Team Leader', receipt.leaderName],
    ['Amount Paid', '₹499.00 INR'],
    ['Payment Status', 'PAID'],
    ['Payment Date / Time', new Date(receipt.paidAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
  ]
  return values.map(([label, value]) => `<tr><th align="left" style="padding:9px;border-bottom:1px solid #403a2c;color:#d9bd77">${escapeHtml(label)}</th><td style="padding:9px;border-bottom:1px solid #403a2c">${escapeHtml(value)}</td></tr>`).join('')
}

export async function sendShortlistEmail(team) {
  const link = `${publicSiteUrl()}/payment?token=${encodeURIComponent(team.token)}`
  const html = emailFrame('Your coven has been shortlisted', `<p>Dear ${escapeHtml(team.leaderName)},</p><p>${escapeHtml(team.teamName)} has been shortlisted for HackWarts 2026. Use your private payment link to verify your team details and complete the ₹499 registration payment.</p><p><a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 18px;background:#c9a15b;color:#080d17;text-decoration:none;font-weight:bold">Open shortlisted payment portal</a></p><p>If you were not expecting this message, contact the event organizers using a verified official channel.</p>`)
  const transporter = createTransporter()
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: team.leaderEmail,
    subject: `HackWarts 2026 shortlist invitation — ${team.teamName}`,
    html,
  })
}

export async function sendConfirmationEmail(team) {
  if (team.paymentStatus !== 'PAID' || !team.paidAt || !team.razorpayPaymentId) throw new Error('A verified paid team is required to send a receipt.')
  const receipt = buildReceipt(team)
  const link = `${publicSiteUrl()}/payment?token=${encodeURIComponent(team.token)}`
  const html = emailFrame('Slot confirmed — you are officially in', `<p>Welcome to HackWarts 2026! You are officially in and your slot is booked for November 25 &amp; 26, 2026 at Sri Siddhartha School of Engineering (SSSE), Tumkur.</p><h2 style="color:#f4df9b">Official Payment Receipt Slip</h2><table style="width:100%;border-collapse:collapse;background:#0a111c">${receiptRows(receipt)}</table><p><a href="${escapeHtml(link)}" style="color:#f4df9b">View or print your digital receipt</a></p>`)
  const transporter = createTransporter()
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: team.leaderEmail,
    subject: `Welcome to HackWarts 2026! Slot Confirmed & Payment Receipt — ${team.teamName}`,
    html,
  })
}
