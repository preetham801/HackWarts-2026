import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import invitationDesk from '../assets/invitation/invitation-desk.jpg'
import acceptanceParchment from '../assets/invitation/acceptance-parchment.png'
import invitationEnvelope from '../assets/invitation/invitation-envelope.png'
import leadOwl from '../assets/invitation/envelope-owl-lead.png'
import risingOwl from '../assets/invitation/envelope-owl-follower-rise.png'
import descendingOwl from '../assets/invitation/envelope-owl-follower-down.png'
import bankingOwl from '../assets/invitation/envelope-owl-follower-bank.png'

const flock = [leadOwl, risingOwl, descendingOwl, bankingOwl]

function HackWartsSeal() {
  return (
    <svg viewBox="0 0 52 58" aria-hidden="true" focusable="false">
      <path d="M26 3 45 10v16c0 13-8 22-19 29C15 48 7 39 7 26V10Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M17 17v21m18-21v21M17 27h18" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="m26 9 1.2 3 3.1.2-2.4 1.8.8 3-2.7-1.7-2.6 1.7.8-3-2.4-1.8 3.1-.2Z" fill="currentColor" />
    </svg>
  )
}

export function AboutSection() {
  const stageRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const owlRefs = useRef<Array<HTMLSpanElement | null>>([])
  const owlLeftWingRefs = useRef<Array<HTMLImageElement | null>>([])
  const owlRightWingRefs = useRef<Array<HTMLImageElement | null>>([])
  const owlEyeGlowRefs = useRef<Array<HTMLSpanElement | null>>([])
  const flapRef = useRef<HTMLImageElement>(null)
  const sealRef = useRef<HTMLSpanElement>(null)
  const crackRef = useRef<SVGSVGElement>(null)
  const letterRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const interactionStartedRef = useRef(false)
  const [isOpening, setIsOpening] = useState(false)
  const [isOpened, setIsOpened] = useState(false)

  useLayoutEffect(() => {
    const stage = stageRef.current
    const trigger = triggerRef.current
    const owls = owlRefs.current.filter((owl): owl is HTMLSpanElement => owl !== null)
    const leftWings = owlLeftWingRefs.current.filter((wing): wing is HTMLImageElement => wing !== null)
    const rightWings = owlRightWingRefs.current.filter((wing): wing is HTMLImageElement => wing !== null)
    const eyeGlows = owlEyeGlowRefs.current.filter((glow): glow is HTMLSpanElement => glow !== null)
    const flap = flapRef.current
    const seal = sealRef.current
    const crack = crackRef.current
    const letter = letterRef.current
    if (!stage || !trigger || owls.length !== flock.length || leftWings.length !== flock.length || rightWings.length !== flock.length || eyeGlows.length !== flock.length || !flap || !seal || !crack || !letter) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const revealParts = Array.from(letter.querySelectorAll<HTMLElement>('.invitation-reveal'))
    const sparks = Array.from(stage.querySelectorAll<HTMLElement>('.envelope-spark'))
    const dust = Array.from(stage.querySelectorAll<HTMLElement>('.invitation-dust'))

    const showCompleteLetter = () => {
      timelineRef.current?.kill()
      timelineRef.current = null
      gsap.set(trigger, { autoAlpha: 0 })
      gsap.set([...owls, ...leftWings, ...rightWings, ...eyeGlows], { autoAlpha: 0 })
      gsap.set(flap, { rotationX: -168, transformOrigin: '50% 0%' })
      gsap.set(seal, { autoAlpha: 0, scale: .2 })
      gsap.set(letter, { autoAlpha: 1, y: 0, scaleX: 1, scaleY: 1, rotationX: 0, clearProps: 'transform' })
      gsap.set(revealParts, { autoAlpha: 1, y: 0, clearProps: 'transform' })
      gsap.set([...sparks, ...dust], { autoAlpha: 0 })
      interactionStartedRef.current = true
      setIsOpening(false)
      setIsOpened(true)
    }

    if (reducedMotion.matches) showCompleteLetter()
    else {
      owls.forEach((owl, index) => {
        gsap.set(owl, { autoAlpha: 0, scale: .035, x: 0, y: 48, rotationX: -20, rotationZ: 0, transformOrigin: '50% 70%' })
        gsap.set(leftWings[index], { rotation: 48, scaleX: .38, scaleY: .48, transformOrigin: '94% 45%' })
        gsap.set(rightWings[index], { rotation: -48, scaleX: .38, scaleY: .48, transformOrigin: '6% 45%' })
        gsap.set(eyeGlows[index], { autoAlpha: 0, scale: .55 })
      })
      gsap.set(letter, { autoAlpha: 0, y: 150, scaleX: .82, scaleY: .22, rotationX: -8, transformOrigin: '50% 50%' })
      gsap.set(revealParts, { autoAlpha: 0, y: 12 })
      gsap.set(flap, { rotationX: 0, transformOrigin: '50% 0%' })
      gsap.set(crack, { autoAlpha: 0, scaleX: .1, transformOrigin: '50% 50%' })
      gsap.set(sparks, { autoAlpha: 0, scale: .4 })
      gsap.set(dust, { autoAlpha: 0, scale: .5 })
    }

    const onReducedMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) showCompleteLetter()
    }
    reducedMotion.addEventListener('change', onReducedMotionChange)

    return () => {
      reducedMotion.removeEventListener('change', onReducedMotionChange)
      timelineRef.current?.kill()
      timelineRef.current = null
      gsap.killTweensOf([trigger, ...owls, ...leftWings, ...rightWings, ...eyeGlows, flap, seal, crack, letter, ...revealParts, ...sparks, ...dust])
    }
  }, [])

  const openLetter = () => {
    if (interactionStartedRef.current) return
    interactionStartedRef.current = true
    setIsOpening(true)

    const stage = stageRef.current
    const trigger = triggerRef.current
    const owls = owlRefs.current.filter((owl): owl is HTMLSpanElement => owl !== null)
    const leftWings = owlLeftWingRefs.current.filter((wing): wing is HTMLImageElement => wing !== null)
    const rightWings = owlRightWingRefs.current.filter((wing): wing is HTMLImageElement => wing !== null)
    const eyeGlows = owlEyeGlowRefs.current.filter((glow): glow is HTMLSpanElement => glow !== null)
    const flap = flapRef.current
    const seal = sealRef.current
    const crack = crackRef.current
    const letter = letterRef.current
    if (!stage || !trigger || owls.length !== flock.length || leftWings.length !== flock.length || rightWings.length !== flock.length || eyeGlows.length !== flock.length || !flap || !seal || !crack || !letter) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsOpening(false)
      setIsOpened(true)
      return
    }

    const revealParts = Array.from(letter.querySelectorAll<HTMLElement>('.invitation-reveal'))
    const sparks = Array.from(stage.querySelectorAll<HTMLElement>('.envelope-spark'))
    const dust = Array.from(stage.querySelectorAll<HTMLElement>('.invitation-dust'))
    const isMobile = window.matchMedia('(max-width: 640px)').matches
    const letterStart = isMobile ? 1.82 : 1.96
    const timeline = gsap.timeline({
      onComplete: () => {
        timelineRef.current = null
        setIsOpening(false)
        setIsOpened(true)
        titleRef.current?.focus()
      },
    })
    timelineRef.current = timeline
    timeline.to(sparks, { autoAlpha: 1, scale: 1, duration: .16, stagger: .025, ease: 'power2.out' })
      .to(sparks, { autoAlpha: 0, scale: 1.55, y: (index) => (index % 2 ? -18 : 16), duration: .42, stagger: .018, ease: 'power2.out' })
      .to(seal, { scale: 1.12, duration: .14, ease: 'power1.out' }, .04)
      .to(crack, { autoAlpha: .9, scaleX: 1, duration: .1, ease: 'power1.out' }, .17)
      .to(seal, { autoAlpha: 0, scale: .28, rotation: 18, duration: .32, ease: 'power2.in' }, .2)
      .to(flap, { rotationX: -168, duration: .62, ease: 'power2.inOut' }, .28)
      .to(trigger, { y: -8, duration: .3, ease: 'sine.inOut' }, .62)
    const flightPaths = isMobile
      ? [{ x: -58, y: -245, rotation: -2 }, { x: -100, y: -210, rotation: -9 }, { x: 78, y: -235, rotation: 7 }, { x: 116, y: -260, rotation: 11 }]
      : [{ x: -286, y: -440, rotation: -3 }, { x: -142, y: -360, rotation: -10 }, { x: 142, y: -390, rotation: 8 }, { x: 310, y: -455, rotation: 12 }]
    const scaleFactors = isMobile ? [.46, .35, .34, .32] : [.72, .53, .55, .5]
    owls.forEach((owl, index) => {
      const start = .82 + index * (isMobile ? .13 : .16)
      const path = flightPaths[index]
      const leftWing = leftWings[index]
      const rightWing = rightWings[index]
      const eyeGlow = eyeGlows[index]
      const wingCycles = isMobile ? 4 : 6
      const flightDuration = isMobile ? .82 : 1.02
      timeline.to(owl, { autoAlpha: 1, duration: .12 }, start)
        .to(owl, { scale: isMobile ? scaleFactors[index] * .7 : scaleFactors[index] * .72, y: 10, rotationX: 0, duration: .34, ease: 'power2.out' }, start)
        .to([leftWing, rightWing], { rotation: 0, scaleX: 1, scaleY: 1, duration: .38, ease: 'back.out(1.2)' }, start + .05)
        .to(eyeGlow, { autoAlpha: .88, scale: 1, duration: .2, ease: 'power2.out' }, start + .12)
        .to(owl, { x: path.x, y: path.y, scale: scaleFactors[index], rotationX: 5, rotationZ: path.rotation, duration: flightDuration, ease: 'power2.out' }, start + .22)
        .to([leftWing, rightWing], { rotation: (wingIndex) => wingIndex === 0 ? -15 : 15, duration: .14, repeat: wingCycles, yoyo: true, ease: 'sine.inOut' }, start + .22)
        .to(eyeGlow, { autoAlpha: .15, scale: 1.4, duration: .6, ease: 'sine.out' }, start + .45)
        .to(owl, { autoAlpha: 0, duration: .22, ease: 'sine.in' }, start + .22 + flightDuration)
    })
    timeline.to(letter, { autoAlpha: 1, duration: .08 }, letterStart)
      .to(letter, { y: 0, scaleX: 1, scaleY: 1, rotationX: 0, duration: 1.08, ease: 'power3.out' }, letterStart)
      .to(revealParts, { autoAlpha: 1, y: 0, duration: .44, stagger: .13, ease: 'power2.out' }, letterStart + 1.05)
      .to(dust, { autoAlpha: .7, scale: 1, y: -8, duration: .56, stagger: .1, yoyo: true, repeat: 1, ease: 'sine.inOut' }, letterStart + .72)
  }

  const isInteractive = isOpening || isOpened

  return (
    <section id="about" className="section invitation-section section-anchor" aria-labelledby="about-title">
      <span className="owl-perch-anchor owl-perch-anchor--about" data-owl-perch="about" aria-hidden="true" />
      <div
        ref={stageRef}
        className={`invitation-scene${isOpened ? ' invitation-scene--opened' : ''}${isOpening ? ' invitation-scene--opening' : ''}`}
        style={{ backgroundImage: `linear-gradient(180deg, rgb(6 12 19 / 27%), rgb(6 12 19 / 18%) 38%, rgb(6 12 19 / 38%)), url("${invitationDesk}")` }}
      >
        <div className="invitation-stage">
          <button
            ref={triggerRef}
            type="button"
            className="invitation-envelope-trigger"
            aria-label={isOpening ? 'Opening your HackWarts acceptance letter' : 'Open your HackWarts acceptance letter'}
            aria-expanded={isInteractive}
            aria-controls="about-letter"
            disabled={isInteractive}
            hidden={isOpened}
            onClick={openLetter}
          >
            <img className="invitation-envelope invitation-envelope--base" src={invitationEnvelope} alt="" draggable="false" />
            <img ref={flapRef} className="invitation-envelope invitation-envelope--flap" src={invitationEnvelope} alt="" draggable="false" />
            <span ref={sealRef} className="envelope-wax-seal"><HackWartsSeal /></span>
            <svg ref={crackRef} className="envelope-seal-crack" viewBox="0 0 64 8" aria-hidden="true">
              <path d="m3 2 11 3 7-4 8 5 8-4 7 3 7-4 10 4" fill="none" stroke="#f1d5a0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="envelope-spark envelope-spark--one" aria-hidden="true" />
            <span className="envelope-spark envelope-spark--two" aria-hidden="true" />
            <span className="envelope-spark envelope-spark--three" aria-hidden="true" />
            <span className="envelope-spark envelope-spark--four" aria-hidden="true" />
            <span className="envelope-spark envelope-spark--five" aria-hidden="true" />
            <span className="envelope-spark envelope-spark--six" aria-hidden="true" />
            <span className="invitation-instruction">YOUR LETTER AWAITS — CLICK TO OPEN</span>
          </button>

          <div className="invitation-flock" aria-hidden="true">
            {flock.map((owlAsset, index) => (
              <span
                key={owlAsset}
                ref={(node) => { owlRefs.current[index] = node }}
                className={`envelope-owl envelope-owl--${index + 1}`}
              >
                <img ref={(node) => { owlLeftWingRefs.current[index] = node }} className="envelope-owl__part envelope-owl__wing envelope-owl__wing--left" src={owlAsset} alt="" draggable="false" />
                <img ref={(node) => { owlRightWingRefs.current[index] = node }} className="envelope-owl__part envelope-owl__wing envelope-owl__wing--right" src={owlAsset} alt="" draggable="false" />
                <img className="envelope-owl__part envelope-owl__body" src={owlAsset} alt="" draggable="false" />
                <span ref={(node) => { owlEyeGlowRefs.current[index] = node }} className="envelope-owl__eye-glow" />
              </span>
            ))}
          </div>

          <article
            ref={letterRef}
            id="about-letter"
            className="invitation-letter"
            aria-labelledby="about-title"
            aria-hidden={!isInteractive}
          >
            <img className="invitation-letter__paper" src={acceptanceParchment} alt="" draggable="false" />
            <div className="invitation-letter__content">
              <div className="invitation-opened-status" role="status" aria-live="polite">LETTER OPENED</div>
              <header className="invitation-letterhead invitation-reveal">
                <div className="invitation-crest"><HackWartsSeal /></div>
                <p className="invitation-wordmark">HACKWARTS <span>2026</span></p>
                <svg className="invitation-divider" viewBox="0 0 320 24" aria-hidden="true">
                  <path d="M5 12h116m198 0H203M145 12c5-8 12-8 16 0 4-8 11-8 16 0m-17 0 7-7 7 7-7 7Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="132" cy="12" r="2" fill="currentColor" /><circle cx="188" cy="12" r="2" fill="currentColor" />
                </svg>
              </header>
              <h2 ref={titleRef} id="about-title" className="invitation-title invitation-reveal" tabIndex={-1}>YOUR LETTER HAS ARRIVED</h2>
              <div className="invitation-copy">
                <p className="invitation-greeting invitation-reveal">Dear Future Innovator,</p>
                <p className="invitation-reveal">You are invited to enter HackWarts 2026 — a 24-hour journey where creativity meets technology, ideas become reality, and extraordinary minds come together.</p>
                <p className="invitation-reveal">Gather your team. Prepare your skills. Your journey begins here.</p>
              </div>
              <footer className="invitation-closing invitation-reveal">
                <div className="invitation-signature">
                  <p>The HackWarts Organizing Authority</p>
                  <span>Sri Siddhartha School of Engineering</span>
                </div>
                <div className="invitation-wax-seal" aria-hidden="true"><HackWartsSeal /></div>
              </footer>
            </div>
          </article>

          <span className="invitation-dust invitation-dust--one" aria-hidden="true" />
          <span className="invitation-dust invitation-dust--two" aria-hidden="true" />
          <span className="invitation-dust invitation-dust--three" aria-hidden="true" />
          <span className="invitation-dust invitation-dust--four" aria-hidden="true" />
          <span className="invitation-dust invitation-dust--five" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
