import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Adds a one-time, reduced-motion-aware entrance to explicitly marked content blocks. */
export function useScrollReveal() {
  useLayoutEffect(() => {
    const media = gsap.matchMedia()

    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('.reveal-on-scroll').forEach((target) => {
          const items = Array.from(target.querySelectorAll<HTMLElement>(':scope > [data-reveal-item]'))
          const animatedElements = items.length ? items : [target]

          gsap.fromTo(animatedElements,
            { autoAlpha: 0, y: 32 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              stagger: items.length ? 0.12 : 0,
              ease: 'power2.out',
              clearProps: 'transform,opacity,visibility',
              scrollTrigger: {
                trigger: target,
                start: 'top 86%',
                once: true,
              },
            },
          )
        })
      })

      return () => context.revert()
    })

    return () => media.revert()
  }, [])
}
