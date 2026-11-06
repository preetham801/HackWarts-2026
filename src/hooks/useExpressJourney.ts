import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type MediaConditions = {
  reduceMotion: boolean
  desktop: boolean
  mobile: boolean
}

const activeMarker = {
  backgroundColor: '#c58a32',
  borderColor: '#ffe1a0',
  color: '#fff7e5',
  boxShadow: '0 0 0 4px #101b2a, 0 0 20px 5px rgb(245 183 76 / 72%)',
}

const inactiveMarker = {
  backgroundColor: '#101b2a',
  borderColor: 'rgb(201 161 91 / 52%)',
  color: '#b8b2a6',
  boxShadow: '0 0 0 4px #101b2a',
}

export function useExpressJourney() {
  const stageRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const locomotiveRef = useRef<HTMLImageElement>(null)
  const mobileProgressRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const stage = stageRef.current
    const scene = sceneRef.current
    const locomotive = locomotiveRef.current
    const mobileProgress = mobileProgressRef.current
    if (!stage || !scene || !locomotive || !mobileProgress) return

    const cards = Array.from(stage.querySelectorAll<HTMLElement>('[data-express-card]'))
    const desktopMarkers = Array.from(stage.querySelectorAll<HTMLElement>('[data-express-marker] span'))
    const mobileMarkers = cards
      .map((card) => card.querySelector<HTMLElement>('.express-stop-marker'))
      .filter((marker): marker is HTMLElement => marker !== null)
    const routeFill = stage.querySelector<HTMLElement>('.express-route-progress-fill')
    const mobileTrack = stage.querySelector<HTMLElement>('.express-mobile-progress')
    const highlights = cards
      .map((card) => card.querySelector<HTMLElement>('.express-stop-highlight'))
      .filter((highlight): highlight is HTMLElement => highlight !== null)
    const stopWrapper = stage.querySelector<HTMLElement>('.express-stops-wrap')

    if (cards.length !== 7 || desktopMarkers.length !== 7 || mobileMarkers.length !== 7 || !routeFill || !mobileTrack || !stopWrapper || highlights.length !== 7) return

    const centerX = (element: HTMLElement) => {
      const bounds = element.getBoundingClientRect()
      return bounds.left + bounds.width / 2 - stage.getBoundingClientRect().left
    }
    const centerY = (element: HTMLElement) => {
      const bounds = element.getBoundingClientRect()
      return bounds.top + bounds.height / 2 - stage.getBoundingClientRect().top
    }
    const sceneOffsetX = () => scene.getBoundingClientRect().left - stage.getBoundingClientRect().left
    const sceneOffsetY = () => scene.getBoundingClientRect().top - stage.getBoundingClientRect().top
    const getMobileRoute = () => {
      const firstY = centerY(mobileMarkers[0])
      const secondY = centerY(mobileMarkers[1])
      return {
        startY: firstY - (secondY - firstY),
        endY: centerY(mobileMarkers[mobileMarkers.length - 1]),
      }
    }
    const syncMobileTrack = () => {
      if (!window.matchMedia('(max-width: 900px)').matches) return
      const wrapperTop = stopWrapper.getBoundingClientRect().top - stage.getBoundingClientRect().top
      const route = getMobileRoute()
      mobileTrack.style.top = `${route.startY - wrapperTop}px`
      mobileTrack.style.height = `${Math.max(0, route.endY - route.startY)}px`
    }

    const resizeObserver = new ResizeObserver(() => {
      syncMobileTrack()
      ScrollTrigger.refresh()
    })
    resizeObserver.observe(stage)

    const media = gsap.matchMedia()
    media.add({
      reduceMotion: '(prefers-reduced-motion: reduce)',
      desktop: '(min-width: 901px)',
      mobile: '(max-width: 900px)',
    }, (context) => {
      const conditions = context.conditions as MediaConditions
      if (conditions.reduceMotion) return

      const currentStates = cards.map((card) => card.querySelector<HTMLElement>('.express-state--current'))
      const completedStates = cards.map((card) => card.querySelector<HTMLElement>('.express-state--completed'))
      const nextStates = cards.map((card) => card.querySelector<HTMLElement>('.express-state--next'))
      const allStates = [...currentStates, ...completedStates, ...nextStates]
        .filter((state): state is HTMLElement => state !== null)
      const markers = conditions.desktop ? desktopMarkers : mobileMarkers
      const progressFill = conditions.desktop ? routeFill : mobileProgress

      gsap.set(desktopMarkers, inactiveMarker)
      gsap.set(mobileMarkers, inactiveMarker)
      gsap.set(highlights, { autoAlpha: 0 })
      gsap.set(cards, { borderColor: 'rgb(201 161 91 / 28%)', boxShadow: '0 10px 26px rgb(0 0 0 / 12%)' })
      gsap.set(allStates, { autoAlpha: 0 })
      nextStates.forEach((state) => state && gsap.set(state, { autoAlpha: 1 }))
      gsap.set(routeFill, { scaleX: 0, transformOrigin: 'left center' })
      gsap.set(mobileProgress, { scaleY: 0, transformOrigin: 'center top' })

      let triggerOptions: ScrollTrigger.Vars

      if (conditions.desktop) {
        const firstMarker = stage.querySelector<HTMLElement>('[data-express-marker="0"] span')
        const lastMarker = stage.querySelector<HTMLElement>('[data-express-marker="6"] span')
        if (!firstMarker || !lastMarker) return

        const firstX = centerX(firstMarker) - sceneOffsetX()
        const lastX = centerX(lastMarker) - sceneOffsetX()
        const markerSpacing = (lastX - firstX) / (cards.length - 1)
        const startCenterX = firstX - markerSpacing
        const startX = startCenterX - locomotive.offsetWidth / 2 - locomotive.offsetLeft
        gsap.set(locomotive, { x: startX, y: 0, yPercent: -95, rotation: 0 })
        triggerOptions = {
          trigger: stage,
          start: () => {
            const navHeight = document.querySelector<HTMLElement>('.site-header')?.getBoundingClientRect().height ?? 0
            return `top top+=${Math.round(navHeight)}`
          },
          end: () => `+=${Math.max(1400, Math.round(window.innerHeight * 1.75))}`,
          scrub: 0.55,
          pin: stage,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      } else {
        syncMobileTrack()
        const route = getMobileRoute()
        const startX = centerX(mobileMarkers[0]) - sceneOffsetX() - locomotive.offsetWidth / 2 - locomotive.offsetLeft
        const startY = route.startY - sceneOffsetY() - locomotive.offsetHeight / 2 - locomotive.offsetTop
        gsap.set(locomotive, { x: startX, y: startY, yPercent: 0, rotation: 90, transformOrigin: 'center center' })
        triggerOptions = {
          trigger: stage,
          start: () => {
            return `top+=${getMobileRoute().startY}px center`
          },
          end: () => `+=${getMobileRoute().endY - getMobileRoute().startY}`,
          scrub: 0.35,
          invalidateOnRefresh: true,
        }
      }

      const journey = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

      for (let index = 0; index < cards.length; index += 1) {
        const startAt = index / cards.length
        const milestoneAt = (index + 1) / cards.length
        const station = markers[index]
        const stationCoordinate = () => conditions.desktop
          ? centerX(station) - sceneOffsetX() - locomotive.offsetWidth / 2 - locomotive.offsetLeft
          : centerY(station) - sceneOffsetY() - locomotive.offsetHeight / 2 - locomotive.offsetTop
        const progressAtStation = () => {
          if (conditions.desktop) {
            const first = centerX(desktopMarkers[0])
            const last = centerX(desktopMarkers[desktopMarkers.length - 1])
            const spacing = (last - first) / (cards.length - 1)
            const routeStart = first - spacing
            return (centerX(station) - routeStart) / (last - routeStart)
          }
          const route = getMobileRoute()
          return (centerY(station) - route.startY) / (route.endY - route.startY)
        }

        journey.to(locomotive, {
          [conditions.desktop ? 'x' : 'y']: stationCoordinate,
          duration: 1 / cards.length,
        }, startAt)
        journey.to(progressFill, {
          [conditions.desktop ? 'scaleX' : 'scaleY']: progressAtStation,
          duration: 1 / cards.length,
        }, startAt)
        addMilestoneState(journey, index, milestoneAt, markers, cards, highlights, nextStates, currentStates, completedStates)
      }

      const scrollTrigger = ScrollTrigger.create({ animation: journey, ...triggerOptions })
      return () => {
        scrollTrigger.kill()
        journey.kill()
      }
    })

    return () => {
      resizeObserver.disconnect()
      media.revert()
    }
  }, [])

  return { stageRef, sceneRef, locomotiveRef, mobileProgressRef }
}

function addMilestoneState(
  journey: gsap.core.Timeline,
  index: number,
  at: number,
  markers: HTMLElement[],
  cards: HTMLElement[],
  highlights: HTMLElement[],
  nextStates: (HTMLElement | null)[],
  currentStates: (HTMLElement | null)[],
  completedStates: (HTMLElement | null)[],
) {
  const marker = markers[index]
  const card = cards[index]
  // Milestone state changes share the exact station threshold with the train
  // and progress line. This prevents a card or light from getting ahead.
  journey.set(marker, activeMarker, at)
  journey.set(card, { borderColor: '#d6a64e', boxShadow: '0 0 22px rgb(220 165 67 / 24%)' }, at)
  journey.set(highlights[index], { autoAlpha: 0.28 }, at)
  if (nextStates[index]) journey.set(nextStates[index], { autoAlpha: 0 }, at)
  if (currentStates[index]) journey.set(currentStates[index], { autoAlpha: 1 }, at)

  if (index > 0) {
    const previous = index - 1
    journey.set(cards[previous], {
      borderColor: 'rgb(201 161 91 / 58%)',
      boxShadow: '0 0 14px rgb(220 165 67 / 11%)',
    }, at)
    journey.set(highlights[previous], { autoAlpha: 0.12 }, at)
    if (currentStates[previous] && completedStates[previous]) {
      journey.set(currentStates[previous], { autoAlpha: 0 }, at)
      journey.set(completedStates[previous], { autoAlpha: 1 }, at)
    }
  }
}
