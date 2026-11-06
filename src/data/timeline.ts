export type TimelineMilestone = {
  id: string
  title: string
  description: string
  time: string | null
}

export const timelineMilestones: TimelineMilestone[] = [
  { id: 'platform-arrival', title: 'PLATFORM ARRIVAL', description: 'Team check-in and registration.', time: null },
  { id: 'the-sorting', title: 'THE SORTING', description: 'Opening ceremony and house allocation.', time: null },
  { id: 'the-great-briefing', title: 'THE GREAT BRIEFING', description: 'Problem statement reveal and instructions.', time: null },
  { id: 'the-building-begins', title: 'THE BUILDING BEGINS', description: '24-hour hackathon development phase.', time: null },
  { id: 'the-final-spell', title: 'THE FINAL SPELL', description: 'Submission and project demonstrations.', time: null },
  { id: 'the-judgement', title: 'THE JUDGEMENT', description: 'Jury evaluation and presentations.', time: null },
  { id: 'the-grand-finale', title: 'THE GRAND FINALE', description: 'Winners announcement and prize distribution.', time: null },
]
