import { useEffect, useRef, useState } from 'react'
import { Music2, VolumeX, X } from 'lucide-react'

const BGM_URL = '/audio/hogwarts-bgm.mp3'
const PLAYING_GAIN = 0.5
const UNLOCK_EVENTS = ['pointerdown', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'keydown', 'wheel', 'scroll'] as const

let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null
let decodedBuffer: AudioBuffer | null = null
let loopStart = 0
let loopEnd = 0
let bufferSource: AudioBufferSourceNode | null = null
let fallbackAudio: HTMLAudioElement | null = null
let fallbackFailed = false
let muted = false
const playerSubscribers = new Set<() => void>()

function notifyPlayerSubscribers() {
  playerSubscribers.forEach((subscriber) => subscriber())
}

function prepareAudioEngine() {
  if (typeof window === 'undefined') return

  const Context = window.AudioContext
  if (Context) {
    try {
      audioContext = new Context()
      masterGain = audioContext.createGain()
      masterGain.gain.value = PLAYING_GAIN
      masterGain.connect(audioContext.destination)
    } catch {
      audioContext = null
      masterGain = null
    }
  }
}

prepareAudioEngine()

function findLoopBounds(buffer: AudioBuffer) {
  let first = buffer.length
  let last = -1
  for (let channelIndex = 0; channelIndex < buffer.numberOfChannels; channelIndex += 1) {
    const samples = buffer.getChannelData(channelIndex)
    for (let index = 0; index < samples.length; index += 1) {
      if (Math.abs(samples[index]) > 0.002) {
        first = Math.min(first, index)
        last = Math.max(last, index)
      }
    }
  }
  if (last < first) return { start: 0, end: buffer.duration }
  return {
    start: first / buffer.sampleRate,
    end: Math.min(buffer.duration, (last + 1) / buffer.sampleRate),
  }
}

function isPlaybackActive() {
  if (bufferSource && audioContext?.state === 'running') return true
  return fallbackAudio !== null && !fallbackAudio.paused && !fallbackAudio.ended
}

function startBufferLoop() {
  if (!audioContext || !masterGain || !decodedBuffer || bufferSource || audioContext.state !== 'running') return false
  const source = audioContext.createBufferSource()
  source.buffer = decodedBuffer
  source.loop = true
  source.loopStart = loopStart
  source.loopEnd = loopEnd
  source.connect(masterGain)
  source.onended = () => {
    if (bufferSource === source) bufferSource = null
    notifyPlayerSubscribers()
  }
  bufferSource = source
  source.start(audioContext.currentTime, loopStart)
  notifyPlayerSubscribers()
  return true
}

function createFallbackAudio() {
  if (fallbackAudio || fallbackFailed) return fallbackAudio
  fallbackAudio = new Audio(BGM_URL)
  fallbackAudio.loop = true
  fallbackAudio.preload = 'auto'
  fallbackAudio.volume = muted ? 0 : PLAYING_GAIN
  fallbackAudio.addEventListener('play', notifyPlayerSubscribers)
  fallbackAudio.addEventListener('pause', notifyPlayerSubscribers)
  fallbackAudio.addEventListener('ended', notifyPlayerSubscribers)
  fallbackAudio.addEventListener('error', () => {
    fallbackFailed = true
    notifyPlayerSubscribers()
  }, { once: true })
  fallbackAudio.load()
  return fallbackAudio
}

// This fetch begins at module evaluation, before the React component mounts.
const decodedAudioPromise: Promise<boolean> = (async () => {
  const context = audioContext as AudioContext | null
  if (!context) return false
  try {
    const response = await fetch(BGM_URL)
    if (!response.ok) throw new Error(`BGM request failed: ${response.status}`)
    const encodedAudio = await response.arrayBuffer()
    const buffer = await context.decodeAudioData(encodedAudio)
    decodedBuffer = buffer
    const bounds = findLoopBounds(buffer)
    loopStart = bounds.start
    loopEnd = bounds.end
    if (context.state === 'running') startBufferLoop()
    notifyPlayerSubscribers()
    return true
  } catch {
    createFallbackAudio()
    notifyPlayerSubscribers()
    return false
  }
})()

async function resumeAndStart() {
  if (muted) return false
  if (audioContext) {
    try {
      if (audioContext.state !== 'running') await audioContext.resume()
    } catch {
      return false
    }
    if (audioContext.state !== 'running') return false

    const decoded = await decodedAudioPromise
    if (muted) return false
    if (decoded && startBufferLoop()) return true
    if (decoded && bufferSource) return true
  }

  const audio = createFallbackAudio()
  if (!audio || muted) return false
  try {
    await audio.play()
    notifyPlayerSubscribers()
    return !audio.paused
  } catch {
    return false
  }
}

function setEngineMuted(nextMuted: boolean) {
  muted = nextMuted
  if (audioContext && masterGain) {
    const now = audioContext.currentTime
    masterGain.gain.cancelScheduledValues(now)
    masterGain.gain.setValueAtTime(masterGain.gain.value, now)
    masterGain.gain.linearRampToValueAtTime(nextMuted ? 0 : PLAYING_GAIN, now + 0.12)
  }
  if (fallbackAudio) fallbackAudio.volume = nextMuted ? 0 : PLAYING_GAIN
  notifyPlayerSubscribers()
}

export function WizardingBgmPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showEntryPrompt, setShowEntryPrompt] = useState(false)
  const unlockCleanupRef = useRef<(() => void) | null>(null)
  const lastHandledEventRef = useRef<Event | null>(null)
  const gestureAttemptPendingRef = useRef(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    const syncState = () => {
      if (!mountedRef.current) return
      setIsPlaying(isPlaybackActive() && !muted)
      setIsMuted(muted)
      const contextReady = audioContext?.state === 'running'
      setShowEntryPrompt(!contextReady && !isPlaybackActive())
    }

    const removeUnlockListeners = () => {
      for (const eventName of UNLOCK_EVENTS) {
        document.removeEventListener(eventName, unlock, true)
        window.removeEventListener(eventName, unlock, true)
      }
      unlockCleanupRef.current = null
    }

    async function unlock(event: Event) {
      if (lastHandledEventRef.current === event) return
      lastHandledEventRef.current = event
      if (event.target instanceof Element && event.target.closest('.wizarding-bgm-toggle')) return
      if (muted || gestureAttemptPendingRef.current) return

      // resume() is invoked synchronously during the trusted gesture; listeners
      // remain installed until the context is running and the loop has started.
      const resumeRequest = audioContext?.state !== 'running' ? audioContext?.resume() : undefined
      gestureAttemptPendingRef.current = true
      try {
        await resumeRequest
        const started = await resumeAndStart()
        if (started && isPlaybackActive()) removeUnlockListeners()
      } catch {
        // A later valid gesture can retry if browser policy rejected this attempt.
      } finally {
        gestureAttemptPendingRef.current = false
        syncState()
      }
    }

    const addUnlockListeners = () => {
      const options = { capture: true, passive: true }
      for (const eventName of UNLOCK_EVENTS) {
        document.addEventListener(eventName, unlock, options)
        window.addEventListener(eventName, unlock, options)
      }
      unlockCleanupRef.current = removeUnlockListeners
    }

    const onContextStateChange = () => {
      syncState()
      if (audioContext?.state === 'running' && !muted) {
        void decodedAudioPromise.then((decoded) => {
          if (decoded) startBufferLoop()
          else void resumeAndStart()
          if (isPlaybackActive()) removeUnlockListeners()
          syncState()
        })
      }
    }
    audioContext?.addEventListener('statechange', onContextStateChange)
    fallbackAudio?.addEventListener('canplay', syncState)
    fallbackAudio?.addEventListener('loadeddata', syncState)
    playerSubscribers.add(syncState)
    addUnlockListeners()
    syncState()

    // Try on entry immediately. Browsers may reject this until a valid gesture.
    void resumeAndStart().then((started) => {
      if (started && isPlaybackActive()) removeUnlockListeners()
      syncState()
    })

    return () => {
      mountedRef.current = false
      removeUnlockListeners()
      playerSubscribers.delete(syncState)
      audioContext?.removeEventListener('statechange', onContextStateChange)
      fallbackAudio?.removeEventListener('canplay', syncState)
      fallbackAudio?.removeEventListener('loadeddata', syncState)
    }
  }, [])

  const toggleMusic = () => {
    const nextMuted = !isMuted
    setEngineMuted(nextMuted)
    setIsMuted(nextMuted)
    if (!nextMuted) {
      void resumeAndStart().then(() => {
        setIsPlaying(isPlaybackActive() && !muted)
        if (isPlaybackActive()) unlockCleanupRef.current?.()
      })
    } else {
      setIsPlaying(false)
    }
  }

  const dismissPrompt = () => setShowEntryPrompt(false)

  return (
    <>
      {showEntryPrompt && (
        <aside className="wizarding-bgm-entry-prompt" role="status" aria-live="polite">
          <span>Tap or scroll anywhere to awaken the Wizarding Score</span>
          <button type="button" aria-label="Dismiss music prompt" onClick={dismissPrompt}>
            <X aria-hidden="true" size={16} />
          </button>
        </aside>
      )}
      <button
        className={`wizarding-bgm-toggle${isPlaying ? ' is-playing' : ''}`}
        type="button"
        aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
        aria-pressed={!isMuted}
        onClick={toggleMusic}
      >
        {isPlaying ? <Music2 aria-hidden="true" size={18} strokeWidth={1.8} /> : <VolumeX aria-hidden="true" size={18} strokeWidth={1.8} />}
        <span className="wizarding-bgm-toggle__bars" aria-hidden="true"><i /><i /><i /></span>
        <span className="visually-hidden">{isMuted ? 'BGM OFF' : 'BGM ON'}</span>
      </button>
    </>
  )
}
