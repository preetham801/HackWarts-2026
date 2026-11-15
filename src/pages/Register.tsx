import { useState, type FormEvent } from 'react'
import { SectionHeading } from '../components/SectionHeading'
import { FooterStrip } from '../sections/FooterStrip'

type RegistrationPayload = {
  teamName: string
  leaderName: string
  email: string
  phone: string
  college: string
  teamSize: number
  member1: string
  member2: string
  member3: string
  member4: string
  house: string
}

type RazorpayResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description: string
  prefill: {
    name: string
    email: string
    contact: string
  }
  handler: (response: RazorpayResponse) => void
  modal: {
    ondismiss: () => void
  }
}

type RazorpayCheckout = {
  open: () => void
  on: (
    event: 'payment.failed',
    handler: (response: { error?: { code?: string; description?: string; reason?: string } }) => void,
  ) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout
  }
}

let razorpayScriptPromise: Promise<void> | undefined

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve()
  if (razorpayScriptPromise) return razorpayScriptPromise

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      razorpayScriptPromise = undefined
      reject(new Error('Razorpay Checkout could not be loaded. Check your connection and try again.'))
    }
    document.body.appendChild(script)
  })

  return razorpayScriptPromise
}

const registrationFields = [
  { label: 'Team name', name: 'teamName', type: 'text' },
  { label: 'Team leader name', name: 'leaderName', type: 'text' },
  { label: 'Email address', name: 'email', type: 'email' },
  { label: 'Phone number', name: 'phone', type: 'tel' },
  { label: 'College name', name: 'college', type: 'text' },
  { label: 'Number of team members', name: 'teamSize', type: 'number' },
] as const

function readFormValue(formData: FormData, name: string) {
  return formData.get(name)?.toString().trim() ?? ''
}

function Register() {
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [paymentId, setPaymentId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    const form = event.currentTarget
    if (!form.reportValidity()) return

    const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL
    if (!appsScriptUrl) {
      setErrorMessage('Registration submission is not configured. Please contact the event organizers.')
      return
    }

    const formData = new FormData(form)
    const payload: RegistrationPayload = {
      teamName: readFormValue(formData, 'teamName'),
      leaderName: readFormValue(formData, 'leaderName'),
      email: readFormValue(formData, 'email'),
      phone: readFormValue(formData, 'phone'),
      college: readFormValue(formData, 'college'),
      teamSize: Number(readFormValue(formData, 'teamSize')),
      member1: readFormValue(formData, 'member1'),
      member2: readFormValue(formData, 'member2'),
      member3: readFormValue(formData, 'member3'),
      member4: readFormValue(formData, 'member4'),
      house: readFormValue(formData, 'house'),
    }

    setIsLoading(true)
    try {
      const [_, orderResponse] = await Promise.all([
        loadRazorpayScript(),
        fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 49900 }),
        }),
      ])
      const orderData = await orderResponse.json()
      if (!orderResponse.ok) {
        throw new Error(orderData.error ?? 'Could not create a payment order. Please try again.')
      }
      if (
        typeof orderData.key_id !== 'string' ||
        typeof orderData.order_id !== 'string' ||
        typeof orderData.amount !== 'number' ||
        typeof orderData.currency !== 'string'
      ) {
        throw new Error('The server returned an invalid payment order.')
      }
      if (!window.Razorpay) throw new Error('Razorpay Checkout did not initialize. Please try again.')

      const checkout = new window.Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: 'HackWarts 2026',
        description: 'Team registration',
        prefill: {
          name: payload.leaderName,
          email: payload.email,
          contact: payload.phone,
        },
        handler: (response) => {
          void (async () => {
            setPaymentId(response.razorpay_payment_id)
            try {
              const verificationResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response),
              })
              const verificationData = await verificationResponse.json()
              if (!verificationResponse.ok || verificationData.verified !== true) {
                throw new Error(verificationData.error ?? 'Payment verification failed.')
              }

              await fetch(appsScriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
                body: JSON.stringify({ ...payload, paymentId: response.razorpay_payment_id }),
              })
              setErrorMessage('')
              setIsRegistered(true)
            } catch (error) {
              setErrorMessage(error instanceof Error
                ? `${error.message} Your payment ID is ${response.razorpay_payment_id}; contact the event organizers before retrying payment.`
                : `Payment could not be verified or submitted. Your payment ID is ${response.razorpay_payment_id}; contact the event organizers before retrying payment.`)
            } finally {
              setIsLoading(false)
            }
          })()
        },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
      })

      checkout.on('payment.failed', (response) => {
        const details = response.error
        setErrorMessage([
          details?.description ?? 'Payment failed. Please try again.',
          details?.code && `Code: ${details.code}`,
          details?.reason && `Reason: ${details.reason}`,
        ].filter(Boolean).join(' — '))
        setIsLoading(false)
      })
      checkout.open()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to start checkout. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <>
      <main>
        <section id="registration" className="section section--dark section-anchor registration-page" aria-labelledby="registration-title">
          <div className="section-inner section-inner--narrow">
            <SectionHeading id="registration-title" eyebrow="Registration" title="YOUR JOURNEY BEGINS HERE." subtitle="Gather your coven. Claim your place." />
            {isRegistered ? (
              <section className="registration-panel registration-success" aria-labelledby="registration-success-title" role="status">
                <p className="eyebrow">Registration</p>
                <h2 id="registration-success-title">Coven Registered</h2>
                <p>Your payment signature was verified and your registration submission was sent.</p>
                <p className="registration-success__payment">Payment ID: <strong>{paymentId}</strong></p>
                <p className="registration-success__notice">Keep your payment ID for reference. The registration-sheet endpoint does not provide a browser-verifiable save confirmation.</p>
              </section>
            ) : (
              <div className="registration-panel">
                <p className="registration-fee">₹499 <span>per team</span></p>
                <p className="registration-note">Complete your team details to continue to secure checkout.</p>
                <form className="registration-form" aria-label="Team registration form" onSubmit={handleSubmit}>
                  <fieldset className="registration-fields">
                    <legend className="visually-hidden">Team registration details</legend>
                    <div className="registration-field-group registration-field-group--primary">
                      {registrationFields.map(({ label, name, type }) => (
                        <label key={name}>
                          {label}
                          <input
                            type={type}
                            name={name}
                            required
                            min={type === 'number' ? 1 : undefined}
                            pattern={name === 'phone' ? '[0-9]{10}' : undefined}
                            inputMode={name === 'phone' ? 'numeric' : undefined}
                            title={name === 'phone' ? 'Enter a 10-digit phone number.' : undefined}
                          />
                        </label>
                      ))}
                    </div>
                    <div className="registration-field-group registration-field-group--additional">
                      {[1, 2, 3, 4].map((member) => (
                        <label key={member}>Member {member} Details<input type="text" name={`member${member}`} /></label>
                      ))}
                      <label>House preference (if applicable)<select name="house" defaultValue=""><option value="">Select a house</option><option>Gryffindor</option><option>Hufflepuff</option><option>Ravenclaw</option><option>Slytherin</option></select></label>
                    </div>
                    <label className="confirmation-field"><input type="checkbox" name="confirmation" required /> I confirm these team details are accurate.</label>
                    {errorMessage && <p className="registration-error" role="alert">{errorMessage}{paymentId && <> Payment ID: <strong>{paymentId}</strong></>}</p>}
                    <button type="submit" className="button button--gold" disabled={isLoading}>
                      {isLoading ? 'Processing...' : 'Register your coven — ₹499'}
                    </button>
                    {isLoading && <p className="registration-loading" role="status">Processing your registration. Please keep this page open.</p>}
                  </fieldset>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>
      <FooterStrip />
    </>
  )
}

export default Register
