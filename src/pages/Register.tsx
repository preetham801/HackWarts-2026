import { useState, type FormEvent } from 'react'
import { SectionHeading } from '../components/SectionHeading'
import { FooterStrip } from '../sections/FooterStrip'

const MAX_PPT_SIZE = 3 * 1024 * 1024
const PPT_MIME_TYPES: Record<string, string> = {
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdf: 'application/pdf',
}

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
  pptBase64: string
  pptFileName: string
  pptMimeType: string
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

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read the selected Project PPT.'))
        return
      }
      const base64 = reader.result.split(',')[1]
      if (!base64) {
        reject(new Error('Could not read the selected Project PPT.'))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Could not read the selected Project PPT. Please try again.'))
    reader.onabort = () => reject(new Error('Reading the selected Project PPT was interrupted. Please try again.'))
    reader.readAsDataURL(file)
  })
}

function Register() {
  const [isLoading, setIsLoading] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    const form = event.currentTarget
    if (!form.reportValidity()) return

    const formData = new FormData(form)
    const pptFile = formData.get('projectPpt')
    if (!(pptFile instanceof File) || pptFile.size === 0) {
      setErrorMessage('Please choose your Project PPT or deck.')
      return
    }
    if (pptFile.size > MAX_PPT_SIZE) {
      setErrorMessage('The Project PPT must be 3 MB or smaller.')
      return
    }
    if (!/\.(ppt|pptx|pdf)$/i.test(pptFile.name)) {
      setErrorMessage('Upload a .ppt, .pptx, or .pdf file.')
      return
    }

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
      pptBase64: '',
      pptFileName: pptFile.name,
      pptMimeType: PPT_MIME_TYPES[pptFile.name.split('.').pop()?.toLowerCase() ?? ''] ?? pptFile.type,
    }

    setIsLoading(true)
    try {
      payload.pptBase64 = await readFileAsBase64(pptFile)
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseText = await response.text()
      let result: { success?: boolean; error?: string }
      try {
        result = JSON.parse(responseText)
      } catch {
        throw new Error(
          responseText
            ? `Registration service returned an invalid response (HTTP ${response.status}). Please contact the event organizers.`
            : `Registration service returned an empty response (HTTP ${response.status}). Please contact the event organizers.`,
        )
      }
      if (!response.ok || result.success !== true) {
        throw new Error(result.error ?? 'Could not save your registration. Please try again.')
      }
      setRegisteredEmail(payload.email)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to submit your registration. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <main>
        <section id="registration" className="section section--dark section-anchor registration-page" aria-labelledby="registration-title">
          <div className="section-inner section-inner--narrow">
            <SectionHeading id="registration-title" eyebrow="Registration" title="YOUR JOURNEY BEGINS HERE." subtitle="Gather your coven. Claim your place." />
            {registeredEmail ? (
              <section className="registration-panel registration-success" aria-labelledby="registration-success-title" role="status">
                <p className="eyebrow">Registration</p>
                <h2 id="registration-success-title">Coven Registered</h2>
                <p>Your Round 1 registration and project PPT were saved.</p>
                <p className="registration-success__notice">A confirmation email has been sent to the Team Leader&apos;s email address: <strong>{registeredEmail}</strong>.</p>
              </section>
            ) : (
              <div className="registration-panel">
                <p className="registration-note">Registration is ₹499 per coven. Complete your team details and upload your project deck.</p>
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
                            min={type === 'number' ? 2 : undefined}
                            max={type === 'number' ? 4 : undefined}
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
                    <label className="registration-ppt-field">
                      Project PPT / Deck
                      <input type="file" name="projectPpt" accept=".ppt,.pptx,.pdf" required aria-describedby="project-ppt-help" />
                      <span id="project-ppt-help">Accepted formats: .ppt, .pptx, or .pdf. Maximum file size: 3 MB.</span>
                    </label>
                    <label className="confirmation-field"><input type="checkbox" name="confirmation" required /> I confirm these team details are accurate.</label>
                    {errorMessage && <p className="registration-error" role="alert">{errorMessage}</p>}
                    <button type="submit" className="button button--gold" disabled={isLoading}>
                      {isLoading ? 'Submitting...' : 'REGISTER YOUR COVEN'}
                    </button>
                    {isLoading && <p className="registration-loading" role="status">Saving your registration and Project PPT. Please keep this page open.</p>}
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
