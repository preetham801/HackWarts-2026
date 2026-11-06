export function RailwayLandscape() {
  return (
    <>
      <svg className="railway-landscape railway-landscape--desktop" viewBox="0 0 1440 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="railway-night-sky" x2="0" y2="1"><stop stopColor="#091321" /><stop offset=".72" stopColor="#18283a" /><stop offset="1" stopColor="#263448" /></linearGradient>
          <linearGradient id="bridge-stone" x2="0" y2="1"><stop stopColor="#5c5d5a" /><stop offset=".48" stopColor="#343c43" /><stop offset="1" stopColor="#222c35" /></linearGradient>
          <linearGradient id="rail-metal" x2="0" y2="1"><stop stopColor="#9e8a63" /><stop offset=".4" stopColor="#333940" /><stop offset="1" stopColor="#151b23" /></linearGradient>
          <linearGradient id="distant-mist" x2="0" y2="1"><stop stopColor="#9ca9aa" stopOpacity="0" /><stop offset=".55" stopColor="#9ca9aa" stopOpacity=".16" /><stop offset="1" stopColor="#b4b7ae" stopOpacity="0" /></linearGradient>
          <radialGradient id="railway-moon-glow"><stop stopColor="#e8d9aa" stopOpacity=".6" /><stop offset="1" stopColor="#e8d9aa" stopOpacity="0" /></radialGradient>
        </defs>
        <path fill="url(#railway-night-sky)" d="M0 0h1440v500H0z" />
        <circle cx="1180" cy="93" r="165" fill="url(#railway-moon-glow)" />
        <circle cx="1180" cy="93" r="27" fill="#dfd4ae" opacity=".56" />
        <g fill="#e3d7b6">
          <circle cx="100" cy="74" r="1.8" /><circle cx="224" cy="106" r="1.4" /><circle cx="328" cy="45" r="1.5" />
          <circle cx="512" cy="92" r="1.4" /><circle cx="644" cy="53" r="1.8" /><circle cx="775" cy="99" r="1.3" />
          <circle cx="924" cy="54" r="1.5" /><circle cx="1040" cy="124" r="1.2" /><circle cx="1320" cy="60" r="1.7" />
          <circle cx="1390" cy="148" r="1.3" /><circle cx="420" cy="146" r="1.2" /><circle cx="840" cy="160" r="1.4" />
        </g>
        <path fill="#182838" d="m0 285 105-86 75 57 92-129 95 143 78-81 117 104 106-162 120 137 107-100 109 92 89-142 106 104 91-68 150 121v125H0Z" />
        <path fill="#223242" d="m0 326 115-73 81 49 125-105 84 92 83-53 123 73 96-121 99 97 119-82 104 69 100-121 118 101 88-57 105 64v141H0Z" />
        <path fill="#101b27" d="M0 354c112-53 207-37 318-17 119 21 216-49 340-21 133 30 219-37 333-5 139 39 232-17 449 22v167H0Z" />
        <path fill="url(#distant-mist)" d="M0 259c210 46 305-36 496 9 147 35 252-39 407-5 190 42 355-18 537 24v180H0Z" />
        <path fill="url(#bridge-stone)" stroke="#77766e" strokeWidth="5" d="M70 294h1300v45h-60v161H130V339H70Z" />
        <path fill="#252f38" stroke="#77766e" strokeWidth="5" d="M180 452v-82c0-48 65-48 65 0v82Zm225 0v-82c0-48 65-48 65 0v82Zm225 0v-82c0-48 65-48 65 0v82Zm225 0v-82c0-48 65-48 65 0v82Zm225 0v-82c0-48 65-48 65 0v82Z" />
        <path d="M74 300h1290M132 345h1175" fill="none" stroke="#a08c68" strokeWidth="5" opacity=".7" />
        <g fill="#88877d" opacity=".36">
          <path d="M110 311h40v22h-40zm75 0h40v22h-40zm75 0h40v22h-40zm75 0h40v22h-40zm75 0h40v22h-40zm75 0h40v22h-40zm75 0h40v22h-40zm75 0h40v22h-40zm75 0h40v22h-40zm75 0h40v22h-40zm75 0h40v22h-40zm75 0h40v22h-40zm75 0h40v22h-40zm75 0h40v22h-40zm75 0h40v22h-40z" />
        </g>
        <path fill="#111820" d="M0 454h1440v46H0z" />
        <path d="M0 465h1440M0 488h1440" stroke="url(#rail-metal)" strokeWidth="9" />
        <g stroke="#8e7850" strokeWidth="10" opacity=".8">
          <path d="M65 449v50m90-50v50m90-50v50m90-50v50m90-50v50m90-50v50m90-50v50m90-50v50m90-50v50m90-50v50m90-50v50m90-50v50m90-50v50m90-50v50" />
        </g>
        <g className="railway-lantern railway-lantern--left" transform="translate(72 235)">
          <path d="M0 110V22m-12 90h24M-8 30h16l-2 20h-12z" stroke="#92794d" strokeWidth="4" fill="#202833" />
          <path d="M-5 34h10v12H-5z" fill="#f3c66c" />
          <circle cy="39" r="34" fill="#e5b866" opacity=".15" />
        </g>
        <g className="railway-lantern railway-lantern--right" transform="translate(1354 235)">
          <path d="M0 110V22m-12 90h24M-8 30h16l-2 20h-12z" stroke="#92794d" strokeWidth="4" fill="#202833" />
          <path d="M-5 34h10v12H-5z" fill="#f3c66c" />
          <circle cy="39" r="34" fill="#e5b866" opacity=".15" />
        </g>
        <g fill="#bfc5c2" opacity=".17">
          <ellipse cx="252" cy="365" rx="210" ry="18" /><ellipse cx="840" cy="392" rx="300" ry="14" /><ellipse cx="1208" cy="356" rx="212" ry="20" />
        </g>
      </svg>

      <svg className="railway-landscape railway-landscape--mobile" viewBox="0 0 390 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="railway-mobile-sky" x2="0" y2="1"><stop stopColor="#091321" /><stop offset="1" stopColor="#263448" /></linearGradient>
          <linearGradient id="railway-mobile-stone" x2="0" y2="1"><stop stopColor="#64635d" /><stop offset="1" stopColor="#28333d" /></linearGradient>
          <radialGradient id="railway-mobile-lantern"><stop stopColor="#ffe2a0" stopOpacity=".65" /><stop offset="1" stopColor="#edb95f" stopOpacity="0" /></radialGradient>
        </defs>
        <path fill="url(#railway-mobile-sky)" d="M0 0h390v540H0z" />
        <circle cx="316" cy="76" r="100" fill="url(#railway-mobile-lantern)" />
        <circle cx="316" cy="76" r="18" fill="#dfd4ae" opacity=".55" />
        <g fill="#e3d7b6"><circle cx="35" cy="68" r="1.5" /><circle cx="91" cy="122" r="1.4" /><circle cx="177" cy="47" r="1.7" /><circle cx="234" cy="146" r="1.3" /><circle cx="76" cy="202" r="1.4" /><circle cx="349" cy="233" r="1.5" /></g>
        <path fill="#182838" d="m0 247 56-74 42 39 54-96 48 99 58-57 57 70 48-84 27 33v202H0Z" />
        <path fill="#243443" d="m0 302 68-54 47 36 66-82 58 85 59-55 54 61 38-31v204H0Z" />
        <path fill="#111b27" d="M0 358c62-28 112-4 171-19 75-20 131 20 219-10v211H0Z" />
        <path fill="#12191f" stroke="#77766e" strokeWidth="6" d="M0 272h390v67H0z" />
        <path fill="url(#railway-mobile-stone)" stroke="#77766e" strokeWidth="5" d="M0 335h390v145h-42v-54c0-75-79-75-79 0v54h-98v-54c0-75-79-75-79 0v54H0Z" />
        <path d="M0 281h390m0 66H0" stroke="#aa966e" strokeWidth="5" />
        <g stroke="#8e7850" strokeWidth="8" opacity=".82"><path d="M164 0v540m60-540v540" /></g>
        <g stroke="#8e7850" strokeWidth="7" opacity=".65"><path d="M150 42h88m-88 65h88m-88 65h88m-88 65h88m-88 65h88m-88 65h88m-88 65h88m-88 65h88m-88 65h88" /></g>
        <g transform="translate(48 198)">
          <path d="M0 93V20m-10 75h20M-7 27h14l-2 17h-10z" stroke="#92794d" strokeWidth="4" fill="#202833" />
          <path d="M-4 30h8v11h-8z" fill="#f3c66c" /><circle cy="35" r="31" fill="#e5b866" opacity=".14" />
        </g>
        <g transform="translate(340 390)">
          <path d="M0 93V20m-10 75h20M-7 27h14l-2 17h-10z" stroke="#92794d" strokeWidth="4" fill="#202833" />
          <path d="M-4 30h8v11h-8z" fill="#f3c66c" /><circle cy="35" r="31" fill="#e5b866" opacity=".14" />
        </g>
        <g fill="#c5cbca" opacity=".16"><ellipse cx="70" cy="319" rx="115" ry="12" /><ellipse cx="330" cy="484" rx="122" ry="16" /></g>
      </svg>
    </>
  )
}
