import { useEffect, useRef, useState } from 'react'
import { Music2, VolumeX, X } from 'lucide-react'

const TARGET_VOLUME = 0.45
const UNLOCK_EVENTS = ['pointerdown', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'wheel', 'scroll', 'keydown'] as const

export function WizardingBgmPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showEntryPrompt, setShowEntryPrompt] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mutedRef = useRef(false)
  const unlockCleanupRef = useRef<(() => void) | null>(null)
  const lastHandledEventRef = useRef<Event | null>(null)
  const playPendingRef = useRef(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = TARGET_VOLUME
    audio.loop = true
    audio.preload = 'auto'

    const syncPlayingState = () => setIsPlaying(!audio.paused && !audio.ended)
    const removeUnlockListeners = () => {
      for (const eventName of UNLOCK_EVENTS) {
        document.removeEventListener(eventName, unlock, true)
        window.removeEventListener(eventName, unlock, true)
      }
      unlockCleanupRef.current = null
    }

    const attemptPlayback = (force = false) => {
      if (mutedRef.current || (playPendingRef.current && !force) || (!force && !audio.paused)) return null
      playPendingRef.current = true
      try {
        return audio.play().then(() => {
          playPendingRef.current = false
          if (!audio.paused) {
            setShowEntryPrompt(false)
            removeUnlockListeners()
          }
        }).catch((error: unknown) => {
          playPendingRef.current = false
          if (error instanceof DOMException && error.name === 'NotAllowedError' && audio.paused && !mutedRef.current) setShowEntryPrompt(true)
        })
      } catch (error) {
        playPendingRef.current = false
        if (error instanceof DOMException && error.name === 'NotAllowedError' && audio.paused && !mutedRef.current) setShowEntryPrompt(true)
        return null
      }
    }

    function unlock(event: Event) {
      if (lastHandledEventRef.current === event) return
      lastHandledEventRef.current = event
      if (event.target instanceof Element && event.target.closest('.wizarding-bgm-toggle')) return
      if (mutedRef.current) return
      // Re-attempt even if mount autoplay is pending: browsers can change
      // audio.paused before rejecting the initial request.
      const playback = attemptPlayback(true)
      if (playback) void playback.finally(() => {
        if (audio && !audio.paused) removeUnlockListeners()
      })
    }

    const addUnlockListeners = () => {
      const options = { capture: true, passive: true }
      for (const eventName of UNLOCK_EVENTS) {
        document.addEventListener(eventName, unlock, options)
        window.addEventListener(eventName, unlock, options)
      }
      unlockCleanupRef.current = removeUnlockListeners
    }

    const retryWhenReady = () => attemptPlayback()
    const retryWhenVisible = () => {
      if (document.visibilityState === 'visible') attemptPlayback()
    }
    audio.addEventListener('play', syncPlayingState)
    audio.addEventListener('pause', syncPlayingState)
    audio.addEventListener('ended', syncPlayingState)
    audio.addEventListener('canplay', retryWhenReady)
    audio.addEventListener('loadeddata', retryWhenReady)
    document.addEventListener('visibilitychange', retryWhenVisible)
    addUnlockListeners()
    syncPlayingState()
    attemptPlayback(true)

    return () => {
      removeUnlockListeners()
      audio.removeEventListener('play', syncPlayingState)
      audio.removeEventListener('pause', syncPlayingState)
      audio.removeEventListener('ended', syncPlayingState)
      audio.removeEventListener('canplay', retryWhenReady)
      audio.removeEventListener('loadeddata', retryWhenReady)
      document.removeEventListener('visibilitychange', retryWhenVisible)
      audio.pause()
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
      void audio.play().then(() => {
        if (!audio.paused) {
          setShowEntryPrompt(false)
          unlockCleanupRef.current?.()
        }
      }).catch(() => {
        // The exact supplied recording remains the only audio source.
      })
    } catch {
      // The user can retry with the optional control or another page gesture.
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/hogwarts-bgm.mp3"
        autoPlay
        loop
        preload="auto"
        playsInline
        aria-hidden="true"
        tabIndex={-1}
      />
      {showEntryPrompt && (
        <aside className="wizarding-bgm-entry-prompt" role="status" aria-live="polite">
          <span>Tap anywhere to enter the Wizarding Realm</span>
          <button type="button" aria-label="Dismiss music prompt" onClick={() => setShowEntryPrompt(false)}>
            <X aria-hidden="true" size={16} />
          </button>
        </aside>
      )}
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
    </>
  )
}
