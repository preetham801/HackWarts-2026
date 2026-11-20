import { useMemo, useState, type FormEvent } from 'react'
import { Copy, Download, Mail, Printer, RefreshCw, Search, ShieldCheck, Users } from 'lucide-react'
import { PaymentPortalFrame } from '../components/PaymentPortalFrame'
import { readApiResponse } from '../utils/apiResponse'

type Team = {
  id: string
  token: string
  teamName: string
  collegeName: string
  houseTrack: string
  leaderName: string
  leaderEmail: string
  leaderPhone: string
  members: string[]
  amount: number
  shortlistEmailSent: boolean
  paymentStatus: 'PENDING' | 'PAID'
  paymentProvider?: 'instamojo' | 'razorpay'
  paymentId?: string
  orderId?: string
  razorpayOrderId: string
  razorpayPaymentId: string
  paidAt: string
  confirmationEmailSent: boolean
  receiptId?: string
}

type TeamInput = Omit<Team, 'id' | 'token' | 'amount' | 'shortlistEmailSent' | 'paymentStatus' | 'razorpayOrderId' | 'razorpayPaymentId' | 'paidAt' | 'confirmationEmailSent'>

const tracks = ['Health & Safety', 'Sustainability & Development', 'EdTech & FinTech', 'AgriTech']
const csvFields = ['teamName', 'collegeName', 'houseTrack', 'leaderName', 'leaderEmail', 'leaderPhone'] as const

function parseCsvLine(line: string) {
  const fields: string[] = []
  let value = '', quoted = false
  for (let index = 0; index < line.length; index++) {
    const character = line[index]
    if (character === '"' && line[index + 1] === '"' && quoted) { value += '"'; index++ }
    else if (character === '"') quoted = !quoted
    else if (character === ',' && !quoted) { fields.push(value.trim()); value = '' }
    else value += character
  }
  fields.push(value.trim())
  return fields
}

function escapeCsv(value: unknown) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function PortalReceipt({ team, onClose }: { team: Team; onClose: () => void }) {
  return (
    <div className="payment-modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="payment-receipt payment-admin-receipt" role="dialog" aria-modal="true" aria-labelledby="admin-receipt-title" tabIndex={-1} onKeyDown={(event) => { if (event.key === 'Escape') onClose() }}>
        <div className="payment-receipt__heading"><div><p className="payment-eyebrow">Official payment receipt</p><h2 id="admin-receipt-title">{team.teamName}</h2></div><button type="button" className="payment-icon-button" onClick={onClose} aria-label="Close receipt">×</button></div>
        <dl>
          {[
            ['Receipt ID', team.receiptId || `HW-${String(team.paymentId || team.razorpayPaymentId).slice(-10).toUpperCase()}`], ['Team ID', team.id],
            [team.paymentProvider === 'instamojo' ? 'Instamojo Payment ID' : 'Razorpay Payment ID', team.paymentId || team.razorpayPaymentId],
            [team.paymentProvider === 'instamojo' ? 'Instamojo Payment Request ID' : 'Razorpay Order ID', team.orderId || team.razorpayOrderId], ['College', team.collegeName],
            ['Track', team.houseTrack], ['Team Leader', team.leaderName], ['Amount Paid', '₹499.00 INR'], ['Payment Status', team.paymentStatus],
            ['Payment Date / Time', team.paidAt ? new Date(team.paidAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—'],
          ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        <button className="payment-button payment-button--secondary" type="button" onClick={() => window.print()}><Printer size={16} aria-hidden="true" />Print receipt</button>
      </section>
    </div>
  )
}

export default function PaymentAdminPage() {
  const [password, setPassword] = useState('')
  const [session, setSession] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL')
  const [showImporter, setShowImporter] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [membersText, setMembersText] = useState('')
  const [form, setForm] = useState({ teamName: '', collegeName: '', houseTrack: tracks[0], leaderName: '', leaderEmail: '', leaderPhone: '' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [receiptTeam, setReceiptTeam] = useState<Team | null>(null)

  const api = async <T extends Record<string, unknown>>(path: string, init: RequestInit = {}) => {
    const response = await fetch(path, {
      ...init,
      headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...(session ? { Authorization: `Bearer ${session}` } : {}), ...init.headers },
    })
    return readApiResponse<T>(response)
  }

  const refreshTeams = async (token = session) => {
    const response = await fetch('/api/admin/teams', { headers: { Authorization: `Bearer ${token}` } })
    const result = await readApiResponse<{ teams: Team[] }>(response)
    setTeams(result.teams as Team[])
  }

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      const result = await readApiResponse<{ token: string }>(response)
      setSession(result.token); setPassword('')
      await refreshTeams(result.token)
    } catch (loginError) { setError(loginError instanceof Error ? loginError.message : 'Could not sign in.') }
    finally { setBusy(false) }
  }

  const runAction = async (action: () => Promise<void>) => {
    setError(''); setMessage(''); setBusy(true)
    try { await action() } catch (actionError) { setError(actionError instanceof Error ? actionError.message : 'The request could not be completed.') }
    finally { setBusy(false) }
  }

  const addTeams = async (rows: TeamInput[]) => {
    if (!rows.length) throw new Error('Enter at least one complete team record.')
    const result = await api<{ teams: Team[] }>('/api/admin/teams', { method: 'POST', body: JSON.stringify({ teams: rows }) })
    setMessage(`${result.teams.length} shortlisted team${result.teams.length === 1 ? '' : 's'} added.`)
    await refreshTeams()
  }

  const addSingle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const members = membersText.split(/[;,]/).map((name) => name.trim()).filter(Boolean)
    void runAction(async () => {
      await addTeams([{ ...form, members }])
      setForm({ teamName: '', collegeName: '', houseTrack: tracks[0], leaderName: '', leaderEmail: '', leaderPhone: '' })
      setMembersText('')
    })
  }

  const importCsv = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void runAction(async () => {
      const lines = csvText.split(/\r?\n/).filter((line) => line.trim())
      const dataLines = lines[0]?.toLowerCase().includes('teamname') ? lines.slice(1) : lines
      const rows = dataLines.map((line, index) => {
        const columns = parseCsvLine(line)
        if (columns.length < csvFields.length) throw new Error(`CSV row ${index + 1} needs six columns: teamName, collegeName, houseTrack, leaderName, leaderEmail, leaderPhone.`)
        return {
          teamName: columns[0], collegeName: columns[1], houseTrack: columns[2], leaderName: columns[3], leaderEmail: columns[4], leaderPhone: columns[5],
          members: columns[6] ? columns[6].split(';').map((name) => name.trim()).filter(Boolean) : [],
        }
      })
      await addTeams(rows)
      setCsvText('')
    })
  }

  const filteredTeams = useMemo(() => teams.filter((team) => {
    const matchesFilter = filter === 'ALL' || team.paymentStatus === filter
    const text = `${team.id} ${team.teamName} ${team.collegeName} ${team.houseTrack} ${team.leaderName} ${team.leaderEmail}`.toLowerCase()
    return matchesFilter && text.includes(search.toLowerCase())
  }), [filter, search, teams])

  const totalPaid = teams.filter((team) => team.paymentStatus === 'PAID').length
  const exportPaid = () => {
    const paid = teams.filter((team) => team.paymentStatus === 'PAID')
    const rows = [['Team ID', 'Team Name', 'College', 'House / Track', 'Leader', 'Email', 'Phone', 'Payment Provider', 'Payment ID', 'Order / Request ID', 'Paid At'], ...paid.map((team) => [team.id, team.teamName, team.collegeName, team.houseTrack, team.leaderName, team.leaderEmail, team.leaderPhone, team.paymentProvider || 'razorpay', team.paymentId || team.razorpayPaymentId, team.orderId || team.razorpayOrderId, team.paidAt])]
    const blob = new Blob([rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a'); link.href = url; link.download = 'HackWarts-Paid-Teams.csv'; link.click(); URL.revokeObjectURL(url)
  }

  return (
    <PaymentPortalFrame eyebrow="Organizer access · Private" title="Shortlist command desk." description="Manage private invitations, verify collected payments, and follow up on receipts.">
      {!session ? <form className="payment-login" onSubmit={signIn}>
        <label htmlFor="admin-password">Organizer password</label>
        <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <button className="payment-button" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Open organizer dashboard'}</button>
      </form> : <div className="payment-admin">
        <div className="payment-admin__toolbar"><p><ShieldCheck size={17} aria-hidden="true" /> Private organizer dashboard</p><button className="payment-button payment-button--secondary" type="button" onClick={() => void runAction(() => refreshTeams())} disabled={busy}><RefreshCw size={15} aria-hidden="true" />Refresh</button></div>
        <div className="payment-kpis">
          <article><Users size={19} aria-hidden="true" /><span>Total shortlisted</span><strong>{teams.length}</strong></article>
          <article><Mail size={19} aria-hidden="true" /><span>Shortlist emails sent</span><strong>{teams.filter((team) => team.shortlistEmailSent).length}</strong></article>
          <article><ShieldCheck size={19} aria-hidden="true" /><span>Payments completed</span><strong>{totalPaid}</strong></article>
          <article><span>Pending payments</span><strong>{teams.length - totalPaid}</strong></article>
          <article><span>Total collected</span><strong>₹{(totalPaid * 499).toLocaleString('en-IN')}</strong></article>
        </div>
        <section className="payment-import">
          <button className="payment-button payment-button--secondary" type="button" onClick={() => setShowImporter((visible) => !visible)} aria-expanded={showImporter}>{showImporter ? 'Close team import' : 'Add / bulk import teams'}</button>
          {showImporter && <div className="payment-import__grid">
            <form onSubmit={addSingle}>
              <h2>Add one shortlisted team</h2>
              <label>Team name<input required value={form.teamName} onChange={(event) => setForm({ ...form, teamName: event.target.value })} /></label>
              <label>College<input required value={form.collegeName} onChange={(event) => setForm({ ...form, collegeName: event.target.value })} /></label>
              <label>House Track<select value={form.houseTrack} onChange={(event) => setForm({ ...form, houseTrack: event.target.value })}>{tracks.map((track) => <option key={track}>{track}</option>)}</select></label>
              <label>Team leader<input required value={form.leaderName} onChange={(event) => setForm({ ...form, leaderName: event.target.value })} /></label>
              <label>Leader email<input required type="email" value={form.leaderEmail} onChange={(event) => setForm({ ...form, leaderEmail: event.target.value })} /></label>
              <label>Leader phone<input required value={form.leaderPhone} onChange={(event) => setForm({ ...form, leaderPhone: event.target.value })} /></label>
              <label>Member names (optional, comma separated)<input value={membersText} onChange={(event) => setMembersText(event.target.value)} /></label>
              <button className="payment-button" type="submit" disabled={busy}>Add shortlisted team</button>
            </form>
            <form onSubmit={importCsv}>
              <h2>Bulk import CSV</h2>
              <p>Columns: teamName, collegeName, houseTrack, leaderName, leaderEmail, leaderPhone. Optional seventh column: member names separated by semicolons.</p>
              <textarea rows={9} value={csvText} onChange={(event) => setCsvText(event.target.value)} placeholder={'teamName,collegeName,houseTrack,leaderName,leaderEmail,leaderPhone\nCoven One,SSSE,AgriTech,Leader Name,leader@example.com,+919000000000'} required />
              <button className="payment-button" type="submit" disabled={busy}>Import teams</button>
            </form>
          </div>}
        </section>
        {error && <p className="payment-alert" role="alert">{error}</p>}
        {message && <p className="payment-notice" role="status">{message}</p>}
        <section className="payment-team-list" aria-labelledby="shortlisted-table-title">
          <div className="payment-team-list__heading"><h2 id="shortlisted-table-title">Shortlisted teams</h2><button className="payment-button payment-button--secondary" type="button" onClick={exportPaid}><Download size={15} aria-hidden="true" />Export paid CSV</button></div>
          <div className="payment-team-list__filters"><label className="payment-search"><Search size={16} aria-hidden="true" /><input aria-label="Search teams" placeholder="Search team, leader, college or ID" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="payment-filter">Status<select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="ALL">All</option><option value="PENDING">Pending</option><option value="PAID">Paid</option></select></label></div>
          <div className="payment-table-scroll"><table className="payment-table"><thead><tr><th>Team</th><th>Leader</th><th>Track</th><th>Status</th><th>Emails</th><th>Actions</th></tr></thead><tbody>
            {filteredTeams.map((team) => <tr key={team.id}>
              <td><strong>{team.teamName}</strong><small>{team.id} · {team.collegeName}</small></td>
              <td>{team.leaderName}<small>{team.leaderEmail}</small></td>
              <td>{team.houseTrack}</td>
              <td><span className={`payment-status-pill payment-status-pill--${team.paymentStatus.toLowerCase()}`}>{team.paymentStatus}</span></td>
              <td>Shortlist: {team.shortlistEmailSent ? 'Sent' : 'Not sent'}<small>Receipt: {team.confirmationEmailSent ? 'Sent' : team.paymentStatus === 'PAID' ? 'Not sent' : '—'}</small></td>
              <td><div className="payment-row-actions">
                <button type="button" onClick={() => void runAction(async () => { await navigator.clipboard.writeText(`${window.location.origin}/payment?token=${team.token}`); setMessage('Private payment link copied.') })}><Copy size={14} aria-hidden="true" /><span>Copy link</span></button>
                {team.paymentStatus === 'PENDING' && <button type="button" onClick={() => void runAction(async () => { const result = await api<{ team: Team }>('/api/admin/send-shortlist-email', { method: 'POST', body: JSON.stringify({ teamId: team.id }) }); setMessage(`Shortlist email sent to ${team.leaderEmail}.`); setTeams((current) => current.map((item) => item.id === team.id ? result.team : item)) })}><Mail size={14} aria-hidden="true" /><span>Send invite</span></button>}
                {team.paymentStatus === 'PAID' && <><button type="button" onClick={() => setReceiptTeam(team)}><Printer size={14} aria-hidden="true" /><span>View receipt</span></button><button type="button" onClick={() => void runAction(async () => { await api('/api/admin/resend-confirmation', { method: 'POST', body: JSON.stringify({ teamId: team.id }) }); setMessage(`Receipt email resent to ${team.leaderEmail}.`); await refreshTeams() })}><RefreshCw size={14} aria-hidden="true" /><span>Resend receipt</span></button></>}
              </div></td>
            </tr>)}
            {filteredTeams.length === 0 && <tr><td className="payment-table__empty" colSpan={6}>No shortlisted teams match this filter. Add a team or import a CSV to begin.</td></tr>}
          </tbody></table></div>
        </section>
        <button className="payment-logout" type="button" onClick={() => { setSession(''); setTeams([]); setError('') }}>Sign out</button>
      </div>}
      {error && !session && <p className="payment-alert" role="alert">{error}</p>}
      {receiptTeam && <PortalReceipt team={receiptTeam} onClose={() => setReceiptTeam(null)} />}
    </PaymentPortalFrame>
  )
}
