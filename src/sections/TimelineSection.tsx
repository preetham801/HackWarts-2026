import { useExpressJourney } from '../hooks/useExpressJourney'
import { SectionHeading } from '../components/SectionHeading'
import { RailwayLandscape } from '../components/RailwayLandscape'
import { timelineMilestones } from '../data/timeline'
import locomotiveAsset from '../assets/timeline/hackwarts-express-locomotive.png'

const milestoneNumber = (index: number) => String(index + 1).padStart(2, '0')

export function TimelineSection() {
  const { stageRef, sceneRef, locomotiveRef, mobileProgressRef } = useExpressJourney()

  return (
    <section id="timeline" className="section section--night section-anchor" aria-labelledby="timeline-title">
      <div className="section-inner express-inner">
        <SectionHeading id="timeline-title" eyebrow="Journey milestones" title="ALL ABOARD THE HACKWARTS EXPRESS." subtitle="A 24-hour journey through innovation." />

        <div className="express-stage" ref={stageRef}>
          <div className="railway-scene" ref={sceneRef} aria-hidden="true">
            <RailwayLandscape />
            <img
              ref={locomotiveRef}
              className="express-locomotive"
              src={locomotiveAsset}
              alt=""
              loading="lazy"
              decoding="async"
              draggable="false"
            />
            <span className="railway-scene-caption">THE MOUNTAIN LINE · HACKWARTS EXPRESS</span>
          </div>

          <div className="express-route-overlay" aria-hidden="true">
            <span className="express-route-progress"><span className="express-route-progress-fill" /></span>
            <ol className="express-route-markers">
              {timelineMilestones.map((milestone, index) => (
                <li key={milestone.id} data-express-marker={index}>
                  <span>{milestoneNumber(index)}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="express-stops-wrap">
            <span className="express-mobile-progress" aria-hidden="true">
              <span className="express-mobile-progress-fill" ref={mobileProgressRef} />
            </span>
            <ol className="express-stops" aria-label="HackWarts Express milestones">
              {timelineMilestones.map((milestone, index) => (
                <li className="express-stop" key={milestone.id} data-express-card={index}>
                  <span className="express-stop-marker" aria-hidden="true">{milestoneNumber(index)}</span>
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
