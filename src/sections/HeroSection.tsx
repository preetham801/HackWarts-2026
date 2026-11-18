import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import castleBackground from '../assets/hackwarts-magical-hero.png'
import logo from '../assets/branding/hackwarts-2026-logo-transparent.png'
import { CollaborationLogos } from '../components/CollaborationLogos'

export function HeroSection() {
  return (
    <section id="home" aria-labelledby="hero-title" className="hero section-anchor">
      <img className="hero-campus" src={castleBackground} alt="" aria-hidden="true" fetchPriority="high" />
      <div className="hero-overlay" aria-hidden="true" />
      <CollaborationLogos variant="hero" />
      <div className="hero-content">
        <p className="eyebrow hero-kicker">A 24-hour school of digital magic</p>
        <img className="hero-logo" src={logo} alt="HackWarts 2026" />
        <h1 id="hero-title" className="hero-tagline">Where Code Becomes Magic.</h1>
        <p className="hero-intro">A national level hackathon hosted at Sri Siddhartha School of Engineering.</p>
        <div className="hero-actions">
          <Link className="button button--gold" to="/register">Register Now <ArrowUpRight size={16} aria-hidden="true" /></Link>
          <a className="button button--quiet" href="#about">Explore the School</a>
        </div>
        <p className="hero-date">November 25 &amp; 26, 2026</p>
      </div>
      <a href="#about" className="scroll-cue" aria-label="Scroll to the invitation"><span>Discover</span><ArrowDown size={16} aria-hidden="true" /></a>
    </section>
  )
}
