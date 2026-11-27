import { useState, type FormEvent } from 'react'
import { PaymentPortalFrame } from '../components/PaymentPortalFrame'
import { readApiResponse } from '../utils/apiResponse'

const domains = ['AgriTech', 'Sustainability & Development', 'EdTech & FinTech', 'Health & Safety'] as const
const hearAboutOptions = ['Instagram Reels', 'WhatsApp', 'Friends', 'College / Institution', 'Other'] as const
const ratingOptions = ['1 – Poor', '2 – Fair', '3 – Average', '4 – Good', '5 – Excellent']
const ratingQuestions = [
  ['overallExperience', '2. How would you rate your overall HackWarts experience?'],
  ['hackathonExperience', '3. How was your overall 24-hour hackathon experience?'],
  ['evaluationTransparency', '4. How would you rate the transparency of the evaluation process?'],
  ['venueFacilities', '5. How would you rate the venue and facilities?'],
  ['mentorSessionRating', '6. How would you rate the Mentor Session?'],
  ['mentorFeedbackUsefulness', '7. Was the mentor’s feedback useful and relevant to your project?'],
  ['evaluation1Rating', '8. How would you rate Evaluation 1?'],
  ['evaluation2Rating', '9. How would you rate Evaluation 2?'],
  ['evaluation3Rating', '10. How would you rate Evaluation 3?'],
] as const
type RatingKey = typeof ratingQuestions[number][0]

export default function FeedbackPage() {
  const [participantName, setParticipantName] = useState('')
  const [email, setEmail] = useState('')
  const [teamName, setTeamName] = useState('')
  const [leaderName, setLeaderName] = useState('')
  const [domain, setDomain] = useState<(typeof domains)[number] | ''>('')
  const [hearAbout, setHearAbout] = useState<(typeof hearAboutOptions)[number] | ''>('')
  const [otherHearAbout, setOtherHearAbout] = useState('')
  const [ratings, setRatings] = useState<Partial<Record<RatingKey, number>>>({})
  const [futureImprovements, setFutureImprovements] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [certificateEmail, setCertificateEmail] = useState('')
  const [submittedName, setSubmittedName] = useState('')

  const submitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (ratingQuestions.some(([key]) => !ratings[key])) {
      setError('Please select a rating for each question before submitting.')
      return
    }
    if (hearAbout === 'Other' && !otherHearAbout.trim()) {
      setError('Please tell us how you heard about HackWarts.')
      return
    }
    setBusy(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName,
          email,
          teamName,
          leaderName,
          domain,
          hearAbout: hearAbout === 'Other' ? otherHearAbout.trim() : hearAbout,
          ...ratings,
          futureImprovements,
        }),
      })
      const result = await readApiResponse<{ success: boolean; participantName: string; teamName: string }>(response)
      setCertificateEmail(email)
      setSubmittedName(result.participantName)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Feedback could not be submitted. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PaymentPortalFrame eyebrow="Post-event reflections · Certificate delivery" title="Help shape the next chapter." description="Share your HackWarts 2026 experience. After your team is verified on the confirmed paid roster, we’ll email your Certificate of Participation as a PDF.">
      {submittedName ? <section className="feedback-success" role="status">
        <p className="payment-eyebrow">Feedback received</p>
        <h2>Thank you, {submittedName}!</h2>
        <p>Thank you for being a part of HackWarts 2026! Your feedback will help us make the next edition even better. ❤️</p>
        <p>Your Certificate of Participation PDF was sent to <strong>{certificateEmail}</strong>.</p>
      </section> : <form className="feedback-form" onSubmit={submitFeedback}>
        <section className="feedback-form__section" aria-labelledby="feedback-verification-title">
          <p className="payment-eyebrow">Participant &amp; team verification</p>
          <h2 id="feedback-verification-title">Certificate details</h2>
          <div className="feedback-form__grid">
            <label>Participant Name <span>(printed on certificate)</span><input autoComplete="name" value={participantName} onChange={(event) => setParticipantName(event.target.value)} required maxLength={120} /></label>
            <label>Participant Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} /></label>
            <label>Team Name<input value={teamName} onChange={(event) => setTeamName(event.target.value)} required maxLength={120} /></label>
            <label>Team Leader Name<input value={leaderName} onChange={(event) => setLeaderName(event.target.value)} required maxLength={120} /></label>
            <label>Domain / House<select value={domain} onChange={(event) => setDomain(event.target.value as (typeof domains)[number] | '')} required><option value="" disabled>Select your domain</option>{domains.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          </div>
        </section>

        <section className="feedback-form__section" aria-labelledby="feedback-source-title">
          <p className="payment-eyebrow">Question 1</p>
          <h2 id="feedback-source-title">How did you hear about HackWarts 2026?</h2>
          <label className="feedback-form__select-label">Choose one option<select value={hearAbout} onChange={(event) => setHearAbout(event.target.value as (typeof hearAboutOptions)[number] | '')} required><option value="" disabled>Select an option</option>{hearAboutOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
          {hearAbout === 'Other' && <label className="feedback-form__other">Please specify<input value={otherHearAbout} onChange={(event) => setOtherHearAbout(event.target.value)} required maxLength={160} /></label>}
        </section>

        <section className="feedback-form__section" aria-label="Experience ratings">
          <p className="payment-eyebrow">Questions 2–10 · Rate from 1 to 5</p>
          {ratingQuestions.map(([key, question]) => <fieldset className="feedback-rating" key={key}>
            <legend>{question}</legend>
            <div className="feedback-rating__options" role="group" aria-label={question}>
              {ratingOptions.map((label, index) => {
                const value = index + 1
                return <button key={label} type="button" className={ratings[key] === value ? 'is-selected' : ''} aria-pressed={ratings[key] === value} onClick={() => setRatings((current) => ({ ...current, [key]: value }))}>
                  <strong>{value}</strong><span>{label.split(' – ')[1]}</span>
                </button>
              })}
            </div>
            <span className="feedback-rating__legend" aria-hidden="true">{ratingOptions.map((label) => <span key={label}>{label}</span>)}</span>
          </fieldset>)}
        </section>

        <section className="feedback-form__section" aria-labelledby="feedback-improve-title">
          <p className="payment-eyebrow">Question 11 · Optional</p>
          <h2 id="feedback-improve-title">What should we improve in future editions of HackWarts?</h2>
          <textarea rows={5} value={futureImprovements} onChange={(event) => setFutureImprovements(event.target.value)} maxLength={3000} />
        </section>
        {error && <p className="payment-alert" role="alert">{error}</p>}
        <button className="payment-button feedback-form__submit" type="submit" disabled={busy}>{busy ? 'Verifying team & sending certificate…' : 'Submit Feedback & Email My Certificate'}</button>
      </form>}
    </PaymentPortalFrame>
  )
}
