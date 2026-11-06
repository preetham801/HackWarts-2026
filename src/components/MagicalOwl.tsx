import { useLayoutEffect, useRef, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'

interface OwlArtworkProps {
  svgRef: RefObject<SVGSVGElement | null>
  leftWingRef: RefObject<SVGGElement | null>
  rightWingRef: RefObject<SVGGElement | null>
  headRef: RefObject<SVGGElement | null>
  letterRef: RefObject<SVGGElement | null>
}

function OwlArtwork({ svgRef, leftWingRef, rightWingRef, headRef, letterRef }: OwlArtworkProps) {
  return (
    <svg ref={svgRef} className="magical-owl-art" viewBox="0 0 160 140" aria-hidden="true" focusable="false">
      <g className="owl-tail">
        <path d="M62 91q-12 19-9 35 8-4 14-15m1-17q-5 20 0 33 7-7 8-16m3-17q3 20 9 30 5-10 1-23m2-6q11 18 18 23 2-13-10-27Z" />
        <path d="m58 116 9-9m3 14 5-14m7 12-2-12m12 7-8-12" fill="none" stroke="#8e99a2" strokeWidth=".8" />
      </g>

      <g ref={leftWingRef} className="owl-wing owl-wing--left">
        <path className="owl-wing-shape" d="M62 55Q43 40 20 48q8 7 2 15-4 5-12 8 17 2 24 13 10 10 26 4l12-20Z" />
        <path className="owl-wing-layer" d="M57 58Q42 47 25 51q8 6 4 12 13-2 24 10l9-5Z" />
        <path className="owl-wing-feather" d="M57 57Q40 48 22 51m35 10Q40 56 18 65m39 1Q39 65 25 76m33-3Q44 72 34 84m23-5Q48 78 42 89" />
        <path className="owl-wing-quill" d="m27 52 11 9m-18 5 16 6m-6 6 13 5m3-24 10 8m-6 11 8 5" />
      </g>
      <g ref={rightWingRef} className="owl-wing owl-wing--right">
        <path className="owl-wing-shape" d="M98 55q19-15 42-7-8 7-2 15 4 5 12 8-17 2-24 13-10 10-26 4L88 68Z" />
        <path className="owl-wing-layer" d="M103 58q15-11 32-7-8 6-4 12-13-2-24 10l-9-5Z" />
        <path className="owl-wing-feather" d="M103 57q17-9 35-6m-35 10q17-8 39 0m-39 7q18-3 31 8m-30-1q12-1 22 11m-21-6q10 0 16 11" />
        <path className="owl-wing-quill" d="m133 52-11 9m18 5-16 6m6 6-13 5m-3-24-10 8m6 11-8 5" />
      </g>

      <g className="owl-body">
        <path className="owl-body-shape" d="M80 54q-30 0-34 35-2 18 8 29 10 10 26 10t26-10q10-11 8-29-4-35-34-35Z" />
        <path className="owl-belly" d="M80 70q-19 1-22 22-2 14 7 22 6 6 15 6t15-6q9-8 7-22-3-21-22-22Z" />
        <path className="owl-plumage" d="M68 80q4-4 8 0m8 0q4-4 8 0m-24 7q4-4 8 0m8 0q4-4 8 0m-25 7q4-4 8 0m8 0q4-4 8 0m-23 7q4-4 8 0m8 0q4-4 8 0m-15 7q4-4 8 0" />
        <path className="owl-belly-shade" d="M62 88q5 2 10 0m16 0q5 2 10 0m-35 17q6 2 11 0m12 0q5 2 11 0" />
        <path className="owl-body-line" d="M48 85q-6 14 1 26m63-26q6 14-1 26" />
      </g>

      <g ref={headRef} className="owl-head">
        <path className="owl-ear" d="m52 31-8-13 18 8m46 5 8-13-18 8" />
        <path className="owl-head-shape" d="M48 40q0-29 32-31 32 2 32 31 0 25-32 30-32-5-32-30Z" />
        <path className="owl-crown-mark" d="M65 20q4 4 8 0m4-5q3 4 6 0m4 5q4 4 8 0m-33 5q3 3 6 0m28 0q3 3 6 0" />
        <path className="owl-brow" d="M51 35q11-14 25-5m8 0q14-9 25 5" />
        <ellipse className="owl-eye-ring" cx="66" cy="40" rx="11.5" ry="12.5" />
        <ellipse className="owl-eye-ring" cx="94" cy="40" rx="11.5" ry="12.5" />
        <circle className="owl-iris" cx="66" cy="41" r="7.3" />
        <circle className="owl-iris" cx="94" cy="41" r="7.3" />
        <circle className="owl-pupil" cx="66" cy="41" r="3.2" />
        <circle className="owl-pupil" cx="94" cy="41" r="3.2" />
        <circle className="owl-eye-glint" cx="64" cy="38.5" r="1.5" />
        <circle className="owl-eye-glint" cx="92" cy="38.5" r="1.5" />
        <path className="owl-beak" d="m76 49 4-5 4 5-4 8Z" />
        <path className="owl-face-mark" d="M54 52q7 9 14 8m38-8q-7 9-14 8m-24-5 5 3m30-3-5 3" />
        <path className="owl-face-fleck" d="m57 48 2 1m-4 2 2 1m48-4-2 1m4 2-2 1m-40 14 2 1m30-1-2 1" />
      </g>

      <g className="owl-feet">
        <path d="M66 121v7m28-7v7m-31 0q4-5 8 0 4-5 8 0m8 0q4-5 8 0 4-5 8 0" />
      </g>

      <g ref={letterRef} className="owl-letter" transform="translate(109 103) scale(.42)">
        <path className="owl-letter-paper" d="M2 3h35v26H2z" />
        <path className="owl-letter-fold" d="m2 5 17 13L37 5" />
        <circle className="owl-letter-seal" cx="19.5" cy="20" r="4.5" />
        <path className="owl-letter-mark" d="m18 20 1 1 2-3" />
      </g>
    </svg>
  )
}

export function MagicalOwl() {
  const perchRef = useRef<HTMLDivElement>(null)
  const flightRef = useRef<HTMLDivElement>(null)
  const perchSvgRef = useRef<SVGSVGElement>(null)
  const flightSvgRef = useRef<SVGSVGElement>(null)
  const perchLeftWingRef = useRef<SVGGElement>(null)
  const perchRightWingRef = useRef<SVGGElement>(null)
  const flightLeftWingRef = useRef<SVGGElement>(null)
  const flightRightWingRef = useRef<SVGGElement>(null)
  const perchHeadRef = useRef<SVGGElement>(null)
  const flightHeadRef = useRef<SVGGElement>(null)
  const perchLetterRef = useRef<SVGGElement>(null)
  const flightLetterRef = useRef<SVGGElement>(null)

  useLayoutEffect(() => {
    const perch = perchRef.current
    const flyer = flightRef.current
    const leftWing = flightLeftWingRef.current
    const rightWing = flightRightWingRef.current
    const head = flightHeadRef.current
    const letter = flightLetterRef.current
    if (!perch || !flyer || !leftWing || !rightWing || !head || !letter) return

    const media = gsap.matchMedia()
    let timer = 0
    let journey: gsap.core.Timeline | null = null
    let scrollFrame = 0
    let resizeObserver: ResizeObserver | null = null
    let idleTimer = 0
    let currentPerch: HTMLElement = perch
    let lastPosition = { x: 0, y: 0 }
    const visiblePerches = new Set<HTMLElement>()
    let observer: IntersectionObserver | null = null

    const owlSize = () => window.matchMedia('(max-width: 640px)').matches ? 58 : 86
    const positionFor = (target: HTMLElement) => {
      const rect = target.getBoundingClientRect()
      const size = owlSize()
      return { x: rect.left + rect.width / 2 - size / 2, y: rect.top + rect.height / 2 - size * 0.48 }
    }
    const visible = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect()
      const style = window.getComputedStyle(element)
      const intentionallyTransparentAnchor = element.matches('.owl-perch-anchor')
      return style.display !== 'none' && style.visibility !== 'hidden' && (intentionallyTransparentAnchor || Number(style.opacity) > 0) && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
    }
    const obstacles = () => Array.from(document.querySelectorAll<HTMLElement>(
      'h1,h2,h3,h4,h5,h6,p,li,a,button,input,textarea,select,summary,label,form,img,svg,[role="img"],[role="button"]',
    )).filter((element) => !element.closest('.owl-perch,.owl-flyer,.owl-perch-anchor') && visible(element))
      .map((element) => element.getBoundingClientRect())
    const intersects = (a: DOMRect, b: DOMRect) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
    const safeRoute = (from: { x: number; y: number }, to: { x: number; y: number }, boxes: DOMRect[]) => {
      const size = owlSize()
      const padding = 7
      // A shallow two-arc route, sampled using the complete owl silhouette bounds.
      const lift = Math.min(54, Math.abs(to.x - from.x) * 0.12)
      for (let step = 0; step <= 20; step += 1) {
        const t = step / 20
        const x = from.x + (to.x - from.x) * t
        const y = from.y + (to.y - from.y) * t - Math.sin(Math.PI * t) * lift
        const box = new DOMRect(x - padding, y - padding, size + padding * 2, size * 0.875 + padding * 2)
        if (boxes.some((obstacle) => intersects(box, obstacle))) return false
      }
      return true
    }
    const isSectionPerch = (target: HTMLElement) => target !== perch

    const dock = () => {
      if (!isSectionPerch(currentPerch)) {
        gsap.set(flyer, { autoAlpha: 0 })
        gsap.set(perch, { autoAlpha: 1 })
        return
      }
      if (!visible(currentPerch)) {
        gsap.set(flyer, { autoAlpha: 0 })
        gsap.set(perch, { autoAlpha: 1 })
        return
      }
      const target = positionFor(currentPerch)
      const size = owlSize()
      const box = new DOMRect(target.x - 6, target.y - 6, size + 12, size * 0.875 + 12)
      if (obstacles().some((obstacle) => intersects(box, obstacle))) {
        gsap.set(flyer, { autoAlpha: 0 })
        gsap.set(perch, { autoAlpha: 1 })
        return
      }
      lastPosition = target
      gsap.set(perch, { autoAlpha: 0 })
      flyer.classList.add('is-perched')
      gsap.set(flyer, { width: size, x: target.x, y: target.y, rotation: 0, autoAlpha: 1 })
    }

    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(flyer, { autoAlpha: 0 })
      const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-owl-perch]'))
      observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!(target instanceof HTMLElement)) return
          if (isIntersecting) visiblePerches.add(target)
          else visiblePerches.delete(target)
        })
      }, { rootMargin: '0px', threshold: 0 })
      targets.forEach((target) => observer?.observe(target))
      const scheduleNextFlight = (delayOverride?: number) => {
        window.clearTimeout(timer)
        const isSmallScreen = window.matchMedia('(max-width: 640px)').matches
        const delay = delayOverride ?? (isSmallScreen ? 42000 + Math.random() * 28000 : 24000 + Math.random() * 22000)
        timer = window.setTimeout(fly, delay)
      }

      const fly = () => {
        if (document.visibilityState !== 'visible' || journey) {
          scheduleNextFlight()
          return
        }

        const isSmallScreen = window.matchMedia('(max-width: 640px)').matches
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const owlWidth = owlSize()
        const owlHeight = owlWidth * 0.875
        const boxes = obstacles()
        const candidates = isSmallScreen ? [] : Array.from(visiblePerches).filter((target) => target !== currentPerch && visible(target))
        const footerVisible = visible(perch)
        const target = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : (footerVisible && currentPerch !== perch ? perch : null)
        let start: { x: number; y: number }
        let finish: { x: number; y: number }

        if (target) {
          finish = positionFor(target)
          if (isSectionPerch(currentPerch) && visible(currentPerch)) start = positionFor(currentPerch)
          else start = lastPosition.x || lastPosition.y ? lastPosition : { x: -owlWidth, y: finish.y }
          const startBox = new DOMRect(start.x, start.y, owlWidth, owlHeight)
          if (boxes.some((box) => intersects(startBox, box)) || boxes.some((box) => intersects(new DOMRect(finish.x, finish.y, owlWidth, owlHeight), box)) || !safeRoute(start, finish, boxes)) {
            scheduleNextFlight(8000 + Math.random() * 9000)
            return
          }
        } else {
          const candidatesY = [0.18, 0.3, 0.43, 0.58, 0.72, 0.84]
            .map((ratio) => Math.max(owlHeight / 2 + 12, Math.min(viewportHeight - owlHeight / 2 - 12, viewportHeight * ratio)))
            .sort(() => Math.random() - 0.5)
          const lane = candidatesY.find((center) => boxes.every((box) => center + owlHeight / 2 < box.top - 8 || center - owlHeight / 2 > box.bottom + 8))
          if (lane === undefined || viewportWidth < owlWidth * 2) {
            scheduleNextFlight()
            return
          }
          const direction = Math.random() > .5 ? 1 : -1
          start = { x: direction > 0 ? -owlWidth - 12 : viewportWidth + 12, y: lane - owlHeight / 2 }
          finish = { x: direction > 0 ? viewportWidth + 12 : -owlWidth - 12, y: lane - owlHeight / 2 }
          if (!safeRoute(start, finish, boxes)) {
            scheduleNextFlight(8000 + Math.random() * 9000)
            return
          }
        }

        if (!start || !finish) {
          scheduleNextFlight()
          return
        }
        const direction = finish.x >= start.x ? 1 : -1
        const arc = Math.min(54, Math.abs(finish.x - start.x) * .12) * (Math.random() > .5 ? 1 : -1)
        const carryingLetter = Math.random() < 0.28

        flyer.classList.remove('is-perched')
        gsap.set(flyer, { width: owlWidth, x: start.x, y: start.y, rotation: -direction * 3, autoAlpha: 1 })
        gsap.set(letter, { autoAlpha: carryingLetter ? 1 : 0 })
        gsap.set(leftWing, { rotation: 0, transformOrigin: '92% 50%' })
        gsap.set(rightWing, { rotation: 0, transformOrigin: '8% 50%' })
        gsap.set(head, { rotation: 0, transformOrigin: '50% 85%' })
        gsap.to(perch, { autoAlpha: 0, duration: 0.22, overwrite: true })

        journey = gsap.timeline({
          onComplete: () => {
            currentPerch = target ?? perch
            lastPosition = finish
            gsap.set(flyer, { x: finish.x, y: finish.y, rotation: 0, autoAlpha: target ? 1 : 0 })
            if (target && target !== perch) flyer.classList.add('is-perched')
            else flyer.classList.remove('is-perched')
            gsap.set(perch, { autoAlpha: currentPerch === perch ? 1 : 0 })
            journey = null
            scheduleNextFlight()
          },
        })
        journey.to(flyer, { x: (start.x + finish.x) / 2, y: (start.y + finish.y) / 2 - arc, rotation: direction * 2, duration: 1.45, ease: 'sine.inOut' })
          .to(flyer, { x: finish.x, y: finish.y, rotation: direction * 3, duration: 1.45, ease: 'sine.inOut' })
          .to(leftWing, { rotation: -36, duration: 0.2, repeat: 13, yoyo: true, ease: 'sine.inOut' }, 0)
          .to(rightWing, { rotation: 36, duration: 0.2, repeat: 13, yoyo: true, ease: 'sine.inOut' }, 0)
          .to(head, { rotation: direction * 4, duration: 0.7, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0.3)
      }

      const invalidate = () => {
        if (scrollFrame) return
        scrollFrame = window.requestAnimationFrame(() => {
          scrollFrame = 0
          if (journey) {
            journey.kill()
            journey = null
            flyer.classList.remove('is-perched')
            gsap.set(flyer, { autoAlpha: 0 })
            currentPerch = perch
            gsap.set(perch, { autoAlpha: 1 })
          } else if (isSectionPerch(currentPerch)) dock()
          window.clearTimeout(idleTimer)
          idleTimer = window.setTimeout(() => {
            if (isSectionPerch(currentPerch) && !visible(currentPerch)) {
              currentPerch = perch
              flyer.classList.remove('is-perched')
              gsap.set(flyer, { autoAlpha: 0 })
              gsap.set(perch, { autoAlpha: 1 })
            }
            scheduleNextFlight(10000 + Math.random() * 10000)
          }, 280)
        })
      }
      window.addEventListener('scroll', invalidate, { passive: true })
      window.addEventListener('resize', invalidate, { passive: true })
      resizeObserver = new ResizeObserver(invalidate)
      targets.forEach((target) => { const section = target.closest('section'); if (section) resizeObserver?.observe(section) })
      document.addEventListener('visibilitychange', invalidate)

      scheduleNextFlight()

      return () => {
        window.clearTimeout(timer)
        window.clearTimeout(idleTimer)
        if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
        window.removeEventListener('scroll', invalidate)
        window.removeEventListener('resize', invalidate)
        document.removeEventListener('visibilitychange', invalidate)
        observer?.disconnect()
        resizeObserver?.disconnect()
        journey?.kill()
        gsap.killTweensOf([perch, flyer, leftWing, rightWing, head, letter])
      }
    })

    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(idleTimer)
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
      observer?.disconnect()
      resizeObserver?.disconnect()
      journey?.kill()
      media.revert()
    }
  }, [])

  return (
    <>
      <div className="owl-perch" ref={perchRef} data-owl-perch="footer" aria-hidden="true">
        <OwlArtwork
          svgRef={perchSvgRef}
          leftWingRef={perchLeftWingRef}
          rightWingRef={perchRightWingRef}
          headRef={perchHeadRef}
          letterRef={perchLetterRef}
        />
      </div>
      {createPortal(
        <div className="owl-flyer" ref={flightRef} aria-hidden="true">
          <OwlArtwork
            svgRef={flightSvgRef}
            leftWingRef={flightLeftWingRef}
            rightWingRef={flightRightWingRef}
            headRef={flightHeadRef}
            letterRef={flightLetterRef}
          />
        </div>,
        document.body,
      )}
    </>
  )
}
