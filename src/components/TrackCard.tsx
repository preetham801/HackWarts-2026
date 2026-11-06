import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Track } from '../types/track'

type TrackCardProps = {
  track: Track
}

export function TrackCard({ track }: TrackCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const Icon = track.icon
  const detailsId = `track-details-${track.id}`

  return (
    <article className={`track-card track-card--${track.chamber}`} aria-labelledby={`track-title-${track.id}`}>
      <div className="track-card__frame" aria-hidden="true" />
      <div className="track-card__content">
        <div className="track-card__eyebrow">
          <span>CHAMBER</span>
          <span className="track-card__rule" aria-hidden="true" />
          <span>{track.chamber.toUpperCase()}</span>
        </div>

        <span className="track-card__icon" aria-hidden="true">
          <Icon size={30} strokeWidth={1.35} />
        </span>

        <h3 id={`track-title-${track.id}`}>{track.name}</h3>
        <p className="track-card__tagline">{track.tagline}</p>
        <p className="track-card__description">{track.description}</p>

        <div className="track-card__actions">
          <button
            type="button"
            className="track-card__button"
            aria-label={`${isExpanded ? 'Close details for' : 'Explore'} ${track.name}`}
            aria-expanded={isExpanded}
            aria-controls={detailsId}
            onClick={() => setIsExpanded((expanded) => !expanded)}
          >
            <span>{isExpanded ? 'CLOSE DETAILS' : 'EXPLORE TRACK'}</span>
            <ChevronDown size={15} strokeWidth={1.5} aria-hidden="true" className={isExpanded ? 'track-card__chevron track-card__chevron--open' : 'track-card__chevron'} />
          </button>
          <div id={detailsId} className="track-card__details" hidden={!isExpanded}>
            <p>{track.details}</p>
          </div>
        </div>
      </div>
    </article>
  )
}
