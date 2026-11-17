export type TimelineMilestone = {
  id: string
  title: string
  description: string
  time: string | null
}

export const timelineMilestones: TimelineMilestone[] = [
  { id: 'platform-arrival', title: 'PLATFORM ARRIVAL', description: 'Team check-in and registration.', time: 'November 24, 2026' },
  { id: 'the-sorting', title: 'THE SORTING', description: 'Opening ceremony and house allocation.', time: 'November 24, 2026' },
  { id: 'the-great-briefing', title: 'THE GREAT BRIEFING', description: 'Problem statement reveal and instructions.', time: 'November 24, 2026' },
  { id: 'the-building-begins', title: 'THE BUILDING BEGINS', description: '24-hour hackathon development phase.', time: 'November 24, 2026' },
  { id: 'the-final-spell', title: 'THE FINAL SPELL', description: 'Submission and project demonstrations.', time: 'November 25, 2026' },
  { id: 'the-judgement', title: 'THE JUDGEMENT', description: 'Jury evaluation and presentations.', time: 'November 25, 2026' },
  { id: 'the-grand-finale', title: 'THE GRAND FINALE', description: 'Winners announcement and prize distribution.', time: 'November 25, 2026' },
]
