import { useState } from 'react'
import { useExpressJourney } from '../hooks/useExpressJourney'
import { SectionHeading } from '../components/SectionHeading'
import { TimelineScene3D } from '../components/TimelineScene3D'
import { timelineMilestones } from '../data/timeline'

const milestoneNumber = (index: number) => String(index + 1).padStart(2, '0')

export function TimelineSection() {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d')
  const { stageRef, progressRef, activeStop, stationArrival } = useExpressJourney(viewMode === '3d')
  const activeMilestone = timelineMilestones[activeStop]

  return (
    <section
      id="timeline"
      ref={stageRef}
      className={`section section--night section-anchor timeline-section${viewMode === '2d' ? ' timeline-section--2d' : ''}`}
      aria-labelledby="timeline-title"
    >
      <div className="section-inner express-inner timeline-pin-layout">
        <div className="timeline-heading-wrap">
          <SectionHeading id="timeline-title" eyebrow="Journey milestones" title="ALL ABOARD THE HACKWARTS EXPRESS." subtitle="A 24-hour journey through innovation." />
          <div className="timeline-view-toggle" role="group" aria-label="Timeline view mode">
            <button type="button" aria-pressed={viewMode === '3d'} onClick={() => setViewMode('3d')}>3D</button>
            <button type="button" aria-pressed={viewMode === '2d'} onClick={() => setViewMode('2d')}>2D</button>
          </div>
        </div>

        {viewMode === '3d' ? (
          <div className="express-stage">
            <div className="railway-scene">
              <TimelineScene3D progressRef={progressRef} />
              <span className="railway-scene-caption" aria-hidden="true">THE MOUNTAIN LINE · HACKWARTS EXPRESS</span>
              <div className={`timeline-spectral-reveal${stationArrival ? ' timeline-spectral-reveal--visible' : ''}`} aria-hidden="true">
                <p className="timeline-spectral-reveal__kicker">STOP {milestoneNumber(activeStop)} <span>·</span> {activeMilestone.time ?? 'To be announced'}</p>
                <h3 key={activeMilestone.id}>{activeMilestone.title}</h3>
                <p className="timeline-spectral-reveal__description">{activeMilestone.description}</p>
              </div>
              <ol className="timeline-progress-rail" aria-hidden="true">
                {timelineMilestones.map((milestone, index) => (
                  <li className={index < activeStop ? 'is-complete' : index === activeStop ? 'is-active' : ''} key={milestone.id}>
                    <span>{milestoneNumber(index)}</span>
                  </li>
                ))}
              </ol>
            </div>
            <ol className="visually-hidden" aria-label="HackWarts Express journey milestones">
              {timelineMilestones.map((milestone, index) => (
                <li key={milestone.id}>
                  <span>STOP {milestoneNumber(index)}</span>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                  <p>{milestone.time ?? 'To be announced'}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <ol className="timeline-2d-list" aria-label="HackWarts Express journey milestones">
            {timelineMilestones.map((milestone, index) => (
              <li className={`timeline-2d-stop${activeStop === index ? ' timeline-2d-stop--active' : ''}`} data-timeline-stop-index={index} key={milestone.id}>
                <span className="timeline-2d-stop__marker" aria-hidden="true">{milestoneNumber(index)}</span>
                <article className="timeline-2d-card">
                  <span className="timeline-2d-card__badge">STOP {milestoneNumber(index)}</span>
                  <h3>{milestone.title}</h3>
                  <p className="timeline-2d-card__time">{milestone.time ?? 'To be announced'}</p>
                  <p>{milestone.description}</p>
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
