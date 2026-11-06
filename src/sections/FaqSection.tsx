import { SectionHeading } from '../components/SectionHeading'

const questions = [
  {
    id: 'eligibility',
    question: 'Who can participate?',
    answer: 'Eligibility information will be confirmed by the organizers.',
  },
  {
    id: 'team-size',
    question: 'How many members can be in a team?',
    answer: <>See the <a href="#rules">School Code</a> section for the confirmed team-size requirements.</>,
  },
  {
    id: 'registration-fee',
    question: 'What is the registration fee?',
    answer: <>See the <a href="#rules">School Code</a> section for the confirmed registration fee.</>,
  },
  {
    id: 'accommodation',
    question: 'Is accommodation available?',
    answer: 'Accommodation information will be confirmed by the organizers.',
  },
  {
    id: 'what-to-bring',
    question: 'What should participants bring?',
    answer: 'Information about what to bring will be confirmed by the organizers.',
  },
  {
    id: 'judging',
    question: 'What are the judging criteria?',
    answer: 'Judging information will be confirmed by the organizers.',
  },
  {
    id: 'food',
    question: 'Will food be provided?',
    answer: 'Food information will be confirmed by the organizers.',
  },
  {
    id: 'event-date',
    question: 'When will the event take place?',
    answer: 'To be announced.',
  },
]

export function FaqSection() {
  return (
    <section id="faqs" className="section section--night section-anchor" aria-labelledby="faqs-title">
      <span className="owl-perch-anchor owl-perch-anchor--faqs" data-owl-perch="faqs" aria-hidden="true" />
      <div className="section-inner section-inner--narrow">
        <SectionHeading id="faqs-title" eyebrow="Frequently asked questions" title="QUESTIONS BEFORE YOUR JOURNEY?" />
        <div className="faq-list">
          {questions.map(({ id, question, answer }) => (
            <details className="faq-item" key={id}>
              <summary>
                <span className="faq-question">{question}</span>
                <span className="faq-indicator" aria-hidden="true">+</span>
              </summary>
              <p className="faq-answer">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
