import { TrackCard } from '../components/TrackCard'
import { SectionHeading } from '../components/SectionHeading'
import { tracks } from '../data/tracks'

export function TracksSection() {
  return (
    <section id="tracks" className="section section--night section-anchor tracks-section" aria-labelledby="tracks-title">
      <div className="section-inner">
        <SectionHeading id="tracks-title" eyebrow="The challenge" title="ENTER THE CHAMBERS OF INNOVATION." subtitle="Every great invention begins with a challenge." />
        <ul className="tracks-grid" aria-label="HackWarts challenge tracks">
          {tracks.map((track) => (
            <li key={track.id}>
              <TrackCard track={track} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
