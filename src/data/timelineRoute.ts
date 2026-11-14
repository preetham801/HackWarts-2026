export const timelineRouteLeadIn = 0.17

export const timelineStationProgress = [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1] as const

// Broad, three-dimensional valley route. The train occupies a larger scenic stretch
// while the milestone progress ratios remain normalized and editable independently.
export const timelineRoutePoints = [
  [-72, 0, 5.4],
  [-48, 0, 3.6],
  [-24, 0, 0.9],
  [0, 0, -2.4],
  [24, 0, -4.2],
  [48, 0, -1.2],
  [72, 0, 3.3],
] as const

export function getTimelineRouteProgress(scrollProgress: number) {
  return timelineRouteLeadIn + scrollProgress * (1 - timelineRouteLeadIn)
}
