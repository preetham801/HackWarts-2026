import type { LucideIcon } from 'lucide-react'

export type TrackChamber = 'foundry' | 'archive' | 'atelier' | 'observatory'
export type TrackContentStatus = 'provisional' | 'confirmed'

export type Track = {
  id: string
  name: string
  tagline: string
  description: string
  details: string
  chamber: TrackChamber
  contentStatus: TrackContentStatus
  icon: LucideIcon
}
