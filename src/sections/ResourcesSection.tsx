import { Download, ExternalLink, FileText, Presentation } from 'lucide-react'

const brochureHref = '/downloads/HackWarts-2026-Brochure.pdf'
const templateHref = '/downloads/HackWarts-2026-PPT-Template.pptx'

export function ResourcesSection() {
  return (
    <section id="resources" className="section section--night resources-section" aria-labelledby="resources-title">
      <div className="section-inner">
        <p className="eyebrow">Official materials</p>
        <h2 id="resources-title">OFFICIAL SCROLLS &amp; RESOURCES</h2>
        <p className="resources-section__intro">The event brochure and presentation template are available here.</p>
        <div className="resources-grid">
          <article className="resource-card">
            <FileText className="resource-card__icon" size={30} aria-hidden="true" />
            <p className="resource-card__format">PDF · Official document</p>
            <h3>Event Brochure</h3>
            <p>Complete guide to HackWarts 2026 — tracks, schedule, judging criteria, prizes, and campus details.</p>
            <div className="resource-card__actions">
              <a href={brochureHref} target="_blank" rel="noopener noreferrer">View Brochure <ExternalLink size={15} aria-hidden="true" /></a>
              <a href={brochureHref} download="HackWarts-2026-Brochure.pdf">Download PDF <Download size={15} aria-hidden="true" /></a>
            </div>
          </article>
          <article className="resource-card">
            <Presentation className="resource-card__icon" size={30} aria-hidden="true" />
            <p className="resource-card__format">PPTX · Official template</p>
            <h3>Pitch Deck / PPT Template</h3>
            <p>Mandatory presentation deck template for team submissions and final round pitching.</p>
            <div className="resource-card__actions">
              <a href={templateHref} download="HackWarts-2026-PPT-Template.pptx">Download PPT Template <Download size={15} aria-hidden="true" /></a>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
