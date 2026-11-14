export const timelineRouteLeadIn = 0.17

export const timelineStationProgress = [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1] as const

export function getTimelineRouteProgress(scrollProgress: number) {
  return timelineRouteLeadIn + scrollProgress * (1 - timelineRouteLeadIn)
}
