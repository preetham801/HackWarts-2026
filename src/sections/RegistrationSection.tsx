import { SectionHeading } from '../components/SectionHeading'

const registrationFields = [
  ['Team name', 'text'],
  ['Team leader name', 'text'],
  ['Email address', 'email'],
  ['Phone number', 'tel'],
  ['College name', 'text'],
  ['Number of team members', 'number'],
]

export function RegistrationSection() {
  return (
    <section id="registration" className="section section--dark section-anchor" aria-labelledby="registration-title">
      <span className="owl-perch-anchor owl-perch-anchor--registration" data-owl-perch="registration" aria-hidden="true" />
      <div className="section-inner section-inner--narrow">
        <SectionHeading id="registration-title" eyebrow="Registration" title="YOUR JOURNEY BEGINS HERE." subtitle="Gather your coven. Claim your place." />
        <div className="registration-panel">
          <p className="registration-fee">₹499 <span>per team</span></p>
          <p className="registration-note">Registration details will be provided when the official process is ready.</p>
          <form className="registration-form" aria-label="Registration form preview">
            <fieldset disabled className="registration-fields">
              <legend className="visually-hidden">Registration form preview</legend>
              <div className="registration-field-group registration-field-group--primary">
                {registrationFields.map(([label, type]) => <label key={label}>{label}<input type={type} name={label.toLowerCase().replaceAll(' ', '-')} /></label>)}
              </div>
              <div className="registration-field-group registration-field-group--additional">
                <label className="field-span">Member details<textarea name="member-details" rows={3} /></label>
                <label>House preference (if applicable)<select name="house-preference" defaultValue=""><option value="">Select a house</option><option>Gryffindor</option><option>Hufflepuff</option><option>Ravenclaw</option><option>Slytherin</option></select></label>
              </div>
              <label className="confirmation-field"><input type="checkbox" name="required-confirmations" /> Required confirmations (details to be confirmed)</label>
              <button type="button" className="button button--gold" disabled>Register your coven</button>
            </fieldset>
          </form>
        </div>
      </div>
    </section>
  )
}
