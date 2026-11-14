import { useExpressJourney } from '../hooks/useExpressJourney'
import { SectionHeading } from '../components/SectionHeading'
import { TimelineScene3D } from '../components/TimelineScene3D'
import { timelineMilestones } from '../data/timeline'

const milestoneNumber = (index: number) => String(index + 1).padStart(2, '0')

export function TimelineSection() {
  const { stageRef, progressRef } = useExpressJourney()

  return (
    <section id="timeline" className="section section--night section-anchor" aria-labelledby="timeline-title">
      <div className="section-inner express-inner">
        <SectionHeading id="timeline-title" eyebrow="Journey milestones" title="ALL ABOARD THE HACKWARTS EXPRESS." subtitle="A 24-hour journey through innovation." />

        <div className="express-stage" ref={stageRef}>
          <div className="railway-scene">
            <TimelineScene3D progressRef={progressRef} />
            <span className="railway-scene-caption" aria-hidden="true">THE MOUNTAIN LINE · HACKWARTS EXPRESS</span>
            <ol className="express-stops" aria-label="HackWarts Express milestones">
              {timelineMilestones.map((milestone, index) => (
                <li
                  className={`express-stop express-stop--${index % 2 === 0 ? 'above' : 'below'} express-stop--card-${index % 2 === 0 ? 'right' : 'left'}`}
                  key={milestone.id}
                  data-express-card={index}
                >
                  <span className="express-stop-marker" data-express-marker={index} aria-hidden="true">{milestoneNumber(index)}</span>
                  <article className="express-stop-card">
                    <span className="express-stop-highlight" aria-hidden="true" />
                    <div className="express-stop-content">
                      <p className="express-stop-kicker">STOP {milestoneNumber(index)}</p>
                      <h3>{milestone.title}</h3>
                      <p className="express-stop-description">{milestone.description}</p>
                      <p className="express-stop-time">{milestone.time ?? 'To be announced'}</p>
                      <span className="express-stop-state" aria-hidden="true">
                        <span className="express-state express-state--completed">✓ COMPLETED</span>
                        <span className="express-state express-state--current">▶ IN PROGRESS</span>
                        <span className="express-state express-state--next">◷ UP NEXT</span>
                      </span>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </div>

      </div>
    </section>
  )
}
