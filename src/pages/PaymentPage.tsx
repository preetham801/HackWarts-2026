import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Download, Printer, ShieldCheck } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { PaymentPortalFrame } from '../components/PaymentPortalFrame'
import { readApiResponse } from '../utils/apiResponse'

type Receipt = {
  receiptId: string
  teamId: string
  razorpayPaymentId: string
  razorpayOrderId: string
  teamName: string
  collegeName: string
  houseTrack: string
  leaderName: string
  amount: number
  currency: string
  paymentStatus: 'PAID'
  paidAt: string
}

type PaymentTeam = {
  id: string
  teamName: string
  collegeName: string
  houseTrack: string
  leaderName: string
  leaderEmail: string
  leaderPhone: string
  members: string[]
  memberCount: number
  amount: number
  paymentStatus: 'PENDING' | 'PAID'
  receipt?: Receipt
}

type RazorpayResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { name: string; email: string; contact: string }
  theme: { color: string }
  handler: (response: RazorpayResponse) => void | Promise<void>
  modal: { ondismiss: () => void }
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void }
  }
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout]')
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.Razorpay)), { once: true })
      existing.addEventListener('error', () => resolve(false), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = 'true'
    script.onload = () => resolve(Boolean(window.Razorpay))
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })
}

function receiptRows(receipt: Receipt) {
  return [
    ['Receipt ID', receipt.receiptId],
    ['Team ID', receipt.teamId],
    ['Razorpay Payment ID', receipt.razorpayPaymentId],
    ['Razorpay Order ID', receipt.razorpayOrderId],
    ['Team Name', receipt.teamName],
    ['College', receipt.collegeName],
    ['House / Track', receipt.houseTrack],
    ['Team Leader', receipt.leaderName],
    ['Amount Paid', '₹499.00 INR'],
    ['Payment Status', 'PAID'],
    ['Payment Date / Time', formatDate(receipt.paidAt)],
  ] as const
}

function downloadReceipt(receipt: Receipt) {
  const escape = (text: string) => text.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character)
  const rows = receiptRows(receipt).map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value)}</td></tr>`).join('')
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>HackWarts Payment Receipt ${escape(receipt.receiptId)}</title><style>body{font:16px Georgia,serif;color:#241d14;padding:32px}main{max-width:760px;margin:auto;border:2px solid #9d7837;padding:28px}h1{color:#68421d}table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:10px;border-bottom:1px solid #ddd}th{width:38%}</style></head><body><main><p>HACKWARTS 2026 · OFFICIAL PAYMENT RECEIPT</p><h1>Slot Confirmed</h1><table>${rows}</table><p>Sri Siddhartha School of Engineering, Tumkur · November 25 &amp; 26, 2026</p></main></body></html>`
  const blobUrl = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = blobUrl
  anchor.download = `HackWarts-Receipt-${receipt.receiptId}.html`
  anchor.click()
  URL.revokeObjectURL(blobUrl)
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [query, setQuery] = useState('')
  const [team, setTeam] = useState<PaymentTeam | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const lookup = useCallback(async (lookupValue: string) => {
    setBusy(true)
    setError('')
    setNotice('')
    setTeam(null)
    try {
      const parameter = `query=${encodeURIComponent(lookupValue)}`
      const response = await fetch(`/api/payment/team?${parameter}`)
      const result = await readApiResponse<{ team: PaymentTeam }>(response)
      setTeam(result.team as PaymentTeam)
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : 'Could not find your shortlist record.')
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetch(`/api/payment/team?token=${encodeURIComponent(token)}`)
      .then((response) => readApiResponse<{ team: PaymentTeam }>(response))
      .then((result) => result.team)
      .then((loadedTeam) => { if (!cancelled) setTeam(loadedTeam) })
      .catch((lookupError: unknown) => {
        if (!cancelled) setError(lookupError instanceof Error ? lookupError.message : 'Could not find your shortlist record.')
      })
    return () => { cancelled = true }
  }, [token])

  const handleLookup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (query.trim()) void lookup(query.trim())
  }

  const startPayment = async () => {
    if (!team) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token || undefined, teamId: team.id, leaderEmail: team.leaderEmail }),
      })
      const order = await readApiResponse<{ orderId: string; amount: number; currency: string; keyId: string }>(orderResponse)
      if (!await loadRazorpayCheckout() || !window.Razorpay) throw new Error('Razorpay Checkout could not load. Check your connection and try again.')
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'HackWarts 2026',
        description: `Registration for ${team.teamName}`,
        order_id: order.orderId,
        prefill: { name: team.leaderName, email: team.leaderEmail, contact: team.leaderPhone },
        theme: { color: '#c9a15b' },
        handler: async (paymentResponse) => {
          setBusy(true)
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(paymentResponse),
            })
            const verified = await readApiResponse<{ success: boolean; team: PaymentTeam; emailSent: boolean }>(verifyResponse)
            if (verified.success !== true) throw new Error('Payment verification is not complete.')
            setTeam(verified.team as PaymentTeam)
            setNotice(verified.emailSent ? 'Payment verified. Your confirmation and receipt have been emailed.' : 'Payment verified. Your receipt is ready below; the email could not be sent yet, but organizers can resend it.')
          } catch (verificationError) {
            setError(verificationError instanceof Error ? verificationError.message : 'Payment verification could not be completed. Contact the organizers before paying again.')
          } finally {
            setBusy(false)
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      })
      checkout.open()
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Could not start payment.')
      setBusy(false)
    }
  }

  const receipt = team?.receipt
  return (
    <PaymentPortalFrame eyebrow="Shortlisted coven portal" title={team?.paymentStatus === 'PAID' ? 'Your place is secured.' : 'Verify your coven details.'} description="This private portal is for teams invited by the organizers.">
      {!token && !team && <form className="payment-lookup" onSubmit={handleLookup}>
        <label htmlFor="payment-lookup">Team ID or team leader email</label>
        <div><input id="payment-lookup" autoComplete="email" value={query} onChange={(event) => setQuery(event.target.value)} required placeholder="Enter your Team ID or email" /><button className="payment-button payment-button--secondary" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Find my team'}</button></div>
        <p>Use the exact Team ID or leader email supplied during shortlisting.</p>
      </form>}
      {(busy && !team || token && !team && !error) && <p className="payment-status" role="status">Loading your shortlist record…</p>}
      {error && <p className="payment-alert" role="alert">{error}</p>}
      {notice && <p className="payment-notice" role="status">{notice}</p>}
      {team && <>
        <section className="payment-details" aria-labelledby="payment-details-title">
          <div className="payment-details__heading"><div><p className="payment-eyebrow">Verify your coven details</p><h2 id="payment-details-title">{team.teamName}</h2></div><span className={`payment-status-pill payment-status-pill--${team.paymentStatus.toLowerCase()}`}>{team.paymentStatus}</span></div>
          <dl>
            <div><dt>Team ID</dt><dd>{team.id}</dd></div>
            <div><dt>College</dt><dd>{team.collegeName}</dd></div>
            <div><dt>House / Track</dt><dd>{team.houseTrack}</dd></div>
            <div><dt>Team Leader</dt><dd>{team.leaderName}</dd></div>
            <div><dt>Email</dt><dd>{team.leaderEmail}</dd></div>
            <div><dt>Phone</dt><dd>{team.leaderPhone}</dd></div>
            <div><dt>Member count</dt><dd>{team.memberCount ? `${team.memberCount} listed` : 'Not supplied by organizers'}</dd></div>
            <div><dt>Event</dt><dd>November 25 &amp; 26, 2026 · SSSE, Tumkur</dd></div>
            <div><dt>Registration fee</dt><dd>₹499</dd></div>
          </dl>
          {team.paymentStatus === 'PENDING' && <button className="payment-button" type="button" onClick={() => void startPayment()} disabled={busy}>{busy ? 'Preparing secure checkout…' : 'Proceed to Pay ₹499'}</button>}
        </section>
        {team.paymentStatus === 'PAID' && receipt && <section className="payment-confirmed" aria-labelledby="payment-confirmed-title">
          <p className="payment-confirmed__badge"><ShieldCheck size={19} aria-hidden="true" /> Welcome to HackWarts 2026 — You Are Officially In &amp; Your Slot Is Booked!</p>
          <div className="payment-receipt" id="payment-receipt">
            <div className="payment-receipt__heading"><div><p className="payment-eyebrow">Official payment receipt slip</p><h2 id="payment-confirmed-title">HackWarts 2026</h2></div><span>{receipt.receiptId}</span></div>
            <dl>{receiptRows(receipt).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          </div>
          <div className="payment-actions"><button className="payment-button payment-button--secondary" type="button" onClick={() => window.print()}><Printer size={16} aria-hidden="true" />Print slip</button><button className="payment-button payment-button--secondary" type="button" onClick={() => downloadReceipt(receipt)}><Download size={16} aria-hidden="true" />Download slip</button></div>
        </section>}
      </>}
    </PaymentPortalFrame>
  )
}
