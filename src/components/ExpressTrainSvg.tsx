import { forwardRef, type SVGProps } from 'react'

type ExpressTrainSvgProps = SVGProps<SVGSVGElement>

export const ExpressTrainSvg = forwardRef<SVGSVGElement, ExpressTrainSvgProps>(function ExpressTrainSvg(props, ref) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 760 230"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <defs>
        <linearGradient id="express-crimson-metal" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#a3292d" />
          <stop offset=".38" stopColor="#74191e" />
          <stop offset="1" stopColor="#350f16" />
        </linearGradient>
        <linearGradient id="express-boiler-metal" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#535454" />
          <stop offset=".3" stopColor="#25292d" />
          <stop offset=".76" stopColor="#11171c" />
          <stop offset="1" stopColor="#080d12" />
        </linearGradient>
        <linearGradient id="express-brass" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f1d589" />
          <stop offset=".45" stopColor="#d4af37" />
          <stop offset="1" stopColor="#805c22" />
        </linearGradient>
        <linearGradient id="express-roof" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#44464a" />
          <stop offset="1" stopColor="#171a20" />
        </linearGradient>
        <linearGradient id="express-window" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ffe9a1" />
          <stop offset=".58" stopColor="#d99036" />
          <stop offset="1" stopColor="#7b351d" />
        </linearGradient>
        <radialGradient id="express-headlamp">
          <stop stopColor="#fff6ce" />
          <stop offset=".42" stopColor="#f5c76c" />
          <stop offset="1" stopColor="#c56b22" />
        </radialGradient>
      </defs>

      {/* Passenger coaches */}
      <g stroke="#1a1213" strokeWidth="3" strokeLinejoin="round">
        <path d="M29 62Q34 48 54 44h142q17 3 21 18v41H29Z" fill="url(#express-crimson-metal)" />
        <path d="M42 59q4-14 19-17h125q18 2 23 17Z" fill="url(#express-roof)" stroke="url(#express-brass)" strokeWidth="2" />
        <path d="M38 97h174" stroke="url(#express-brass)" strokeWidth="3" />
        <path d="M52 63h25v27H52zm36 0h25v27H88zm36 0h25v27h-25zm36 0h25v27h-25z" fill="url(#express-window)" stroke="#41211b" strokeWidth="4" />
        <path d="M80 61v31m36-31v31m36-31v31" stroke="url(#express-brass)" strokeWidth="2" />
        <path d="M214 77h19" stroke="url(#express-brass)" strokeWidth="5" />
        <path d="M241 62q4-14 20-17h125q18 2 22 17v44H241Z" fill="url(#express-crimson-metal)" />
        <path d="M253 59q5-14 20-17h103q18 2 23 17Z" fill="url(#express-roof)" stroke="url(#express-brass)" strokeWidth="2" />
        <path d="M250 97h146" stroke="url(#express-brass)" strokeWidth="3" />
        <path d="M263 63h25v27h-25zm36 0h25v27h-25zm36 0h25v27h-25zm36 0h13v27h-13z" fill="url(#express-window)" stroke="#41211b" strokeWidth="4" />
        <path d="M291 61v31m36-31v31m36-31v31" stroke="url(#express-brass)" strokeWidth="2" />
        <path d="M392 77h24" stroke="url(#express-brass)" strokeWidth="5" />
      </g>

      {/* Coach bogies, wheels and connecting hardware */}
      <g stroke="#17191b" strokeWidth="4">
        {[65, 177, 276, 365].map((x) => (
          <g key={x}>
            <path d={`M${x - 25} 103h50l-5 9h-40Z`} fill="#292b2d" stroke="url(#express-brass)" strokeWidth="2" />
            {[x - 15, x + 15].map((wheelX) => (
              <g key={wheelX}>
                <circle cx={wheelX} cy="115" r="11" fill="#15181b" stroke="url(#express-brass)" strokeWidth="3" />
                <circle cx={wheelX} cy="115" r="3" fill="#d4af37" stroke="none" />
              </g>
            ))}
          </g>
        ))}
        <path d="M52 126h328" stroke="#424448" strokeWidth="3" />
      </g>

      {/* Steam locomotive, oriented toward the right */}
      <g stroke="#131619" strokeWidth="4" strokeLinejoin="round">
        <path d="M407 80h41q8-28 28-34h151q26 7 34 35l22 10v18H408Z" fill="url(#express-crimson-metal)" />
        <path d="M448 79q8-32 33-38h132q25 5 35 38Z" fill="url(#express-boiler-metal)" stroke="url(#express-brass)" strokeWidth="2.5" />
        <path d="M465 57q18-17 43-17h87q23 3 38 17" fill="none" stroke="#92908a" strokeWidth="2" opacity=".7" />
        <path d="M480 69h137" stroke="url(#express-brass)" strokeWidth="2" />
        <path d="M454 90h169" stroke="#111519" strokeWidth="6" />
        <path d="M438 55l-8-21h25l5 28m119-24-2-18h22l5 23" fill="url(#express-boiler-metal)" stroke="url(#express-brass)" strokeWidth="3" />
        <path d="M633 73q19 0 31 12v20h-29Z" fill="url(#express-crimson-metal)" />
        <path d="M641 78h15v16h-15Z" fill="url(#express-window)" stroke="#4b281c" strokeWidth="3" />
        <path d="M424 62h18v37h-18Z" fill="#49201c" stroke="url(#express-brass)" strokeWidth="2" />
        <path d="M405 101h287v10H405Z" fill="#25282b" stroke="url(#express-brass)" strokeWidth="2" />
        <path d="M682 77h21v29h-21z" fill="#292b2d" stroke="url(#express-brass)" strokeWidth="3" />
        <circle cx="705" cy="90" r="13" fill="url(#express-headlamp)" stroke="url(#express-brass)" strokeWidth="4" />
        <path d="M696 105h23l14 13h-47Z" fill="#25282b" stroke="url(#express-brass)" strokeWidth="2" />
        <path d="M715 117h30l-8 8h-30Z" fill="#111519" stroke="#8f6d35" strokeWidth="2" />
        <path d="M430 107h-19l-9 11h32Z" fill="#2a2d30" stroke="url(#express-brass)" strokeWidth="2" />
      </g>

      {/* Engine wheels and visible side rods */}
      <g stroke="#16191c" strokeWidth="4">
        {[468, 531, 594, 646].map((x, index) => (
          <g key={x}>
            <circle cx={x} cy="117" r={index === 3 ? 11 : 15} fill="#181b1e" stroke="url(#express-brass)" strokeWidth="3" />
            <circle cx={x} cy="117" r="4" fill="#b88d3a" stroke="none" />
            <path d={`M${x} 102v30m-12-15h24`} stroke="#77716a" strokeWidth="2" />
          </g>
        ))}
        <path d="M468 117h178" stroke="url(#express-brass)" strokeWidth="4" />
        <circle cx="498" cy="117" r="5" fill="#b98d3e" stroke="#222426" strokeWidth="2" />
        <circle cx="575" cy="117" r="5" fill="#b98d3e" stroke="#222426" strokeWidth="2" />
        <path d="M418 128h268" stroke="#414448" strokeWidth="3" />
      </g>

      {/* Brass fittings and restrained steam wisps */}
      <g fill="url(#express-brass)" stroke="#5c4525" strokeWidth="1.5">
        <circle cx="458" cy="47" r="4" /><circle cx="614" cy="48" r="4" /><circle cx="675" cy="62" r="3" />
        <path d="M455 100h8v4h-8zm87-41h12v4h-12zm83 38h9v4h-9z" />
      </g>
      <g fill="none" stroke="#d6d9d7" strokeLinecap="round" opacity=".52">
        <path d="M440 25q-13-13 1-22m9 24q-8-12 2-20" strokeWidth="5" />
      </g>
    </svg>
  )
})
