import { useState } from 'react'
import { SectionHeading } from '../components/SectionHeading'
import { HouseAnimalCrest } from '../components/HouseAnimalCrest'

const houses = [
  { name: 'Gryffindor', emblem: 'Lion', animal: 'lion', quality: 'Courage, bravery and bold thinking.', description: 'A House that celebrates courage, bravery, and the confidence to take bold decisions.', tone: 'crimson' },
  { name: 'Hufflepuff', emblem: 'Badger', animal: 'badger', quality: 'Dedication, loyalty and teamwork.', description: 'A House that values dedication, loyalty, patience, and the strength of working together.', tone: 'amber' },
  { name: 'Ravenclaw', emblem: 'Eagle', animal: 'eagle', quality: 'Wisdom, creativity and curiosity.', description: 'A House that encourages wisdom, curiosity, creativity, and thoughtful problem-solving.', tone: 'blue' },
  { name: 'Slytherin', emblem: 'Serpent', animal: 'serpent', quality: 'Ambition, strategy and determination.', description: 'A House that values ambition, strategic thinking, determination, and purposeful leadership.', tone: 'green' },
] as const

export function HousesSection() {
  const [exploredHouse, setExploredHouse] = useState<string | null>(null)

  return (
    <section id="houses" className="section section--dark section-anchor" aria-labelledby="houses-title">
      <div className="section-inner">
        <SectionHeading id="houses-title" eyebrow="Four identities · One challenge" title="CHOOSE YOUR HOUSE." subtitle="Four houses. Four identities. One extraordinary challenge." />
        <div className="house-grid">
          {houses.map((house, index) => {
            const isExpanded = exploredHouse === house.name
            const detailsId = `house-details-${house.tone}`

            return (
              <article className={`house-card house-card--${house.tone}${isExpanded ? ' is-explored' : ''}`} key={house.name}>
                <span className="house-index" aria-hidden="true">0{index + 1}</span>
                <span className="house-emblem" aria-hidden="true">
                  <HouseAnimalCrest animal={house.animal} />
                </span>
                <p className="house-symbol">{house.emblem}</p>
                <h3>{house.name}</h3>
                <p className="house-quality" id={`house-quality-${house.tone}`}>{house.quality}</p>
                <p className="house-detail" id={detailsId} hidden={!isExpanded}>{house.description}</p>
                <button
                  className="house-explore"
                  type="button"
                  aria-label={`${isExpanded ? 'Close Details' : 'Explore Qualities'} — ${house.name}`}
                  aria-controls={detailsId}
                  aria-expanded={isExpanded}
                  onClick={() => setExploredHouse((current) => current === house.name ? null : house.name)}
                >
                  {isExpanded ? 'Close Details' : 'Explore Qualities'}
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
