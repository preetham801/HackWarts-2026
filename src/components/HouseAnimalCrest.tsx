export type HouseAnimal = 'lion' | 'badger' | 'eagle' | 'serpent'

interface HouseAnimalCrestProps {
  animal: HouseAnimal
}

/** Original, lightweight heraldic line artwork for the four House cards. */
export function HouseAnimalCrest({ animal }: HouseAnimalCrestProps) {
  return (
    <svg className={`house-crest house-crest--${animal}`} viewBox="0 0 120 140" aria-hidden="true" focusable="false">
      <path className="crest-outline" d="M60 5 108 22 102 82Q94 117 60 136 26 117 18 82L12 22 60 5Z" />
      <path className="crest-inner" d="M60 12 101 27 95 81Q88 111 60 127 32 111 25 81L19 27 60 12Z" />
      <path className="crest-divider" d="M27 39h66M31 93h58" />

      {animal === 'lion' && (
        <g className="crest-animal">
          <path className="crest-shadow" d="M60 42c-8-13-25-9-27 2-9 1-13 11-8 19-7 8-3 19 5 22-1 12 10 20 19 17 5 10 17 10 22 0 10 3 20-6 19-17 9-5 10-16 4-22 5-10 0-19-9-20-3-12-19-15-25-1Z" />
          <path className="crest-main" d="M60 47c-7-8-18-6-20 2-7 2-9 9-5 15-5 6-2 13 4 15-1 8 6 13 13 10 4 8 12 8 16 0 7 3 14-3 13-10 7-3 8-11 3-16 4-7 0-14-7-15-3-8-12-9-17-1Z" />
          <path className="crest-line" d="M42 53 34 47m42 6 9-6M39 67l-8 1m50-1 8 1M42 82l-7 6m50-6 7 6M49 94l-2 7m26-7 2 7" />
          <path className="crest-detail" d="M49 64q5-5 10 0m2 0q5-5 10 0m-20 11q9 7 18 0m-9-10-4 7h8l-4-7Zm-7 11q7 4 14 0m-21-3-8-2m49 2 8-2" />
          <circle className="crest-eye" cx="53" cy="65" r="1.6" />
          <circle className="crest-eye" cx="67" cy="65" r="1.6" />
        </g>
      )}

      {animal === 'badger' && (
        <g className="crest-animal">
          <path className="crest-shadow" d="M39 51q-9-7-14 1l4 16q-5 16 4 27 10 11 27 8 17 3 27-8 9-11 4-27l4-16q-5-8-14-1-8-9-21-8-13-1-21 8Z" />
          <path className="crest-main" d="M42 53q-7-5-11 0l4 14q-4 14 4 23 8 9 21 7 13 2 21-7 8-9 4-23l4-14q-4-5-11 0-7-7-18-6-11-1-18 6Z" />
          <path className="crest-shadow" d="M51 48q9-7 18 0l-3 24q-2 7-6 10-4-3-6-10l-3-24Z" />
          <path className="crest-detail" d="M56 48q4 9 4 21t0 13q4-4 5-11l3-23M44 57l6 5m26-5-6 5m-25 8 7 2m20-2-7 2" />
          <path className="crest-line" d="M48 68q4-4 8 0m8 0q4-4 8 0m-19 12q9 8 18 0m-12-2h6l-3 4-3-4Z" />
          <circle className="crest-eye" cx="52" cy="68" r="1.5" />
          <circle className="crest-eye" cx="68" cy="68" r="1.5" />
          <path className="crest-detail" d="m45 94-2 6m10-5-1 6m15-6 1 6m10-7 2 6" />
        </g>
      )}

      {animal === 'eagle' && (
        <g className="crest-animal">
          <path className="crest-shadow" d="M60 60 34 46 25 54 17 51 27 70 21 75l19 5-8 9 22-4 6 12 6-12 22 4-8-9 19-5-6-5 10-19-8 3-9-8-25 14Z" />
          <path className="crest-main" d="m60 63-25-12-10 7-4-2 9 15-5 3 16 4-6 7 19-3 6 10 6-10 19 3-6-7 16-4-5-3 9-15-4 2-10-7-25 12Z" />
          <path className="crest-shadow" d="M60 48q-15 4-15 19 0 14 15 22 15-8 15-22 0-15-15-19Z" />
          <path className="crest-main" d="M60 51q-11 4-11 16 0 11 11 17 11-6 11-17 0-12-11-16Z" />
          <path className="crest-detail" d="M50 56q-12 2-19 10m18-4-10 7m11 1-13 6m17-18q6-4 12 0m-12 6q6-4 12 0m-12 6q5-3 10 0" />
          <path className="crest-beak" d="m60 62 8 4-8 8-8-8 8-4Z" />
          <circle className="crest-eye" cx="55" cy="61" r="1.5" />
          <circle className="crest-eye" cx="65" cy="61" r="1.5" />
          <path className="crest-line" d="m29 84 11 1m51-1-11 1m-29 9-2 5m22-5 2 5" />
        </g>
      )}

      {animal === 'serpent' && (
        <g className="crest-animal">
          <path className="crest-shadow" d="M77 48q-20-8-34 5-12 11 0 20 10 7 22-1 9-6 15 0 7 7-2 14-12 9-29 0l-6 8q23 13 42-1 16-12 4-25-10-10-27-1-8 5-13 0-5-5 2-11 9-8 22-3l4-5Z" />
          <path className="crest-main" d="M76 51q-17-6-29 5-9 8 0 14 8 5 18-1 12-8 22 1 11 10 0 20-13 11-32 2l-3 4q21 10 37-2 13-10 2-21-9-8-23 0-10 6-16 0-6-6 1-12 9-7 21-3l2-7Z" />
          <path className="crest-shadow" d="M73 42q10-8 20 0l-2 13q-7 8-17 0l-4-6 3-7Z" />
          <path className="crest-main" d="M74 44q8-6 16 0l-2 9q-6 6-13 0l-3-4 2-5Z" />
          <path className="crest-detail" d="M79 44q5 3 10 0m-9 7 7 1m-21 6 4 3m-20 4 5 2m25 6-4 3m-18 7 5 1m-9 8 5 2" />
          <circle className="crest-eye" cx="82" cy="47" r="1.7" />
          <path className="crest-line" d="m90 50 7 2-7 2" />
        </g>
      )}

      <path className="crest-foot" d="M43 111h34m-27 6h20" />
    </svg>
  )
}
