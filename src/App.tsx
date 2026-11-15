import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { SiteHeader } from './components/SiteHeader'
import { EnchantedWandCursor } from './components/EnchantedWandCursor'
import { WizardingBgmPlayer } from './components/WizardingBgmPlayer'
import { AboutSection } from './sections/AboutSection'
import { FaqSection } from './sections/FaqSection'
import { FooterStrip } from './sections/FooterStrip'
import { HeroSection } from './sections/HeroSection'
import { HousesSection } from './sections/HousesSection'
import { RewardsSection } from './sections/RewardsSection'
import { RulesSection } from './sections/RulesSection'
import { TimelineSection } from './sections/TimelineSection'
import { useScrollReveal } from './hooks/useScrollReveal'
import Register from './pages/Register'

function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <AboutSection />
        <HousesSection />
        <TimelineSection />
        <RewardsSection />
        <RulesSection />
        <FaqSection />
      </main>
      <FooterStrip />
    </>
  )
}

function App() {
  useScrollReveal()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="site-shell">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <EnchantedWandCursor />
      <WizardingBgmPlayer />
    </div>
  )
}

export default App
