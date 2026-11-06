import { SectionHeading } from '../components/SectionHeading'
import { Clock3, Coins, Ticket, Trophy, Users, UsersRound } from 'lucide-react'

const highlights = [
  { value: '24 HOURS', label: 'Non-stop hackathon', icon: Clock3 },
  { value: '2–4 MEMBERS', label: 'Team size', icon: Users },
  { value: '2 WOMEN MINIMUM', label: 'Per team', icon: UsersRound },
  { value: '₹499', label: 'Registration per team', icon: Ticket },
]

export function RewardsSection() {
  return (
    <section id="rewards" className="section section--dark section-anchor treasure-vault-section" aria-labelledby="rewards-title">
      <div className="section-inner">
        <SectionHeading id="rewards-title" eyebrow="The grand rewards" title="THE TREASURE VAULT" />
        <div className="prize-vault">
          <div className="prize-vault__aperture" aria-hidden="true" />
          <span className="prize-vault__coin" aria-hidden="true"><Coins size={25} strokeWidth={1.2} /></span>
          <div className="prize-feature">
            <p className="prize-label"><Trophy size={17} strokeWidth={1.4} aria-hidden="true" /> Prize Pool</p>
            <p className="prize-value">₹60,000</p>
          </div>
        </div>
        <ul className="highlight-grid" aria-label="HackWarts event details">
          {highlights.map(({ value, label, icon: Icon }) => (
            <li className="highlight-item" key={value}>
              <Icon className="highlight-icon" size={21} strokeWidth={1.35} aria-hidden="true" />
              <h3>{value}</h3>
              <p>{label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
