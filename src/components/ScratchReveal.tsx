import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'

type ScratchRevealProps = {
  children: ReactNode
  className?: string
}

export function ScratchReveal({ children, className = '' }: ScratchRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [hasScratched, setHasScratched] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    if (isRevealed) return

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const surface = canvas?.parentElement
    if (!canvas || !context || !surface) return

    const paintSurface = () => {
      const { width, height } = surface.getBoundingClientRect()
      if (!width || !height) return
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.globalCompositeOperation = 'source-over'

      const metal = context.createLinearGradient(0, 0, width, height)
      metal.addColorStop(0, '#4d535b')
      metal.addColorStop(.22, '#c7b37d')
      metal.addColorStop(.48, '#78818a')
      metal.addColorStop(.72, '#d6c69b')
      metal.addColorStop(1, '#555963')
      context.fillStyle = metal
      context.fillRect(0, 0, width, height)
      context.fillStyle = 'rgb(255 255 255 / 10%)'
      for (let index = 0; index < 22; index += 1) {
        const x = (index * 83 + 29) % width
        const y = (index * 37 + 11) % height
        context.fillRect(x, y, 1.5, 1.5)
      }
    }

    paintSurface()
    const observer = new ResizeObserver(paintSurface)
    observer.observe(surface)
    return () => observer.disconnect()
  }, [isRevealed])

  const eraseAtPointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const bounds = canvas.getBoundingClientRect()
    const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
    context.globalCompositeOperation = 'destination-out'
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.lineWidth = 54
    context.beginPath()
    if (lastPointRef.current) {
      context.moveTo(lastPointRef.current.x, lastPointRef.current.y)
      context.lineTo(point.x, point.y)
      context.stroke()
    }
    context.beginPath()
    context.arc(point.x, point.y, 27, 0, Math.PI * 2)
    context.fill()
    lastPointRef.current = point
  }

  const beginScratch = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (isRevealed || event.button > 0) return
    event.preventDefault()
    drawingRef.current = true
    lastPointRef.current = null
    setHasScratched(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    eraseAtPointer(event)
  }

  const endScratch = () => {
    drawingRef.current = false
    lastPointRef.current = null
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    let transparentSamples = 0
    let totalSamples = 0
    const sampleStride = 4 * 16
    for (let index = 3; index < pixels.length; index += sampleStride) {
      if (pixels[index] < 64) transparentSamples += 1
      totalSamples += 1
    }
    if (totalSamples > 0 && transparentSamples / totalSamples >= .34) setIsRevealed(true)
  }

  return (
    <div className={`scratch-reveal ${className}${hasScratched ? ' scratch-reveal--started' : ''}${isRevealed ? ' scratch-reveal--revealed' : ''}`}>
      <span className="scratch-reveal__prize">{children}</span>
      <canvas
        ref={canvasRef}
        className="scratch-reveal__surface"
        aria-hidden="true"
        hidden={isRevealed}
        onPointerDown={beginScratch}
        onPointerMove={eraseAtPointer}
        onPointerUp={endScratch}
        onPointerCancel={endScratch}
      />
      {!isRevealed && <span className="scratch-reveal__instruction" aria-hidden="true">Scratch to reveal · press Enter</span>}
      {!isRevealed && <button className="visually-hidden" type="button" onClick={() => setIsRevealed(true)}>Reveal prize pool</button>}
      <span className="visually-hidden" aria-live="polite">{isRevealed ? `Prize pool revealed: ${children}` : 'Prize pool covered. Scratch the surface or activate Reveal prize pool.'}</span>
    </div>
  )
}
