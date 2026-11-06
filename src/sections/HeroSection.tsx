import { ArrowDown, ArrowUpRight } from 'lucide-react'
import castleBackground from '../assets/campus/castle-background.jpg.jpg'
import logo from '../assets/branding/hackwarts-2026-logo.jpeg.jpeg'

export function HeroSection() {
  return (
    <section id="home" aria-labelledby="hero-title" className="hero section-anchor">
      <img className="hero-campus" src={castleBackground} alt="" aria-hidden="true" fetchPriority="high" />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow hero-kicker">A 24-hour school of digital magic</p>
        <img className="hero-logo" src={logo} alt="HackWarts 2026" />
        <h1 id="hero-title" className="hero-tagline">Where Code Becomes Magic.</h1>
        <p className="hero-intro">A national level hackathon hosted at Sri Siddhartha School of Engineering.</p>
        <div className="hero-actions">
          <a className="button button--gold" href="#registration">Register Now <ArrowUpRight size={16} aria-hidden="true" /></a>
          <a className="button button--quiet" href="#about">Explore the School</a>
        </div>
        <p className="hero-date">Event date to be announced</p>
      </div>
      <a href="#about" className="scroll-cue" aria-label="Scroll to the invitation"><span>Discover</span><ArrowDown size={16} aria-hidden="true" /></a>
    </section>
  )
}
