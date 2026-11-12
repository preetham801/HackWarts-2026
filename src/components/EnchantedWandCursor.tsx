import { useEffect, useRef } from 'react'
import wandAsset from '../assets/cursor/wand-reference.png'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  born: number
  life: number
  size: number
  opacity: number
  kind: 'dust' | 'spark' | 'ripple'
  angle: number
}

const INTERACTIVE_SELECTOR = 'a,button,summary,[role="button"],.house-card,.track-card,.rule-item,.faq-item,.reward-card'

export function EnchantedWandCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wandRef = useRef<HTMLDivElement>(null)
  const dimensionsRef = useRef({ width: 0, height: 0, dpr: 1 })
  const trailStateRef = useRef({ x: 0, y: 0, lastAt: 0 })
  const hoveredElementRef = useRef<Element | null>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches || reducedMotion.matches) return

    const canvas = canvasRef.current
    const wand = wandRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !wand || !context) return

    const particles: Particle[] = []
    const maxParticles = 116
    const frameId = frameRef
    const dimensions = dimensionsRef.current
    const trailState = trailStateRef.current

    const resizeCanvas = () => {
      dimensions.width = window.innerWidth
      dimensions.height = window.innerHeight
      dimensions.dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(dimensions.width * dimensions.dpr)
      canvas.height = Math.round(dimensions.height * dimensions.dpr)
      canvas.style.width = `${dimensions.width}px`
      canvas.style.height = `${dimensions.height}px`
      context.setTransform(dimensions.dpr, 0, 0, dimensions.dpr, 0, 0)
    }

    const addParticle = (particle: Particle) => {
      if (particles.length >= maxParticles) particles.shift()
      particles.push(particle)
    }

    const requestDraw = () => {
      if (!frameId.current) frameId.current = window.requestAnimationFrame(draw)
    }

    const draw = (now: number) => {
      frameId.current = 0
      context.clearRect(0, 0, dimensions.width, dimensions.height)
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index]
        const progress = (now - particle.born) / particle.life
        if (progress >= 1) {
          particles.splice(index, 1)
          continue
        }
        const alpha = Math.sin(Math.PI * Math.max(0, progress)) * particle.opacity
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vx *= .985
        particle.vy *= .985
        context.globalAlpha = alpha
        context.strokeStyle = '#e8cc91'
        context.fillStyle = '#f3d997'
        if (particle.kind === 'ripple') {
          context.beginPath()
          context.ellipse(particle.x, particle.y, 3 + progress * 27, 3 + progress * 27, 0, 0, Math.PI * 2)
          context.lineWidth = 1.1 * (1 - progress) + .2
          context.stroke()
        } else if (particle.kind === 'spark') {
          const radius = particle.size * (1 - progress * .42)
          context.save()
          context.translate(particle.x, particle.y)
          context.rotate(particle.angle)
          context.beginPath()
          context.moveTo(0, -radius * 1.7)
          context.lineTo(radius * .28, -radius * .28)
          context.lineTo(radius * 1.5, 0)
          context.lineTo(radius * .28, radius * .28)
          context.lineTo(0, radius * 1.7)
          context.lineTo(-radius * .28, radius * .28)
          context.lineTo(-radius * 1.5, 0)
          context.lineTo(-radius * .28, -radius * .28)
          context.closePath()
          context.fill()
          context.restore()
        } else {
        context.beginPath()
        context.arc(particle.x, particle.y, particle.size * (1 - progress * .35), 0, Math.PI * 2)
        context.fill()
        }
      }
      context.globalAlpha = 1
      if (particles.length) requestDraw()
    }

    const emitTrail = (x: number, y: number, now: number) => {
      if (now - trailState.lastAt < 28 || Math.hypot(x - trailState.x, y - trailState.y) < 13) return
      trailState.lastAt = now
      trailState.x = x
      trailState.y = y
      addParticle({ x, y, vx: (Math.random() - .5) * .36, vy: Math.random() * .5 + .12, born: now, life: 430 + Math.random() * 360, size: .65 + Math.random() * 1.45, opacity: .32 + Math.random() * .44, kind: Math.random() > .84 ? 'spark' : 'dust', angle: Math.random() * Math.PI })
      requestDraw()
    }

    const emitSpell = (x: number, y: number, now: number) => {
      addParticle({ x, y, vx: 0, vy: 0, born: now, life: 480, size: 1, opacity: .54, kind: 'ripple', angle: 0 })
      addParticle({ x, y, vx: 0, vy: 0, born: now, life: 170, size: 3.6, opacity: 1, kind: 'spark', angle: 0 })
      for (let index = 0; index < 11; index += 1) {
        const angle = Math.PI * 2 * index / 11 + Math.random() * .25
        const speed = .8 + Math.random() * 1.9
        addParticle({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, born: now, life: 340 + Math.random() * 330, size: 1 + Math.random() * 2.1, opacity: .48 + Math.random() * .44, kind: index % 3 === 0 ? 'spark' : 'dust', angle })
      }
      requestDraw()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      wand.style.transform = `translate3d(${event.clientX - 14}px, ${event.clientY - 2}px, 0)`
      wand.classList.add('is-visible')
      emitTrail(event.clientX, event.clientY, performance.now())
    }

    const onPointerLeave = () => wand.classList.remove('is-visible')
    const onPointerEnter = () => wand.classList.add('is-visible')
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !(event.target instanceof Element) || !event.target.closest(INTERACTIVE_SELECTOR)) return
      emitSpell(event.clientX, event.clientY, performance.now())
    }

    const onPointerOver = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return
      const next = event.target.closest(INTERACTIVE_SELECTOR)
      if (next === hoveredElementRef.current) return
      hoveredElementRef.current?.classList.remove('wand-hover-target')
      hoveredElementRef.current = next
      hoveredElementRef.current?.classList.add('wand-hover-target')
      wand.classList.toggle('is-hovering', hoveredElementRef.current !== null)
      if (hoveredElementRef.current) {
        const now = performance.now()
        for (let index = 0; index < 4; index += 1) {
          addParticle({ x: event.clientX + (Math.random() - .5) * 16, y: event.clientY + (Math.random() - .5) * 16, vx: (Math.random() - .5) * .28, vy: -.15 - Math.random() * .3, born: now, life: 260 + Math.random() * 160, size: .7 + Math.random() * 1.1, opacity: .28 + Math.random() * .3, kind: index === 0 ? 'spark' : 'dust', angle: Math.random() * Math.PI })
        }
        requestDraw()
      }
    }
    const onPointerOut = (event: PointerEvent) => {
      const hoveredElement = hoveredElementRef.current
      if (!hoveredElement || !(event.target instanceof Element) || !hoveredElement.contains(event.target)) return
      const related = event.relatedTarget instanceof Element ? event.relatedTarget.closest(INTERACTIVE_SELECTOR) : null
      if (related === hoveredElement) return
      hoveredElement.classList.remove('wand-hover-target')
      hoveredElementRef.current = null
      wand.classList.remove('is-hovering')
    }

    resizeCanvas()
    document.body.classList.add('wand-cursor-enabled')
    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerdown', onPointerDown, { passive: true })
    document.addEventListener('pointerover', onPointerOver, { passive: true })
    document.addEventListener('pointerout', onPointerOut, { passive: true })
    window.addEventListener('resize', resizeCanvas, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('pointerenter', onPointerEnter)

    return () => {
      document.body.classList.remove('wand-cursor-enabled')
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('pointerenter', onPointerEnter)
      hoveredElementRef.current?.classList.remove('wand-hover-target')
      hoveredElementRef.current = null
      if (frameId.current) window.cancelAnimationFrame(frameId.current)
      frameId.current = 0
      context.clearRect(0, 0, dimensions.width, dimensions.height)
      particles.length = 0
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="enchanted-wand__particles" aria-hidden="true" />
      <div ref={wandRef} className="enchanted-wand" aria-hidden="true">
        <img className="enchanted-wand__art" src={wandAsset} alt="" draggable="false" />
      </div>
    </>
  )
}
