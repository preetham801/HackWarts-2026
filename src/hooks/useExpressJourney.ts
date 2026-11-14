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
  const cooldownUntilRef = useRef(0)
  const scrollTweenRef = useRef<gsap.core.Tween | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchGestureHandledRef = useRef(false)

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
        id: 'hackwarts-express-journey',
        end: () => `+=${window.innerHeight * 3}`,
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

    const scrollTrigger = journey.scrollTrigger
    const getNearestStop = (value: number) => journeySnapStops.reduce((nearest, stop, index) => (
      Math.abs(stop - value) < Math.abs(journeySnapStops[nearest] - value) ? index : nearest
    ), 0)

    const stepToStop = (direction: -1 | 1, event?: Event) => {
      if (!scrollTrigger?.isActive) return false
      const currentProgress = scrollTrigger.progress
      const atStartAndLeaving = currentProgress <= 0.015 && direction < 0
      const atEndAndLeaving = currentProgress >= 0.985 && direction > 0
      if (atStartAndLeaving || atEndAndLeaving) {
        scrollTweenRef.current?.kill()
        scrollTweenRef.current = null
        cooldownUntilRef.current = 0
        return false
      }

      event?.preventDefault()
      const now = performance.now()
      if (now < cooldownUntilRef.current) return true

      const currentStop = getNearestStop(currentProgress)
      const destinationStop = Math.max(0, Math.min(journeySnapStops.length - 1, currentStop + direction))
      const destinationProgress = journeySnapStops[destinationStop]
      const destinationScroll = scrollTrigger.start + destinationProgress * (scrollTrigger.end - scrollTrigger.start)
      const scrollPosition = { value: scrollTrigger.scroll() }
      scrollTweenRef.current?.kill()
      cooldownUntilRef.current = now + 650
      scrollTweenRef.current = gsap.to(scrollPosition, {
        value: destinationScroll,
        duration: 0.52,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (!scrollTrigger.isActive) return
          scrollTrigger.scroll(scrollPosition.value)
          ScrollTrigger.update()
        },
        onComplete: () => { scrollTweenRef.current = null },
      })
      return true
    }

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= 18) return
      stepToStop(event.deltaY > 0 ? 1 : -1, event)
    }
    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null
      touchGestureHandledRef.current = false
    }
    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartYRef.current === null || touchGestureHandledRef.current) return
      const currentY = event.touches[0]?.clientY
      if (currentY === undefined) return
      const delta = touchStartYRef.current - currentY
      if (Math.abs(delta) <= 18 || !scrollTrigger?.isActive) return
      const handled = stepToStop(delta > 0 ? 1 : -1, event)
      if (handled) touchGestureHandledRef.current = true
    }
    const handleTouchEnd = () => {
      touchStartYRef.current = null
      touchGestureHandledRef.current = false
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    stage.addEventListener('touchstart', handleTouchStart, { passive: true })
    stage.addEventListener('touchmove', handleTouchMove, { passive: false })
    stage.addEventListener('touchend', handleTouchEnd, { passive: true })
    stage.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh())
    resizeObserver.observe(stage)
    const refreshOnResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', refreshOnResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('wheel', handleWheel)
      stage.removeEventListener('touchstart', handleTouchStart)
      stage.removeEventListener('touchmove', handleTouchMove)
      stage.removeEventListener('touchend', handleTouchEnd)
      stage.removeEventListener('touchcancel', handleTouchEnd)
      scrollTweenRef.current?.kill()
      scrollTweenRef.current = null
      window.removeEventListener('resize', refreshOnResize)
      journey.scrollTrigger?.kill()
      journey.kill()
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }
  }, [pinnedMode])

  return { stageRef, progressRef, activeStop, stationArrival }
}
