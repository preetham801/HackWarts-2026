import { Phone } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'

const questions = [
  {
    id: 'event-details',
    question: 'When and where is HackWarts 2026 taking place?',
    answer: <>
      <p>HackWarts 2026 is a 24-hour non-stop national-level hackathon taking place on <strong>November 25 &amp; 26, 2026</strong> at <strong>Sri Siddhartha School of Engineering (SSSE), Tumkur</strong>.</p>
      <p>It is organized by <strong>RezonX Club × InUnity × Sri Siddhartha School of Engineering</strong>.</p>
    </>,
  },
  {
    id: 'team-size',
    question: 'What is the required team size and composition?',
    answer: <>Each coven (team) must have <strong>2 to 4 participants</strong>, and <strong>at least two women participants are mandatory</strong> in every coven.</>,
  },
  {
    id: 'registration-fee',
    question: 'What is the participation fee?',
    answer: <>The registration fee is <strong>₹499 per coven (team)</strong>. It covers full 24-hour participation, mentor checkpoints, food, refreshments, and snacks.</>,
  },
  {
    id: 'house-tracks',
    question: 'What are the four Houses and Tracks?',
    answer: <>
      <p>Choose one House and build a solution aligned with its designated track:</p>
      <ul>
        <li><strong>Gryffindor — Health &amp; Safety:</strong> Health Care, Mental Health, Accessibility, Women’s Safety, Cyber Security, and Disaster Safety.</li>
        <li><strong>Hufflepuff — Sustainability &amp; Development:</strong> Waste, Water, Energy, Climate, and Smart Campus &amp; City, Civic &amp; Community Development.</li>
        <li><strong>Ravenclaw — EdTech &amp; FinTech:</strong> Learning Tools, Skill Building, Digital Payments, Financial Literacy, and Fraud Prevention.</li>
        <li><strong>Slytherin — AgriTech:</strong> Farming, Crop &amp; Soil Health, Irrigation, Food Supply, and Rural Livelihoods.</li>
      </ul>
    </>,
  },
  {
    id: 'prize-pool',
    question: 'What is the prize pool for HackWarts 2026?',
    answer: <>HackWarts 2026 features a <strong>total prize pool of ₹60,000</strong> for top-performing teams, along with winner certificates, recognition, and mentorship opportunities.</>,
  },
  {
    id: 'rounds-and-judging',
    question: 'What are the competition rounds and judging criteria?',
    answer: <>
      <p>The hackathon progresses through four stages:</p>
      <ol>
        <li>Registration &amp; Track Selection</li>
        <li>Idea / Problem Validation</li>
        <li>Build &amp; Mentor Checkpoint</li>
        <li>Final Demo &amp; Presentation</li>
      </ol>
      <p>Projects are evaluated on Problem Understanding, Technical Execution, Innovation, Impact &amp; Feasibility, and Presentation.</p>
    </>,
  },
  {
    id: 'build-and-bring',
    question: 'What do we need to build and bring to the venue?',
    answer: <>Every coven must build a <strong>working prototype or demonstrable proof of concept</strong> aligned with its chosen track. Bring your own laptops, chargers, and any required hardware or project materials.</>,
  },
  {
    id: 'food-and-mentorship',
    question: 'Will food, snacks, and mentorship be provided during the 24 hours?',
    answer: <>Yes. Organizers provide mentor guidance, food, refreshments, and snacks throughout the 24-hour sprint.</>,
  },
  {
    id: 'coordinator-contact',
    question: 'Who can I contact for queries or registration support?',
    answer: <>
      <p>For questions regarding registration, tracks, or event logistics, reach out to our student coordinators:</p>
      <ul className="faq-coordinator-list">
        <li><strong>Akhil Reddy:</strong> <a href="tel:+919364086869"><Phone size={14} aria-hidden="true" />+91 93640 86869</a></li>
        <li><strong>Zain:</strong> <a href="tel:+917019031907"><Phone size={14} aria-hidden="true" />+91 70190 31907</a></li>
        <li><strong>Chandana:</strong> <a href="tel:+916360943289"><Phone size={14} aria-hidden="true" />+91 63609 43289</a></li>
      </ul>
    </>,
  },
]

export function FaqSection() {
  return (
    <section id="faqs" className="section section--night section-anchor faq-section" aria-labelledby="faqs-title">
      <span className="owl-perch-anchor owl-perch-anchor--faqs" data-owl-perch="faqs" aria-hidden="true" />
      <div className="section-inner section-inner--narrow">
        <SectionHeading className="reveal-on-scroll" id="faqs-title" eyebrow="Frequently asked questions" title="QUESTIONS BEFORE YOUR JOURNEY?" />
        <div className="faq-list reveal-on-scroll">
          {questions.map(({ id, question, answer }) => (
            <details className="faq-item" data-reveal-item key={id}>
              <summary>
                <span className="faq-question">{question}</span>
                <span className="faq-indicator" aria-hidden="true">+</span>
              </summary>
              <div className="faq-answer">{answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
