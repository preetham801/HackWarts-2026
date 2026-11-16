import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/branding/hackwarts-2026-logo-transparent.png'

const links = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'The Houses', href: '#houses' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Prizes', href: '#rewards' },
  { label: 'Rules', href: '#rules' },
  { label: 'FAQs', href: '#faqs' },
]

export function SiteHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isRegisterPage = pathname === '/register'
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const currentSection = isRegisterPage ? 'registration' : activeSection

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 24)
    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  useEffect(() => {
    if (isRegisterPage) return

    const sectionIds = [...links.map((link) => link.href.slice(1)), 'registration']
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section instanceof HTMLElement)

    if (sections.length === 0) return

    const updateActiveSection = () => {
      const activationLine = window.innerHeight * 0.35
      const currentSection = sections.find((section) => {
        const bounds = section.getBoundingClientRect()
        return bounds.top <= activationLine && bounds.bottom > activationLine
      })

      if (currentSection) {
        setActiveSection(currentSection.id)
      } else if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        setActiveSection(sections[sections.length - 1].id)
      }
    }

    const observer = new IntersectionObserver(updateActiveSection, {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    })
    sections.forEach((section) => observer.observe(section))
    updateActiveSection()

    return () => observer.disconnect()
  }, [isRegisterPage])

  useEffect(() => {
    if (!isMenuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)
  const navigateToSection = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    closeMenu()
    if (href === '#timeline') {
      event.preventDefault()
      navigate('/timeline')
      return
    }
    if (pathname === '/') return
    event.preventDefault()
    navigate('/')
    if (href === '#home') {
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 60)
      return
    }
    window.setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 80)
  }

  return (
    <header className={`site-header${isScrolled ? ' site-header--scrolled' : ''}`}>
      <nav aria-label="Main navigation" className="header-inner">
        <a href={pathname === '/' ? '#home' : '/'} className="brand-link" onClick={(event) => navigateToSection(event, '#home')} aria-label="HackWarts 2026 home" aria-current={currentSection === 'home' ? 'location' : undefined}>
          <img src={logo} alt="HackWarts 2026" className="brand-logo" />
        </a>
        <div className="desktop-nav">
          {links.map((link) => {
            const isActive = link.href === '#timeline' ? pathname === '/timeline' : currentSection === link.href.slice(1)
            return <a className={`nav-link${isActive ? ' nav-link--active' : ''}`} key={link.href} href={pathname === '/' ? link.href : `/${link.href}`} onClick={(event) => navigateToSection(event, link.href)} aria-current={isActive ? 'location' : undefined}>{link.label}</a>
          })}
        </div>
        <Link className={`header-register${currentSection === 'registration' ? ' header-register--active' : ''}`} to="/register" aria-current={currentSection === 'registration' ? 'location' : undefined}>Register Now <ArrowUpRight size={15} aria-hidden="true" /></Link>
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
        {links.map((link) => {
          const isActive = link.href === '#timeline' ? pathname === '/timeline' : currentSection === link.href.slice(1)
          return <a className={`mobile-nav__link${isActive ? ' mobile-nav__link--active' : ''}`} key={link.href} href={pathname === '/' ? link.href : `/${link.href}`} onClick={(event) => navigateToSection(event, link.href)} aria-current={isActive ? 'location' : undefined}>{link.label}</a>
        })}
        <Link className={`mobile-register${currentSection === 'registration' ? ' mobile-register--active' : ''}`} to="/register" onClick={closeMenu} aria-current={currentSection === 'registration' ? 'location' : undefined}>Register Now <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </div>
    </header>
  )
}
