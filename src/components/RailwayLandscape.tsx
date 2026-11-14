const desktopTrackPath = 'M 160 355 C 176 355 178 330 200 330 C 260 330 300 300 360 300 C 420 300 460 365 520 365 C 594 365 646 295 720 295 C 794 295 846 365 920 365 C 980 365 1020 300 1080 300 C 1140 300 1180 330 1240 330 C 1262 330 1264 355 1280 355'

const mobileTrackPath = 'M 195 110 C 195 145 117 137 117 175 C 117 250 273 290 273 395 C 273 500 117 510 117 615 C 117 720 273 730 273 835 C 273 940 117 950 117 1055 C 117 1160 273 1170 273 1275 C 273 1380 117 1390 117 1495 C 117 1525 195 1520 195 1550'

export function RailwayLandscape() {
  return (
    <>
      <svg className="railway-landscape railway-landscape--desktop" viewBox="0 0 1440 720" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="railway-night-sky" x2="0" y2="1"><stop stopColor="#091321" /><stop offset=".72" stopColor="#18283a" /><stop offset="1" stopColor="#263448" /></linearGradient>
          <linearGradient id="bridge-stone" x2="0" y2="1"><stop stopColor="#686862" /><stop offset=".48" stopColor="#343c43" /><stop offset="1" stopColor="#222c35" /></linearGradient>
          <linearGradient id="rail-metal" x2="0" y2="1"><stop stopColor="#c0a779" /><stop offset=".42" stopColor="#786447" /><stop offset="1" stopColor="#292e34" /></linearGradient>
          <linearGradient id="distant-mist" x2="0" y2="1"><stop stopColor="#9ca9aa" stopOpacity="0" /><stop offset=".55" stopColor="#9ca9aa" stopOpacity=".2" /><stop offset="1" stopColor="#b4b7ae" stopOpacity="0" /></linearGradient>
          <radialGradient id="railway-moon-glow"><stop stopColor="#e8d9aa" stopOpacity=".6" /><stop offset="1" stopColor="#e8d9aa" stopOpacity="0" /></radialGradient>
        </defs>
        <path fill="url(#railway-night-sky)" d="M0 0h1440v720H0z" />
        <circle cx="1180" cy="93" r="165" fill="url(#railway-moon-glow)" />
        <circle cx="1180" cy="93" r="27" fill="#dfd4ae" opacity=".56" />
        <g fill="#e3d7b6">
          <circle cx="100" cy="74" r="1.8" /><circle cx="224" cy="106" r="1.4" /><circle cx="328" cy="45" r="1.5" />
          <circle cx="512" cy="92" r="1.4" /><circle cx="644" cy="53" r="1.8" /><circle cx="775" cy="99" r="1.3" />
          <circle cx="924" cy="54" r="1.5" /><circle cx="1040" cy="124" r="1.2" /><circle cx="1320" cy="60" r="1.7" />
          <circle cx="1390" cy="148" r="1.3" /><circle cx="420" cy="146" r="1.2" /><circle cx="840" cy="160" r="1.4" />
        </g>
        <path fill="#182838" d="m0 285 105-86 75 57 92-129 95 143 78-81 117 104 106-162 120 137 107-100 109 92 89-142 106 104 91-68 150 121v175H0Z" />
        <path fill="#223242" d="m0 326 115-73 81 49 125-105 84 92 83-53 123 73 96-121 99 97 119-82 104 69 100-121 118 101 88-57 105 64v190H0Z" />
        <path fill="#101b27" d="M0 354c112-53 207-37 318-17 119 21 216-49 340-21 133 30 219-37 333-5 139 39 232-17 449 22v387H0Z" />
        <path fill="url(#distant-mist)" d="M0 259c210 46 305-36 496 9 147 35 252-39 407-5 190 42 355-18 537 24v300H0Z" />
        <path fill="url(#bridge-stone)" stroke="#77766e" strokeWidth="5" d="M70 294h1300v45h-60v161H130V339H70Z" />
        <path fill="#252f38" stroke="#77766e" strokeWidth="5" d="M180 452v-82c0-48 65-48 65 0v82Zm225 0v-82c0-48 65-48 65 0v82Zm225 0v-82c0-48 65-48 65 0v82Zm225 0v-82c0-48 65-48 65 0v82Zm225 0v-82c0-48 65-48 65 0v82Z" />
        <g fill="#141d26" opacity=".52"><path d="M0 510h1440v210H0z" /></g>
        <g className="railway-lantern railway-lantern--left" transform="translate(72 235)">
          <path d="M0 110V22m-12 90h24M-8 30h16l-2 20h-12z" stroke="#92794d" strokeWidth="4" fill="#202833" />
          <path d="M-5 34h10v12H-5z" fill="#f3c66c" /><circle cy="39" r="34" fill="#e5b866" opacity=".15" />
        </g>
        <g className="railway-lantern railway-lantern--right" transform="translate(1354 235)">
          <path d="M0 110V22m-12 90h24M-8 30h16l-2 20h-12z" stroke="#92794d" strokeWidth="4" fill="#202833" />
          <path d="M-5 34h10v12H-5z" fill="#f3c66c" /><circle cy="39" r="34" fill="#e5b866" opacity=".15" />
        </g>
        <g fill="#bfc5c2" opacity=".17"><ellipse cx="252" cy="365" rx="210" ry="18" /><ellipse cx="840" cy="392" rx="300" ry="14" /><ellipse cx="1208" cy="356" rx="212" ry="20" /></g>

        <path d={desktopTrackPath} fill="none" stroke="#10161d" strokeWidth="88" strokeLinecap="round" />
        <path d={desktopTrackPath} fill="none" stroke="url(#bridge-stone)" strokeWidth="78" strokeLinecap="round" />
        <path d={desktopTrackPath} fill="none" stroke="#242b31" strokeWidth="48" strokeLinecap="round" />
        <path d={desktopTrackPath} fill="none" stroke="#9a8055" strokeWidth="25" strokeDasharray="2 17" strokeLinecap="butt" opacity=".82" />
        <path d={desktopTrackPath} transform="translate(0 -8)" fill="none" stroke="url(#rail-metal)" strokeWidth="5" strokeLinecap="round" />
        <path d={desktopTrackPath} transform="translate(0 8)" fill="none" stroke="url(#rail-metal)" strokeWidth="5" strokeLinecap="round" />
        <path id="winding-track-path" d={desktopTrackPath} fill="none" stroke="none" />
        <path className="express-route-progress-fill express-route-progress-fill--desktop" d={desktopTrackPath} fill="none" stroke="#f4bd61" strokeWidth="3" strokeLinecap="round" opacity=".92" />
      </svg>

      <svg className="railway-landscape railway-landscape--mobile" viewBox="0 0 390 1680" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="railway-mobile-sky" x2="0" y2="1"><stop stopColor="#091321" /><stop offset=".5" stopColor="#18283a" /><stop offset="1" stopColor="#080d17" /></linearGradient>
          <linearGradient id="railway-mobile-stone" x2="0" y2="1"><stop stopColor="#736b5c" /><stop offset=".5" stopColor="#39434b" /><stop offset="1" stopColor="#202933" /></linearGradient>
          <radialGradient id="railway-mobile-lantern"><stop stopColor="#ffe2a0" stopOpacity=".55" /><stop offset="1" stopColor="#edb95f" stopOpacity="0" /></radialGradient>
        </defs>
        <path fill="url(#railway-mobile-sky)" d="M0 0h390v1680H0z" />
        <path fill="#182838" opacity=".78" d="M0 0h78v1680H0zm312 0h78v1680h-78z" />
        <path fill="#243443" opacity=".62" d="M0 0c70 180 42 330 0 470v1210h390V0c-70 180-42 330 0 470V0z" />
        <g fill="#e3d7b6" opacity=".75"><circle cx="35" cy="68" r="1.5" /><circle cx="91" cy="182" r="1.4" /><circle cx="177" cy="47" r="1.7" /><circle cx="334" cy="246" r="1.3" /><circle cx="48" cy="458" r="1.4" /><circle cx="350" cy="715" r="1.5" /><circle cx="62" cy="945" r="1.3" /><circle cx="328" cy="1185" r="1.4" /><circle cx="41" cy="1418" r="1.5" /><circle cx="346" cy="1590" r="1.3" /></g>
        <g opacity=".5" fill="#101923"><path d="M0 0h40v1680H0zm350 0h40v1680h-40z" /></g>
        <g stroke="#735f3f" strokeWidth="3" opacity=".5"><path d="M8 0v1680M382 0v1680" /></g>
        <g fill="#a5a99e" opacity=".12"><ellipse cx="195" cy="210" rx="170" ry="48" /><ellipse cx="195" cy="620" rx="180" ry="58" /><ellipse cx="195" cy="1040" rx="175" ry="52" /><ellipse cx="195" cy="1460" rx="180" ry="58" /></g>
        <g transform="translate(36 215)"><circle cx="0" cy="20" r="38" fill="url(#railway-mobile-lantern)" /><path d="M0 94V18m-9 77h18M-7 25h14l-2 18h-10z" stroke="#92794d" strokeWidth="3" fill="#202833" /><path d="M-4 28h8v12h-8z" fill="#f3c66c" /></g>
        <g transform="translate(354 510)"><circle cx="0" cy="20" r="38" fill="url(#railway-mobile-lantern)" /><path d="M0 94V18m-9 77h18M-7 25h14l-2 18h-10z" stroke="#92794d" strokeWidth="3" fill="#202833" /><path d="M-4 28h8v12h-8z" fill="#f3c66c" /></g>
        <g transform="translate(36 930)"><circle cx="0" cy="20" r="38" fill="url(#railway-mobile-lantern)" /><path d="M0 94V18m-9 77h18M-7 25h14l-2 18h-10z" stroke="#92794d" strokeWidth="3" fill="#202833" /><path d="M-4 28h8v12h-8z" fill="#f3c66c" /></g>
        <g transform="translate(354 1330)"><circle cx="0" cy="20" r="38" fill="url(#railway-mobile-lantern)" /><path d="M0 94V18m-9 77h18M-7 25h14l-2 18h-10z" stroke="#92794d" strokeWidth="3" fill="#202833" /><path d="M-4 28h8v12h-8z" fill="#f3c66c" /></g>

        <path d={mobileTrackPath} fill="none" stroke="#10161d" strokeWidth="48" strokeLinecap="round" />
        <path d={mobileTrackPath} fill="none" stroke="url(#railway-mobile-stone)" strokeWidth="40" strokeLinecap="round" />
        <path d={mobileTrackPath} fill="none" stroke="#222b33" strokeWidth="25" strokeLinecap="round" />
        <path d={mobileTrackPath} fill="none" stroke="#9a8055" strokeWidth="14" strokeDasharray="2 16" strokeLinecap="butt" opacity=".82" />
        <path d={mobileTrackPath} transform="translate(-7 0)" fill="none" stroke="url(#railway-mobile-stone)" strokeWidth="3" strokeLinecap="round" />
        <path d={mobileTrackPath} transform="translate(7 0)" fill="none" stroke="url(#railway-mobile-stone)" strokeWidth="3" strokeLinecap="round" />
        <path id="winding-track-path-mobile" d={mobileTrackPath} fill="none" stroke="none" />
        <path className="express-route-progress-fill express-route-progress-fill--mobile" d={mobileTrackPath} fill="none" stroke="#f4bd61" strokeWidth="2" strokeLinecap="round" opacity=".92" />
      </svg>
    </>
  )
}
