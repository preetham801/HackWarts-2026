import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import logo from '../assets/branding/hackwarts-2026-logo.jpeg.jpeg'

const links = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'The Houses', href: '#houses' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Tracks', href: '#tracks' },
  { label: 'Prizes', href: '#rewards' },
  { label: 'Rules', href: '#rules' },
  { label: 'FAQs', href: '#faqs' },
]

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 24)
    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className={`site-header${isScrolled ? ' site-header--scrolled' : ''}`}>
      <nav aria-label="Main navigation" className="header-inner">
        <a href="#home" className="brand-link" onClick={closeMenu} aria-label="HackWarts 2026 home">
          <img src={logo} alt="HackWarts 2026" className="brand-logo" />
        </a>
        <div className="desktop-nav">
          {links.map((link) => <a className="nav-link" key={link.href} href={link.href}>{link.label}</a>)}
        </div>
        <a className="header-register" href="#registration">Register Now <ArrowUpRight size={15} aria-hidden="true" /></a>
        <button
          type="button"
          className="menu-toggle"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >{isMenuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </nav>
      <div id="mobile-navigation" className={`mobile-nav${isMenuOpen ? ' mobile-nav--open' : ''}`} hidden={!isMenuOpen}>
        {links.map((link) => <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>)}
        <a className="mobile-register" href="#registration" onClick={closeMenu}>Register Now <ArrowUpRight size={15} aria-hidden="true" /></a>
      </div>
    </header>
  )
}
