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
import { TracksSection } from './sections/TracksSection'

function App() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <HousesSection />
        <TimelineSection />
        <TracksSection />
        <RewardsSection />
        <RulesSection />
        <FaqSection />
        <RegistrationSection />
      </main>
      <FooterStrip />
    </div>
  )
}

export default App
