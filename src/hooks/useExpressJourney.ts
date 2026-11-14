import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getTimelineRouteProgress, timelineStationProgress } from '../data/timelineRoute'

gsap.registerPlugin(ScrollTrigger)

const journeySnapStops = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1]

export function useExpressJourney(pinnedMode: boolean) {
  const stageRef = useRef<HTMLElementTagNameMap['section']>(null)
  const progressRef = useRef(getTimelineRouteProgress(0))
  const [activeStop, setActiveStop] = useState(0)
  const [stationArrival, setStationArrival] = useState(true)

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    if (!pinnedMode) {
      const stopCards = [...stage.querySelectorAll<HTMLElement>('[data-timeline-stop-index]')]
      const observer = new IntersectionObserver((entries) => {
        const centeredEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top - window.innerHeight * 0.45) - Math.abs(b.boundingClientRect.top - window.innerHeight * 0.45))[0]
        const stopIndex = Number(centeredEntry?.target.getAttribute('data-timeline-stop-index'))
        if (!Number.isInteger(stopIndex) || stopIndex < 0) return
        const stopProgress = stopIndex / (timelineStationProgress.length - 1)
        progressRef.current = getTimelineRouteProgress(stopProgress)
        setActiveStop((currentStop) => currentStop === stopIndex ? currentStop : stopIndex)
        setStationArrival(true)
      }, { rootMargin: '-35% 0px -45% 0px', threshold: 0.01 })
      stopCards.forEach((card) => observer.observe(card))
      return () => observer.disconnect()
    }

    const progress = { value: 0 }
    progressRef.current = getTimelineRouteProgress(progress.value)

    const journey = gsap.to(progress, {
      value: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: stage,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        start: 'top top',
        end: () => `+=${window.innerHeight * 7.5}`,
        scrub: 0.8,
        snap: {
          snapTo: journeySnapStops,
          duration: { min: 0.45, max: 0.9 },
          delay: 0.08,
          ease: 'power2.inOut',
        },
        invalidateOnRefresh: true,
      },
      onUpdate: () => {
        const routeProgress = getTimelineRouteProgress(progress.value)
        progressRef.current = routeProgress
        let nearestStop = 0
        let stopDistance = Number.POSITIVE_INFINITY
        timelineStationProgress.forEach((stopProgress, index) => {
          const distance = Math.abs(routeProgress - getTimelineRouteProgress(stopProgress))
          if (distance < stopDistance) {
            nearestStop = index
            stopDistance = distance
          }
        })
        const isNearStation = stopDistance < 0.055 * 0.4
        setStationArrival((currentArrival) => currentArrival === isNearStation ? currentArrival : isNearStation)
        if (isNearStation) setActiveStop((currentStop) => currentStop === nearestStop ? currentStop : nearestStop)
      },
    })

    const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh())
    resizeObserver.observe(stage)
    const refreshOnResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', refreshOnResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', refreshOnResize)
      journey.scrollTrigger?.kill()
      journey.kill()
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }
  }, [pinnedMode])

  return { stageRef, progressRef, activeStop, stationArrival }
}
