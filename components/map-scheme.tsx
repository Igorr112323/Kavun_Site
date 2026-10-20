export function MapScheme({ address }: { address: string }) {
  return (
    <div className="map-scheme">
      <svg viewBox="0 0 640 440" role="img" aria-label={`Схема проезда: ${address}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0v40" fill="none" stroke="rgba(236,233,225,.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="640" height="440" fill="#141814" />
        <rect width="640" height="440" fill="url(#mapgrid)" />

        {/* поле / лесополоса */}
        <path d="M0 330h180v110H0z" fill="rgba(199,217,106,.06)" />
        <path d="M430 0h210v120H430z" fill="rgba(199,217,106,.05)" />

        {/* трасса М4 */}
        <path d="M-20 120C120 150 190 210 300 250s220 60 380 40" fill="none" stroke="rgba(236,233,225,.18)" strokeWidth="26" />
        <path d="M-20 120C120 150 190 210 300 250s220 60 380 40" fill="none" stroke="rgba(236,233,225,.3)" strokeWidth="1.4" strokeDasharray="10 8" />

        {/* улицы */}
        <path d="M120 0v440" stroke="rgba(236,233,225,.16)" strokeWidth="8" />
        <path d="M0 300h640" stroke="rgba(236,233,225,.14)" strokeWidth="7" />
        <path d="M330 0v440" stroke="rgba(236,233,225,.1)" strokeWidth="4" />
        <path d="M470 120v320" stroke="rgba(236,233,225,.1)" strokeWidth="4" />
        <path d="M120 300h350" stroke="rgba(236,233,225,.22)" strokeWidth="2" strokeDasharray="6 6" />

        {/* маршрут */}
        <path d="M120 440V300h230v-40" fill="none" stroke="#ff4d12" strokeWidth="3" strokeDasharray="9 6" />
        <circle cx="120" cy="300" r="5" fill="#ff4d12" />

        {/* точка */}
        <g transform="translate(350 210)">
          <rect x="-13" y="-13" width="26" height="26" fill="none" stroke="#ff4d12" strokeWidth="2" />
          <circle cx="0" cy="0" r="4" fill="#ff4d12" />
          <path d="M-24 0h8M16 0h8M0 -24v8M0 16v8" stroke="#ff4d12" strokeWidth="1.4" />
          <text x="20" y="-20" fill="#ece9e1" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="1.4">
            СТАРОКОРСУНСКАЯ
          </text>
          <text x="20" y="34" fill="#ece9e1" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="1.4">
            ПОЛЕВАЯ, 43
          </text>
        </g>

        {/* подписи улиц */}
        <text x="130" y="70" fill="rgba(236,233,225,.38)" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="2">
          УЛ. СТАВРОПОЛЬСКАЯ
        </text>
        <text x="30" y="288" fill="rgba(236,233,225,.38)" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="2">
          М-4 «ДОН»
        </text>
        <text x="480" y="290" fill="rgba(236,233,225,.32)" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="2">
          ЮЖНЫЙ ОБХОД
        </text>

        {/* масштаб */}
        <g transform="translate(520 392)">
          <path d="M0 0h70" stroke="rgba(236,233,225,.5)" strokeWidth="1.4" />
          <path d="M0 -4v8M35 -3v6M70 -4v8" stroke="rgba(236,233,225,.5)" strokeWidth="1.4" />
          <text x="0" y="18" fill="rgba(236,233,225,.45)" fontFamily="IBM Plex Mono, monospace" fontSize="8" letterSpacing="1">
            500 М
          </text>
        </g>
        <g transform="translate(40 40)">
          <path d="M0 22V0l7 8 7-8v22" fill="none" stroke="rgba(236,233,225,.5)" strokeWidth="1.2" />
          <text x="0" y="38" fill="rgba(236,233,225,.45)" fontFamily="IBM Plex Mono, monospace" fontSize="8" letterSpacing="1">
            N
          </text>
        </g>
      </svg>
      <div className="map-scheme__card">
        <span>Склад и сервис</span>
        <b>Полевая, 43</b>
        <a
          href={`https://yandex.ru/maps/?text=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Открыть в Яндекс.Картах →
        </a>
      </div>
    </div>
  )
}
