import { SectionHeading } from '../components/SectionHeading'

export function AboutSection() {
  return (
    <section id="about" className="section section--paper section-anchor" aria-labelledby="about-title">
      <span className="owl-perch-anchor owl-perch-anchor--about" data-owl-perch="about" aria-hidden="true" />
      <div className="about-layout about-layout--text-only">
        <div className="about-copy">
          <SectionHeading id="about-title" eyebrow="The invitation" title="YOUR LETTER HAS ARRIVED." align="left" />
          <div className="invitation-copy">
            <p>Dear Future Innovator,</p>
            <p>You are invited to enter HackWarts 2026 — a 24-hour journey where creativity meets technology, ideas become reality, and extraordinary minds come together.</p>
            <p>Gather your team. Prepare your skills. Your journey begins here.</p>
          </div>
          <p className="host-note">Sri Siddhartha School of Engineering</p>
        </div>
      </div>
    </section>
  )
}
