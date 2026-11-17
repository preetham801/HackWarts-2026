import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'

type Rule = {
  id: string
  term: string
  detail: string
}

const rules: Rule[] = [
  { id: 'team-size', term: 'Team size', detail: '2–4 members' },
  { id: 'team-composition', term: 'Team composition', detail: 'Minimum two women per team' },
  { id: 'registration', term: 'Registration fee', detail: '₹499 per coven (team).' },
  { id: 'hackathon-duration', term: 'Hackathon duration', detail: '24 hours' },
  { id: 'venue', term: 'Venue', detail: 'Sri Siddhartha School of Engineering (SSSE), Tumkur' },
  { id: 'event-date', term: 'Date', detail: 'November 24 & 25, 2026' },
]

function RuleAccordionItem({ rule }: { rule: Rule }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const triggerId = `rule-trigger-${rule.id}`
  const detailId = `rule-detail-${rule.id}`

  return (
    <article className="rule-item" data-reveal-item>
      <h3 className="rule-item__heading">
        <button
          id={triggerId}
          type="button"
          className="rule-item__button"
          aria-expanded={isExpanded}
          aria-controls={detailId}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <span className="rule-item__label">{rule.term}</span>
          <ChevronDown
            className={isExpanded ? 'rule-item__chevron rule-item__chevron--open' : 'rule-item__chevron'}
            size={19}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div id={detailId} className="rule-item__answer" role="region" aria-labelledby={triggerId} hidden={!isExpanded}>
        <p>{rule.detail}</p>
      </div>
    </article>
  )
}

export function RulesSection() {
  return (
    <section id="rules" className="section section--night section-anchor rules-section" aria-labelledby="rules-title">
      <span className="owl-perch-anchor owl-perch-anchor--rules" data-owl-perch="rules" aria-hidden="true" />
      <div className="section-inner section-inner--narrow">
        <SectionHeading className="reveal-on-scroll" id="rules-title" eyebrow="Rules and eligibility" title="THE SCHOOL CODE" />
        <div className="rules-list reveal-on-scroll" aria-label="Rules and eligibility">
          {rules.map((rule) => <RuleAccordionItem key={rule.id} rule={rule} />)}
        </div>
      </div>
    </section>
  )
}
