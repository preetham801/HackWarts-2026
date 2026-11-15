import { useEffect, useRef, useState } from 'react'
import { Music2, VolumeX } from 'lucide-react'

const TARGET_VOLUME = 0.45
const UNLOCK_EVENTS = ['pointerdown', 'mousedown', 'click', 'touchstart', 'touchmove', 'wheel', 'scroll', 'keydown', 'pointermove'] as const

export function WizardingBgmPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mutedRef = useRef(false)
  const unlockCleanupRef = useRef<(() => void) | null>(null)
  const lastHandledEventRef = useRef<Event | null>(null)
  const lastLowPriorityAttemptRef = useRef(0)
  const unlockAttemptPendingRef = useRef(false)

  useEffect(() => {
    const audio = new Audio('/audio/hogwarts-bgm.mp3')
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = TARGET_VOLUME
    audioRef.current = audio

    const syncPlayingState = () => setIsPlaying(!audio.paused && !audio.ended)
    const removeUnlockListeners = () => {
      for (const eventName of UNLOCK_EVENTS) {
        document.removeEventListener(eventName, unlock, true)
        window.removeEventListener(eventName, unlock, true)
      }
      unlockCleanupRef.current = null
    }

    const tryPlayback = (fromGesture = false) => {
      if (mutedRef.current || (!fromGesture && !audio.paused)) return null
      // Call play directly in the entry gesture handler for browsers that require
      // a user activation. A rejected autoplay attempt leaves the listeners ready.
      try {
        return audio.play().then(removeUnlockListeners).catch(() => {
          // Autoplay may be denied, or the MP3 may be unavailable. Never substitute audio.
        })
      } catch {
        // Keep the unlock listeners installed for the next natural page interaction.
        return null
      }
    }

    function unlock(event: Event) {
      if (lastHandledEventRef.current === event) return
      lastHandledEventRef.current = event

      // The sound control handles its own explicit play/mute action below.
      if (event.target instanceof Element && event.target.closest('.wizarding-bgm-toggle')) return
      if (mutedRef.current || unlockAttemptPendingRef.current) return

      const isPointerMotionOrScroll = ['pointermove', 'touchmove', 'wheel', 'scroll'].includes(event.type)
      const now = performance.now()
      if (isPointerMotionOrScroll && lastLowPriorityAttemptRef.current > 0 && now - lastLowPriorityAttemptRef.current < 240) return
      lastLowPriorityAttemptRef.current = now
      // A pending mount attempt can still be rejected by autoplay policy. Retry
      // synchronously from this gesture even if audio.paused has already flipped.
      unlockAttemptPendingRef.current = true
      const playback = tryPlayback(true)
      if (playback) void playback.finally(() => { unlockAttemptPendingRef.current = false })
      else unlockAttemptPendingRef.current = false
    }

    const addUnlockListeners = () => {
      const options = { capture: true, passive: true }
      for (const eventName of UNLOCK_EVENTS) {
        document.addEventListener(eventName, unlock, options)
        window.addEventListener(eventName, unlock, options)
      }
      unlockCleanupRef.current = removeUnlockListeners
    }

    audio.addEventListener('play', syncPlayingState)
    audio.addEventListener('pause', syncPlayingState)
    audio.addEventListener('ended', syncPlayingState)
    audio.load()
    addUnlockListeners()
    tryPlayback()

    return () => {
      removeUnlockListeners()
      audio.removeEventListener('play', syncPlayingState)
      audio.removeEventListener('pause', syncPlayingState)
      audio.removeEventListener('ended', syncPlayingState)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [])

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return

    if (!audio.paused) {
      mutedRef.current = true
      audio.pause()
      return
    }

    mutedRef.current = false
    try {
      void audio.play().then(() => unlockCleanupRef.current?.()).catch(() => {
        // Keep the control available; the exact MP3 remains the only audio source.
      })
    } catch {
      // The user can retry with the control or another page interaction.
    }
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
