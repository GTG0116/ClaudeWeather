import React, { useId } from 'react'

// Animated SVG weather icons
export default function WeatherIcon({ type, size = 64, className = '' }) {
  const uid = useId()
  const s = size
  const props = { width: s, height: s, viewBox: '0 0 64 64', className, style: { flexShrink: 0 } }

  switch (type) {
    case 'sunny':
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="13" fill="#FFD166" />
          <g stroke="#FFD166" strokeWidth="3" strokeLinecap="round">
            <line x1="32" y1="4" x2="32" y2="10">
              <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="10s" repeatCount="indefinite" />
            </line>
            <line x1="32" y1="54" x2="32" y2="60">
              <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="10s" repeatCount="indefinite" />
            </line>
            <line x1="4" y1="32" x2="10" y2="32">
              <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="10s" repeatCount="indefinite" />
            </line>
            <line x1="54" y1="32" x2="60" y2="32">
              <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="10s" repeatCount="indefinite" />
            </line>
            <line x1="11" y1="11" x2="16" y2="16">
              <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="10s" repeatCount="indefinite" />
            </line>
            <line x1="48" y1="48" x2="53" y2="53">
              <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="10s" repeatCount="indefinite" />
            </line>
            <line x1="53" y1="11" x2="48" y2="16">
              <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="10s" repeatCount="indefinite" />
            </line>
            <line x1="16" y1="48" x2="11" y2="53">
              <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="10s" repeatCount="indefinite" />
            </line>
          </g>
        </svg>
      )

    case 'clear_night':
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id={`moon-${uid}`}>
              <rect width="64" height="64" fill="white" />
              <circle cx="38" cy="24" r="17" fill="black" />
            </mask>
          </defs>
          {/* Crescent moon via mask */}
          <circle cx="28" cy="33" r="21" fill="#C8DAFF" mask={`url(#moon-${uid})`} />
          {/* Stars */}
          <circle cx="52" cy="12" r="2" fill="#FFD166" opacity="0.9" />
          <circle cx="10" cy="20" r="1.5" fill="#FFD166" opacity="0.7" />
          <circle cx="56" cy="38" r="1.5" fill="#FFD166" opacity="0.6" />
          <circle cx="20" cy="8" r="1" fill="#FFD166" opacity="0.5" />
          <circle cx="44" cy="52" r="1" fill="#FFD166" opacity="0.4" />
        </svg>
      )

    case 'partly_cloudy_day':
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="10" fill="#FFD166" />
          <g stroke="#FFD166" strokeWidth="2.5" strokeLinecap="round">
            <line x1="22" y1="5" x2="22" y2="9" />
            <line x1="22" y1="35" x2="22" y2="39" />
            <line x1="5" y1="22" x2="9" y2="22" />
            <line x1="35" y1="22" x2="39" y2="22" />
            <line x1="9" y1="9" x2="12" y2="12" />
            <line x1="32" y1="32" x2="35" y2="35" />
            <line x1="35" y1="9" x2="32" y2="12" />
            <line x1="12" y1="32" x2="9" y2="35" />
          </g>
          <rect x="12" y="34" width="40" height="18" rx="9" fill="white" opacity="0.95" />
          <ellipse cx="24" cy="34" rx="10" ry="8" fill="white" opacity="0.95" />
          <ellipse cx="36" cy="32" rx="12" ry="9" fill="white" opacity="0.95" />
        </svg>
      )

    case 'partly_cloudy_night':
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id={`moon-night-${uid}`}>
              <rect width="64" height="64" fill="white" />
              <circle cx="28" cy="14" r="13" fill="black" />
            </mask>
          </defs>
          {/* Crescent moon via mask */}
          <circle cx="20" cy="21" r="15" fill="#C8DAFF" mask={`url(#moon-night-${uid})`} />
          {/* Clouds */}
          <rect x="14" y="36" width="38" height="17" rx="8.5" fill="white" opacity="0.95" />
          <ellipse cx="26" cy="36" rx="10" ry="8" fill="white" opacity="0.95" />
          <ellipse cx="40" cy="33" rx="13" ry="9.5" fill="white" opacity="0.95" />
        </svg>
      )

    case 'cloudy':
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          {/* Back cloud (darker, slightly behind) */}
          <ellipse cx="44" cy="30" rx="14" ry="10" fill="#8fa8bf" />
          <rect x="30" y="30" width="28" height="14" rx="7" fill="#8fa8bf" />
          {/* Front cloud */}
          <rect x="8" y="36" width="46" height="18" rx="9" fill="#c8d8e8" />
          <ellipse cx="22" cy="36" rx="13" ry="10" fill="#c8d8e8" />
          <ellipse cx="38" cy="31" rx="16" ry="12" fill="#c8d8e8" />
          <ellipse cx="50" cy="37" rx="10" ry="8" fill="#c8d8e8" />
        </svg>
      )

    case 'rain_day':
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="8" fill="#FFD166" opacity="0.8" />
          <rect x="10" y="28" width="44" height="16" rx="8" fill="#8ab0cc" />
          <ellipse cx="22" cy="28" rx="10" ry="8" fill="#8ab0cc" />
          <ellipse cx="36" cy="25" rx="13" ry="9" fill="#8ab0cc" />
          <g stroke="#4a9eff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="22" y1="48" x2="19" y2="56"><animate attributeName="opacity" values="1;0;1" dur="1.2s" begin="0s" repeatCount="indefinite" /></line>
            <line x1="32" y1="48" x2="29" y2="56"><animate attributeName="opacity" values="1;0;1" dur="1.2s" begin="0.4s" repeatCount="indefinite" /></line>
            <line x1="42" y1="48" x2="39" y2="56"><animate attributeName="opacity" values="1;0;1" dur="1.2s" begin="0.8s" repeatCount="indefinite" /></line>
          </g>
        </svg>
      )

    case 'rain_night':
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id={`moon-rain-${uid}`}>
              <rect width="64" height="64" fill="white" />
              <circle cx="22" cy="10" r="10" fill="black" />
            </mask>
          </defs>
          <circle cx="15" cy="16" r="12" fill="#C8DAFF" opacity="0.85" mask={`url(#moon-rain-${uid})`} />
          <rect x="10" y="30" width="44" height="16" rx="8" fill="#8ab0cc" />
          <ellipse cx="22" cy="30" rx="10" ry="8" fill="#8ab0cc" />
          <ellipse cx="38" cy="27" rx="13" ry="9" fill="#8ab0cc" />
          <g stroke="#4a9eff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="22" y1="50" x2="19" y2="58"><animate attributeName="opacity" values="1;0;1" dur="1.2s" begin="0s" repeatCount="indefinite" /></line>
            <line x1="32" y1="50" x2="29" y2="58"><animate attributeName="opacity" values="1;0;1" dur="1.2s" begin="0.4s" repeatCount="indefinite" /></line>
            <line x1="42" y1="50" x2="39" y2="58"><animate attributeName="opacity" values="1;0;1" dur="1.2s" begin="0.8s" repeatCount="indefinite" /></line>
          </g>
        </svg>
      )

    case 'snow':
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="22" width="48" height="16" rx="8" fill="#c8d8e8" />
          <ellipse cx="22" cy="22" rx="11" ry="9" fill="#c8d8e8" />
          <ellipse cx="38" cy="19" rx="14" ry="10" fill="#c8d8e8" />
          <g fill="#a0c8ff">
            <circle cx="20" cy="48" r="2.5"><animate attributeName="cy" values="42;52" dur="1.5s" begin="0s" repeatCount="indefinite" /><animate attributeName="opacity" values="1;0" dur="1.5s" begin="0s" repeatCount="indefinite" /></circle>
            <circle cx="32" cy="48" r="2.5"><animate attributeName="cy" values="42;52" dur="1.5s" begin="0.5s" repeatCount="indefinite" /><animate attributeName="opacity" values="1;0" dur="1.5s" begin="0.5s" repeatCount="indefinite" /></circle>
            <circle cx="44" cy="48" r="2.5"><animate attributeName="cy" values="42;52" dur="1.5s" begin="1s" repeatCount="indefinite" /><animate attributeName="opacity" values="1;0" dur="1.5s" begin="1s" repeatCount="indefinite" /></circle>
          </g>
        </svg>
      )

    case 'thunderstorm':
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="16" width="48" height="16" rx="8" fill="#5a6a7a" />
          <ellipse cx="22" cy="16" rx="11" ry="9" fill="#5a6a7a" />
          <ellipse cx="38" cy="13" rx="14" ry="10" fill="#5a6a7a" />
          <polygon points="36,34 28,48 34,48 26,62 42,42 35,42" fill="#FFD166">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
          </polygon>
          <g stroke="#4a9eff" strokeWidth="2" strokeLinecap="round" opacity="0.7">
            <line x1="18" y1="46" x2="15" y2="54"><animate attributeName="opacity" values="1;0;1" dur="1.2s" begin="0.2s" repeatCount="indefinite" /></line>
            <line x1="46" y1="46" x2="43" y2="54"><animate attributeName="opacity" values="1;0;1" dur="1.2s" begin="0.9s" repeatCount="indefinite" /></line>
          </g>
        </svg>
      )

    case 'fog':
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <g stroke="#a0b0c0" strokeWidth="3" strokeLinecap="round">
            <line x1="10" y1="20" x2="54" y2="20"><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0s" repeatCount="indefinite" /></line>
            <line x1="16" y1="30" x2="48" y2="30"><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.3s" repeatCount="indefinite" /></line>
            <line x1="10" y1="40" x2="54" y2="40"><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.6s" repeatCount="indefinite" /></line>
            <line x1="16" y1="50" x2="48" y2="50"><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.9s" repeatCount="indefinite" /></line>
          </g>
        </svg>
      )

    case 'windy':
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <g stroke="#a0c8ff" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M8 20 Q20 14 32 20 Q44 26 54 20"><animate attributeName="d" values="M8 20 Q20 14 32 20 Q44 26 54 20;M8 22 Q20 16 32 22 Q44 28 54 22;M8 20 Q20 14 32 20 Q44 26 54 20" dur="1.5s" repeatCount="indefinite" /></path>
            <path d="M8 32 Q24 26 40 32 Q50 36 56 30"><animate attributeName="d" values="M8 32 Q24 26 40 32 Q50 36 56 30;M8 34 Q24 28 40 34 Q50 38 56 32;M8 32 Q24 26 40 32 Q50 36 56 30" dur="1.5s" begin="0.3s" repeatCount="indefinite" /></path>
            <path d="M8 44 Q20 38 32 44 Q44 50 54 44"><animate attributeName="d" values="M8 44 Q20 38 32 44 Q44 50 54 44;M8 46 Q20 40 32 46 Q44 52 54 46;M8 44 Q20 38 32 44 Q44 50 54 44" dur="1.5s" begin="0.6s" repeatCount="indefinite" /></path>
          </g>
        </svg>
      )

    case 'sleet':
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="22" width="48" height="16" rx="8" fill="#8ab0cc" />
          <ellipse cx="22" cy="22" rx="11" ry="9" fill="#8ab0cc" />
          <ellipse cx="38" cy="19" rx="14" ry="10" fill="#8ab0cc" />
          <g strokeLinecap="round">
            <line x1="20" y1="42" x2="17" y2="50" stroke="#4a9eff" strokeWidth="2"><animate attributeName="opacity" values="1;0;1" dur="1.2s" begin="0s" repeatCount="indefinite" /></line>
            <circle cx="32" cy="48" r="2.5" fill="#a0c8ff"><animate attributeName="cy" values="42;52" dur="1.5s" begin="0.5s" repeatCount="indefinite" /></circle>
            <line x1="44" y1="42" x2="41" y2="50" stroke="#4a9eff" strokeWidth="2"><animate attributeName="opacity" values="1;0;1" dur="1.2s" begin="0.8s" repeatCount="indefinite" /></line>
          </g>
        </svg>
      )

    default:
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          {/* Back cloud */}
          <ellipse cx="44" cy="30" rx="14" ry="10" fill="#8fa8bf" />
          <rect x="30" y="30" width="28" height="14" rx="7" fill="#8fa8bf" />
          {/* Front cloud */}
          <rect x="8" y="36" width="46" height="18" rx="9" fill="#c8d8e8" />
          <ellipse cx="22" cy="36" rx="13" ry="10" fill="#c8d8e8" />
          <ellipse cx="38" cy="31" rx="16" ry="12" fill="#c8d8e8" />
        </svg>
      )
  }
}
