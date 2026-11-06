type SteamLocomotiveProps = {
  idPrefix: string
  className?: string
}

export function SteamLocomotive({ idPrefix, className = '' }: SteamLocomotiveProps) {
  const bodyGradient = `${idPrefix}-body`
  const metalGradient = `${idPrefix}-metal`
  const glassGradient = `${idPrefix}-glass`

  return (
    <svg className={`steam-locomotive ${className}`} viewBox="0 0 620 300" role="img" aria-label="Original illustrated antique-red steam locomotive">
      <defs>
        <linearGradient id={bodyGradient} x1="0" x2="0.8" y1="0" y2="1">
          <stop offset="0" stopColor="#9b3936" />
          <stop offset=".48" stopColor="#672522" />
          <stop offset="1" stopColor="#31191a" />
        </linearGradient>
        <linearGradient id={metalGradient} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#d9b66c" />
          <stop offset="1" stopColor="#78592d" />
        </linearGradient>
        <radialGradient id={glassGradient}>
          <stop offset="0" stopColor="#fff0b2" />
          <stop offset=".5" stopColor="#edb85e" />
          <stop offset="1" stopColor="#a85b2c" />
        </radialGradient>
      </defs>
      <g fill="none" stroke="#21181a" strokeLinejoin="round" strokeLinecap="round" strokeWidth="8">
        <path d="M28 76C10 61 23 46 45 41c-9-20 15-34 34-20 13-22 43-9 40 13 24-5 37 17 23 34 21 2 30 26 10 38H45c-16-4-25-15-17-30Z" fill="#c4c7c2" opacity=".4" stroke="#aab4b8" strokeWidth="3" />
        <path d="M78 115c-12-12-3-24 14-25-2-14 17-21 27-10 14-15 35-5 32 12 19-4 29 13 17 25" stroke="#e5e2d8" strokeWidth="4" opacity=".3" />
      </g>

      <g stroke="#241719" strokeLinejoin="round" strokeWidth="8">
        <path d="M383 105h127l39 42v96H356V138Z" fill={`url(#${bodyGradient})`} />
        <path d="M398 57h112v58H383V81Z" fill="#642625" />
        <path d="M392 49h122v14H392z" fill={`url(#${metalGradient})`} strokeWidth="4" />
        <path d="M400 67h45v62h-45zM461 67h40v62h-40z" fill={`url(#${glassGradient})`} strokeWidth="7" />
        <path d="M412 71v53M472 71v53" stroke="#41211e" strokeWidth="5" />
        <path d="M455 53v78" stroke="#301a1a" strokeWidth="8" />

        <path d="M45 164h342l46 40v42H45Z" fill={`url(#${bodyGradient})`} />
        <path d="M70 126h226c40 0 65 19 83 50H55Z" fill="#762c29" />
        <path d="M73 123h215v13H67z" fill={`url(#${metalGradient})`} strokeWidth="4" />
        <path d="M129 165h39v45h-39zM185 165h42v45h-42zM244 165h42v45h-42z" fill={`url(#${glassGradient})`} strokeWidth="7" />
        <path d="M149 169v36M206 169v36M265 169v36" stroke="#48221e" strokeWidth="5" />

        <path d="M91 126 104 55h39l18 71Z" fill="#6e2826" />
        <path d="M96 52h56v13H96z" fill={`url(#${metalGradient})`} strokeWidth="5" />
        <path d="M103 43h43v11h-43z" fill="#4c2322" strokeWidth="5" />
        <path d="M119 32h15v13h-15z" fill="#332020" strokeWidth="4" />
        <path d="M95 120h59" stroke="#d1ac62" strokeWidth="5" />

        <path d="M39 155h28v85H39z" fill="#43201f" />
        <path d="M44 161h19v22H44z" fill={`url(#${glassGradient})`} strokeWidth="4" />
        <circle cx="35" cy="186" r="21" fill={`url(#${glassGradient})`} stroke="#37201c" strokeWidth="8" />
        <circle cx="35" cy="186" r="8" fill="#fff1b7" stroke="none" />
        <path d="M47 213h334" stroke="#d8b76e" strokeWidth="5" />
        <path d="M61 225h302" stroke="#321c1d" strokeWidth="10" />
        <path d="M375 139h18v99h-18z" fill="#402020" strokeWidth="5" />
        <path d="M375 144h18" stroke="#dbb86d" strokeWidth="5" />
      </g>

      <g fill="#21191a" stroke="#b99859" strokeWidth="7">
        <circle cx="104" cy="245" r="43" /><circle cx="104" cy="245" r="28" fill="#3b2523" strokeWidth="4" />
        <circle cx="229" cy="245" r="50" /><circle cx="229" cy="245" r="33" fill="#3b2523" strokeWidth="4" />
        <circle cx="352" cy="245" r="43" /><circle cx="352" cy="245" r="28" fill="#3b2523" strokeWidth="4" />
        <circle cx="456" cy="245" r="39" /><circle cx="456" cy="245" r="25" fill="#3b2523" strokeWidth="4" />
      </g>
      <g fill="none" stroke="#d9bf80" strokeLinecap="round" strokeWidth="5">
        <path d="M104 217v56m-28-28h56m-48-20 40 40m0-40-40 40" />
        <path d="M229 211v68m-34-34h68m-48-24 48 48m0-48-48 48" />
        <path d="M352 217v56m-28-28h56m-48-20 40 40m0-40-40 40" />
        <path d="M456 220v50m-25-25h50m-35-18 36 36m0-36-36 36" />
        <path d="M104 245h125l123-12h104" strokeWidth="9" />
      </g>
      <g fill="#d9b66c">
        <circle cx="82" cy="145" r="4" /><circle cx="165" cy="145" r="4" /><circle cx="304" cy="145" r="4" />
        <circle cx="414" cy="145" r="4" /><circle cx="501" cy="145" r="4" />
      </g>
      <path d="M27 288h496" stroke="#171719" strokeWidth="10" opacity=".6" />
    </svg>
  )
}
