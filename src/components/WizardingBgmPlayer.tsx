import { useEffect, useRef, useState } from 'react'
import { Music2, VolumeX } from 'lucide-react'

type AmbientLoop = {
  context: AudioContext
  master: GainNode
  dry: GainNode
  reverbSend: GainNode
  delay: DelayNode
  sources: Set<OscillatorNode>
  scheduler: number | null
  noteIndex: number
}

const TARGET_VOLUME = 0.32
const ARPEGGIO = [659.25, 493.88, 587.33, 783.99, 739.99, 622.25, 493.88, 659.25, 440, 523.25, 622.25, 739.99]

function createAmbientLoop(context: AudioContext): AmbientLoop {
  const master = context.createGain()
  master.gain.value = 0
  master.connect(context.destination)

  const dry = context.createGain()
  dry.gain.value = 0.78
  dry.connect(master)

  const reverbSend = context.createGain()
  reverbSend.gain.value = 0.34
  const convolver = context.createConvolver()
  const impulseLength = Math.floor(context.sampleRate * 2.2)
  const impulse = context.createBuffer(2, impulseLength, context.sampleRate)
  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const samples = impulse.getChannelData(channel)
    for (let index = 0; index < samples.length; index += 1) {
      const decay = Math.pow(1 - index / samples.length, 3.8)
      samples[index] = (Math.random() * 2 - 1) * decay
    }
  }
  convolver.buffer = impulse
  reverbSend.connect(convolver)
  const reverbReturn = context.createGain()
  reverbReturn.gain.value = 0.2
  convolver.connect(reverbReturn)
  reverbReturn.connect(master)

  const delay = context.createDelay(1.2)
  delay.delayTime.value = 0.38
  const feedback = context.createGain()
  feedback.gain.value = 0.2
  delay.connect(feedback)
  feedback.connect(delay)
  const delayReturn = context.createGain()
  delayReturn.gain.value = 0.14
  delay.connect(delayReturn)
  delayReturn.connect(master)

  const sources = new Set<OscillatorNode>()
  const addDrone = (frequency: number, type: OscillatorType, gainAmount: number, panValue: number) => {
    const oscillator = context.createOscillator()
    oscillator.type = type
    oscillator.frequency.value = frequency
    const gain = context.createGain()
    gain.gain.value = gainAmount
    const panner = context.createStereoPanner()
    panner.pan.value = panValue
    oscillator.connect(gain)
    gain.connect(panner)
    panner.connect(dry)
    panner.connect(reverbSend)
    oscillator.start()
    sources.add(oscillator)
  }

  addDrone(82.41, 'sine', 0.15, -0.22)
  addDrone(123.47, 'triangle', 0.045, 0.2)
  addDrone(164.81, 'sine', 0.025, 0)

  return { context, master, dry, reverbSend, delay, sources, scheduler: null, noteIndex: 0 }
}

function playCelestaNote(loop: AmbientLoop, frequency: number, panValue: number) {
  const { context } = loop
  const now = context.currentTime
  const panner = context.createStereoPanner()
  panner.pan.value = panValue
  const envelope = context.createGain()
  envelope.gain.setValueAtTime(0.0001, now)
  envelope.gain.exponentialRampToValueAtTime(0.08, now + 0.025)
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + 2.15)
  envelope.connect(panner)
  panner.connect(loop.dry)
  panner.connect(loop.reverbSend)
  panner.connect(loop.delay)

  const fundamental = context.createOscillator()
  fundamental.type = 'sine'
  fundamental.frequency.setValueAtTime(frequency, now)
  const overtone = context.createOscillator()
  overtone.type = 'triangle'
  overtone.frequency.setValueAtTime(frequency * 2.01, now)
  const overtoneGain = context.createGain()
  overtoneGain.gain.value = 0.16
  fundamental.connect(envelope)
  overtone.connect(overtoneGain)
  overtoneGain.connect(envelope)

  loop.sources.add(fundamental)
  loop.sources.add(overtone)
  let noteSourcesLeft = 2
  const disconnectNote = (oscillator: OscillatorNode) => {
    loop.sources.delete(oscillator)
    oscillator.disconnect()
    noteSourcesLeft -= 1
    if (noteSourcesLeft === 0) {
      overtoneGain.disconnect()
      envelope.disconnect()
      panner.disconnect()
    }
  }
  fundamental.addEventListener('ended', () => disconnectNote(fundamental), { once: true })
  overtone.addEventListener('ended', () => disconnectNote(overtone), { once: true })
  fundamental.start(now)
  overtone.start(now)
  fundamental.stop(now + 2.3)
  overtone.stop(now + 2.3)
}

function fadeMedia(audio: HTMLAudioElement, target: number, duration: number, frameRef: { current: number | null }, onComplete?: () => void) {
  if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
  const from = audio.volume
  const startedAt = performance.now()
  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration)
    const eased = progress * progress * (3 - 2 * progress)
    audio.volume = Math.max(0, Math.min(1, from + (target - from) * eased))
    if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    else {
      frameRef.current = null
      onComplete?.()
    }
  }
  frameRef.current = requestAnimationFrame(tick)
}

export function WizardingBgmPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const playingRef = useRef(false)
  const mutedRef = useRef(false)
  const wantsMusicRef = useRef(false)
  const interactedRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fallbackRef = useRef<AmbientLoop | null>(null)
  const disposedRef = useRef(false)
  const mediaFadeRef = useRef<number | null>(null)
  const suspendTimerRef = useRef<number | null>(null)
  const unlockedListenerRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const audio = new Audio('/audio/hogwarts-bgm.mp3')
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0
    audioRef.current = audio
    disposedRef.current = false

    const setPlaying = (playing: boolean) => {
      playingRef.current = playing
      setIsPlaying(playing)
    }

    const fadeSynth = (loop: AmbientLoop, target: number, seconds: number) => {
      const now = loop.context.currentTime
      loop.master.gain.cancelScheduledValues(now)
      loop.master.gain.setValueAtTime(Math.max(0.0001, loop.master.gain.value), now)
      loop.master.gain.linearRampToValueAtTime(target, now + seconds)
    }

    const startFallback = async () => {
      if (disposedRef.current || mutedRef.current || !wantsMusicRef.current) return
      try {
        if (suspendTimerRef.current !== null) {
          window.clearTimeout(suspendTimerRef.current)
          suspendTimerRef.current = null
        }
        let loop = fallbackRef.current
        if (!loop) {
          const context = new AudioContext()
          loop = createAmbientLoop(context)
          fallbackRef.current = loop
        }
        await loop.context.resume()
        if (disposedRef.current || mutedRef.current || !wantsMusicRef.current) return
        fadeSynth(loop, TARGET_VOLUME, 1.2)
        if (loop.scheduler === null) {
          const schedule = () => {
            const note = ARPEGGIO[loop.noteIndex % ARPEGGIO.length]
            playCelestaNote(loop, note, loop.noteIndex % 2 === 0 ? -0.32 : 0.32)
            loop.noteIndex += 1
          }
          schedule()
          loop.scheduler = window.setInterval(schedule, 560)
        }
        setPlaying(true)
      } catch {
        wantsMusicRef.current = false
        setPlaying(false)
      }
    }

    const startMusic = async () => {
      if (disposedRef.current || mutedRef.current || document.hidden) return
      wantsMusicRef.current = true
      if (audio.error || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        await startFallback()
        return
      }
      try {
        await audio.play()
        if (disposedRef.current || mutedRef.current || document.hidden) {
          audio.pause()
          return
        }
        fadeMedia(audio, TARGET_VOLUME, 1200, mediaFadeRef)
        setPlaying(true)
      } catch {
        if (audio.error) {
          await startFallback()
          return
        }
        wantsMusicRef.current = false
        setPlaying(false)
      }
    }

    const unlock = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('.wizarding-bgm-toggle')) {
        interactedRef.current = true
        removeUnlockListeners()
        return
      }
      interactedRef.current = true
      removeUnlockListeners()
      if (!mutedRef.current) void startMusic()
    }

    function removeUnlockListeners() {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('wheel', unlock)
      unlockedListenerRef.current = null
    }

    const addUnlockListeners = () => {
      if (unlockedListenerRef.current) return
      window.addEventListener('pointerdown', unlock)
      window.addEventListener('keydown', unlock)
      window.addEventListener('touchstart', unlock, { passive: true })
      window.addEventListener('wheel', unlock, { passive: true })
      unlockedListenerRef.current = removeUnlockListeners
    }

    const handleMediaError = () => {
      if (interactedRef.current && wantsMusicRef.current && !mutedRef.current) void startFallback()
    }
    audio.addEventListener('error', handleMediaError)
    audio.load()

    const handleVisibility = () => {
      const loop = fallbackRef.current
      if (document.hidden) {
        if (mediaFadeRef.current !== null) cancelAnimationFrame(mediaFadeRef.current)
        mediaFadeRef.current = null
        audio.volume = 0
        audio.pause()
        if (loop) {
          if (loop.scheduler !== null) window.clearInterval(loop.scheduler)
          loop.scheduler = null
          void loop.context.suspend()
        }
        setPlaying(false)
        return
      }
      if (wantsMusicRef.current && !mutedRef.current) void startMusic()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    addUnlockListeners()
    void startMusic()

    return () => {
      disposedRef.current = true
      removeUnlockListeners()
      audio.removeEventListener('error', handleMediaError)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (mediaFadeRef.current !== null) cancelAnimationFrame(mediaFadeRef.current)
      if (suspendTimerRef.current !== null) window.clearTimeout(suspendTimerRef.current)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      const loop = fallbackRef.current
      if (loop) {
        if (loop.scheduler !== null) window.clearInterval(loop.scheduler)
        loop.sources.forEach((source) => {
          try { source.stop() } catch { /* already stopped */ }
          source.disconnect()
        })
        void loop.context.close()
      }
    }
  }, [])

  const toggleMusic = () => {
    if (playingRef.current) {
      mutedRef.current = true
      wantsMusicRef.current = false
      const audio = audioRef.current
      if (audio) {
        fadeMedia(audio, 0, 220, mediaFadeRef, () => {
          if (mutedRef.current) audio.pause()
        })
      }
      const loop = fallbackRef.current
      if (loop) {
        const now = loop.context.currentTime
        loop.master.gain.cancelScheduledValues(now)
        loop.master.gain.setValueAtTime(Math.max(0.0001, loop.master.gain.value), now)
        loop.master.gain.linearRampToValueAtTime(0, now + 0.22)
        if (loop.scheduler !== null) window.clearInterval(loop.scheduler)
        loop.scheduler = null
        if (suspendTimerRef.current !== null) window.clearTimeout(suspendTimerRef.current)
        suspendTimerRef.current = window.setTimeout(() => {
          suspendTimerRef.current = null
          if (loop.context.state === 'running') void loop.context.suspend()
        }, 240)
      }
      playingRef.current = false
      setIsPlaying(false)
      return
    }

    mutedRef.current = false
    wantsMusicRef.current = true
    interactedRef.current = true
    if (audioRef.current?.error || audioRef.current?.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      audioRef.current.dispatchEvent(new Event('error'))
      return
    }
    if (audioRef.current) void audioRef.current.play().then(() => {
      const audio = audioRef.current
      if (audio) fadeMedia(audio, TARGET_VOLUME, 1200, mediaFadeRef)
      playingRef.current = true
      setIsPlaying(true)
    }).catch(() => {
      const audio = audioRef.current
      audio?.dispatchEvent(new Event('error'))
    })
  }

  return (
    <button
      className={`wizarding-bgm-toggle${isPlaying ? ' is-playing' : ''}`}
      type="button"
      aria-label={isPlaying ? 'Mute background music' : 'Play background music'}
      aria-pressed={isPlaying}
      onClick={toggleMusic}
    >
      {isPlaying ? <Music2 aria-hidden="true" size={18} strokeWidth={1.8} /> : <VolumeX aria-hidden="true" size={18} strokeWidth={1.8} />}
      <span className="wizarding-bgm-toggle__bars" aria-hidden="true"><i /><i /><i /></span>
      <span className="visually-hidden">{isPlaying ? 'BGM ON' : 'BGM OFF'}</span>
    </button>
  )
}
