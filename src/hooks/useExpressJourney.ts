import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getTimelineRouteProgress, timelineStationProgress } from '../data/timelineRoute'

gsap.registerPlugin(ScrollTrigger)

const journeyDuration = 1.035

const markerActive = {
  backgroundColor: '#c58a32',
  borderColor: '#ffe1a0',
  color: '#fff7e5',
  boxShadow: '0 0 0 3px rgb(8 13 23 / 82%), 0 0 18px 4px rgb(245 183 76 / 60%)',
}

const markerCompleted = {
  backgroundColor: '#785c30',
  borderColor: '#c9a15b',
  color: '#f2dcaa',
  boxShadow: '0 0 0 3px rgb(8 13 23 / 82%), 0 0 10px rgb(201 161 91 / 22%)',
}

const markerFuture = {
  backgroundColor: '#101b2a',
  borderColor: 'rgb(201 161 91 / 52%)',
  color: '#b8b2a6',
  boxShadow: '0 0 0 3px rgb(8 13 23 / 82%)',
}

export function useExpressJourney() {
  const stageRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const cards = Array.from(stage.querySelectorAll<HTMLElement>('[data-express-card]'))
    const markers = Array.from(stage.querySelectorAll<HTMLElement>('[data-express-marker]'))
    const highlights = cards
      .map((card) => card.querySelector<HTMLElement>('.express-stop-highlight'))
      .filter((highlight): highlight is HTMLElement => highlight !== null)
    const currentStates = cards.map((card) => card.querySelector<HTMLElement>('.express-state--current'))
    const completedStates = cards.map((card) => card.querySelector<HTMLElement>('.express-state--completed'))
    const nextStates = cards.map((card) => card.querySelector<HTMLElement>('.express-state--next'))
    const states = [...currentStates, ...completedStates, ...nextStates]
      .filter((state): state is HTMLElement => state !== null)

    if (cards.length !== 7 || markers.length !== 7 || highlights.length !== 7) return

    progressRef.current = getTimelineRouteProgress(0)
    gsap.set(cards, { opacity: 0, scale: 0.86, y: 12, transformOrigin: 'center center' })
    gsap.set(markers, markerFuture)
    gsap.set(highlights, { autoAlpha: 0 })
    gsap.set(states, { autoAlpha: 0 })
    nextStates.forEach((state) => state && gsap.set(state, { autoAlpha: 1 }))

    const progress = { value: 0 }
    const journey = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
        invalidateOnRefresh: true,
      },
      onUpdate: () => { progressRef.current = getTimelineRouteProgress(progress.value) },
    })

    journey.to(progress, { value: 1, duration: journeyDuration, ease: 'none' }, 0)

    timelineStationProgress.forEach((stationRatio, index) => {
      const at = journeyDuration * stationRatio
      const card = cards[index]
      const marker = markers[index]
      const revealDuration = index === timelineStationProgress.length - 1 ? 0.025 : 0.035

      if (index > 0) {
        journey.to(cards[index - 1], { opacity: 0.18, scale: 0.96, y: 0, duration: 0.025, ease: 'power1.out' }, Math.max(0, at - 0.025))
        journey.set(markers[index - 1], markerCompleted, at)
        journey.set(cards[index - 1], { borderColor: 'rgb(201 161 91 / 42%)', boxShadow: '0 8px 24px rgb(0 0 0 / 20%)' }, at)
        journey.set(highlights[index - 1], { autoAlpha: 0.08 }, at)
        if (currentStates[index - 1] && completedStates[index - 1]) {
          journey.set(currentStates[index - 1]!, { autoAlpha: 0 }, at)
          journey.set(completedStates[index - 1]!, { autoAlpha: 1 }, at)
        }
      }

      journey.set(marker, markerActive, at)
      journey.set(card, { borderColor: '#d6a64e', boxShadow: '0 0 22px rgb(220 165 67 / 24%)' }, at)
      journey.set(highlights[index], { autoAlpha: 0.28 }, at)
      if (nextStates[index]) journey.set(nextStates[index]!, { autoAlpha: 0 }, at)
      if (currentStates[index]) journey.set(currentStates[index]!, { autoAlpha: 1 }, at)
      journey.fromTo(card,
        { opacity: 0, scale: 0.86, y: 12 },
        { opacity: 1, scale: 1, y: 0, duration: revealDuration, ease: 'back.out(1.35)' },
        at,
      )
    })

    const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh())
    resizeObserver.observe(stage)

    return () => {
      resizeObserver.disconnect()
      journey.scrollTrigger?.kill()
      journey.kill()
    }
  }, [])

  return { stageRef, progressRef }
}
