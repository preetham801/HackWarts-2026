import { ArrowUp, Sparkles } from 'lucide-react'
import { MagicalOwl } from '../components/MagicalOwl'
import logo from '../assets/branding/hackwarts-2026-logo-transparent.png'
import { CollaborationLogos } from '../components/CollaborationLogos'

const footerLinks = [
  ['Home', '#home'], ['About', '#about'], ['Houses', '#houses'], ['Timeline', '#timeline'],
  ['Rules', '#rules'], ['FAQs', '#faqs'],
]

export function FooterStrip() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <a href="#home" className="footer-brand" aria-label="HackWarts 2026 home"><img src={logo} alt="HackWarts 2026" /></a>
        <div className="footer-message"><p className="footer-tagline">Where Code Becomes Magic.</p><p><Sparkles size={13} aria-hidden="true" /> Presented by REZONX CLUB × INUNITY.</p><p>Hosted at Sri Siddhartha School of Engineering, Tumkur.</p></div>
        <a className="back-to-top" href="#home" aria-label="Back to top"><ArrowUp size={16} aria-hidden="true" /></a>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">{footerLinks.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>
      <p className="social-placeholder">Social links will be shared when available.</p>
      <div className="footer-collaboration"><CollaborationLogos variant="footer" /><p>In collaboration with RezonX, InUnity, and Sri Siddhartha School of Engineering</p></div>
      <MagicalOwl />
    </footer>
  )
}
