import { SectionHeading } from '../components/SectionHeading'
import { Link } from 'react-router-dom'
import gryffindorCrest from '../assets/tracks/gryffindor-crest.png'
import hufflepuffCrest from '../assets/tracks/hufflepuff-crest.png'
import ravenclawCrest from '../assets/tracks/ravenclaw-crest.png'
import slytherinCrest from '../assets/tracks/slytherin-crest.png'

const houses = [
  { name: 'Gryffindor', crest: gryffindorCrest, quality: 'Courage, bravery and bold thinking.', track: 'Health & Safety', tone: 'crimson' },
  { name: 'Hufflepuff', crest: hufflepuffCrest, quality: 'Dedication, loyalty and teamwork.', track: 'Sustainability & Development', tone: 'amber' },
  { name: 'Ravenclaw', crest: ravenclawCrest, quality: 'Wisdom, creativity and curiosity.', track: 'EdTech & FinTech', tone: 'blue' },
  { name: 'Slytherin', crest: slytherinCrest, quality: 'Ambition, strategy and determination.', track: 'AgriTech', tone: 'green' },
] as const

export function HousesSection() {
  return (
    <section id="houses" className="section section--dark section-anchor houses-section" aria-labelledby="houses-title">
      <div className="section-inner">
        <SectionHeading id="houses-title" eyebrow="Four identities · One challenge" title="CHOOSE YOUR HOUSE." subtitle="Four houses. Four identities. One extraordinary challenge." />
        <div className="house-grid">
          {houses.map((house, index) => {
            return (
              <article className={`house-card house-card--${house.tone}`} key={house.name}>
                <span className="house-index" aria-hidden="true">0{index + 1}</span>
                <span className="house-emblem">
                  <img
                    className="house-crest-image"
                    src={house.crest}
                    alt={`${house.name} heraldic crest`}
                    width="112"
                    height="140"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <h3>{house.name}</h3>
                <p className="house-track-label">Designated track</p>
                <p className="house-track-title">{house.track}</p>
                <p className="house-quality" id={`house-quality-${house.tone}`}>{house.quality}</p>
                <div className="house-card-actions">
                  <Link className="house-view-details" to={`/houses/${house.name.toLowerCase()}`}>
                    View Details
                    <span className="sr-only"> for {house.name}</span>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
