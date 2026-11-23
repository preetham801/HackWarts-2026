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
  const paymentProvider = team.paymentProvider || 'razorpay'
  const paymentId = team.paymentId || team.razorpayPaymentId || team.instamojoPaymentId || ''
  const orderId = team.orderId || team.razorpayOrderId || team.instamojoPaymentRequestId || ''
  const receiptId = team.receiptId || `HW-${String(paymentId).slice(-10).toUpperCase()}`
  return {
    receiptId,
    teamId: team.id,
    paymentProvider,
    paymentId,
    orderId,
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
  const providerName = receipt.paymentProvider === 'instamojo' ? 'Instamojo' : 'Razorpay'
  const values = [
    ['Receipt ID', receipt.receiptId],
    [`${providerName} Payment ID`, receipt.paymentId],
    [receipt.paymentProvider === 'instamojo' ? 'Instamojo Payment Request ID' : 'Razorpay Order ID', receipt.orderId],
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
  const link = process.env.RAZORPAY_PAYMENT_LINK || 'https://rzp.io/rzp/akH3v7Iu'
  const html = emailFrame('Your coven has been shortlisted', `<p>Dear Team Leader ${escapeHtml(team.leaderName)},</p><p>Your team <strong>${escapeHtml(team.teamName)}</strong> (Team ID: <strong>${escapeHtml(team.id)}</strong>) has been shortlisted for the ${escapeHtml(team.houseTrack)} track at HackWarts 2026.</p><p>To complete the fixed <strong>₹499 team registration payment</strong>:</p><ol><li>Open the <a href="${escapeHtml(link)}" style="color:#f4df9b">Razorpay payment page</a>.</li><li>Pay exactly <strong>₹499</strong>.</li><li>Enter your exact Team Name <strong>${escapeHtml(team.teamName)}</strong> and Team Leader Name <strong>${escapeHtml(team.leaderName)}</strong> on the payment page.</li></ol><p>The organizing council will use these details to verify your payment and dispatch your official HackWarts 2026 Finale Confirmation Email.</p><p><a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 18px;background:#c9a15b;color:#080d17;text-decoration:none;font-weight:bold">Pay ₹499 with Razorpay</a></p><p>If you were not expecting this message, contact the event organizers using a verified official channel.</p>`)
  const transporter = createTransporter()
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: team.leaderEmail,
    subject: `HackWarts 2026 shortlist invitation — ${team.teamName}`,
    html,
  })
}

export async function sendManualPaymentConfirmationEmail(team) {
  if (team.paymentStatus !== 'PAID' || !team.paymentId) throw new Error('A paid team with a verified Razorpay transaction ID is required.')
  const html = emailFrame('Finale confirmation — your place is secured', `<p>Dear ${escapeHtml(team.leaderName)},</p><p>Your team <strong>${escapeHtml(team.teamName)}</strong> (Team ID: <strong>${escapeHtml(team.id)}</strong>) is confirmed for HackWarts 2026.</p><table style="width:100%;border-collapse:collapse;background:#0a111c"><tr><th align="left" style="padding:9px;border-bottom:1px solid #403a2c;color:#d9bd77">Track</th><td style="padding:9px;border-bottom:1px solid #403a2c">${escapeHtml(team.houseTrack)}</td></tr><tr><th align="left" style="padding:9px;border-bottom:1px solid #403a2c;color:#d9bd77">Amount Paid</th><td style="padding:9px;border-bottom:1px solid #403a2c">₹499</td></tr><tr><th align="left" style="padding:9px;border-bottom:1px solid #403a2c;color:#d9bd77">Razorpay Transaction ID</th><td style="padding:9px;border-bottom:1px solid #403a2c">${escapeHtml(team.paymentId)}</td></tr></table><p><strong>Event:</strong> November 25 &amp; 26, 2026. Reporting is at 9:00 AM on November 25 at Sri Siddhartha School of Engineering (SSSE), Tumkur, Karnataka.</p><p><strong>Check-in:</strong> Please carry your college ID cards, laptops, and this confirmation email.</p><p><strong>Student coordinators</strong><br>Akhil Reddy S — +91 9364086869<br>Mohammed Zain — +91 7019031907<br>Chandana R — +91 6360943289</p>`)
  const transporter = createTransporter()
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: team.leaderEmail,
    subject: `HackWarts 2026 finale confirmation — ${team.teamName}`,
    html,
  })
}

export async function sendConfirmationEmail(team) {
  if (team.paymentStatus !== 'PAID' || !team.paidAt || !(team.paymentId || team.razorpayPaymentId || team.instamojoPaymentId)) throw new Error('A verified paid team is required to send a receipt.')
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
