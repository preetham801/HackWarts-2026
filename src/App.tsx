import { SiteHeader } from './components/SiteHeader'
import { AboutSection } from './sections/AboutSection'
import { FaqSection } from './sections/FaqSection'
import { FooterStrip } from './sections/FooterStrip'
import { HeroSection } from './sections/HeroSection'
import { HousesSection } from './sections/HousesSection'
import { RegistrationSection } from './sections/RegistrationSection'
import { RewardsSection } from './sections/RewardsSection'
import { RulesSection } from './sections/RulesSection'
import { TimelineSection } from './sections/TimelineSection'
import { EnchantedWandCursor } from './components/EnchantedWandCursor'
import { useScrollReveal } from './hooks/useScrollReveal'

function App() {
  useScrollReveal()

  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <HousesSection />
        <TimelineSection />
        <RewardsSection />
        <RulesSection />
        <FaqSection />
        <RegistrationSection />
      </main>
      <FooterStrip />
      <EnchantedWandCursor />
    </div>
  )
}

export default App
