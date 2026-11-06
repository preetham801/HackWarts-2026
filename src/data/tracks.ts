import { Compass, Lightbulb, Palette, Rocket } from 'lucide-react'
import type { Track } from '../types/track'

// Names and taglines are provisional project content, not organizer-confirmed.
// Keep the description and details placeholders editable until official content is provided.
export const tracks: Track[] = [
  {
    id: 'build-bold',
    name: 'Build Bold',
    tagline: 'Create. Innovate. Lead.',
    description: 'Official track description will be announced.',
    details: 'Additional official details will be added here once confirmed.',
    chamber: 'foundry',
    contentStatus: 'provisional',
    icon: Rocket,
  },
  {
    id: 'think-smart',
    name: 'Think Smart',
    tagline: 'Analyze. Optimize. Evolve.',
    description: 'Official track description will be announced.',
    details: 'Additional official details will be added here once confirmed.',
    chamber: 'archive',
    contentStatus: 'provisional',
    icon: Lightbulb,
  },
  {
    id: 'dream-big',
    name: 'Dream Big',
    tagline: 'Design. Imagine. Inspire.',
    description: 'Official track description will be announced.',
    details: 'Additional official details will be added here once confirmed.',
    chamber: 'atelier',
    contentStatus: 'provisional',
    icon: Palette,
  },
  {
    id: 'go-further',
    name: 'Go Further',
    tagline: 'Explore. Build. Impact.',
    description: 'Official track description will be announced.',
    details: 'Additional official details will be added here once confirmed.',
    chamber: 'observatory',
    contentStatus: 'provisional',
    icon: Compass,
  },
]
