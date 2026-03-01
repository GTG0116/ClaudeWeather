import React from 'react'

function getSunTimes(lat, lon, date = new Date()) {
  // Simple sunrise/sunset calculation (NOAA algorithm approximation)
  const rad = Math.PI / 180
  const day = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  const B = (360 / 365) * (day - 81) * rad
  const eqTime = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B)
  const declination = 23.45 * Math.sin(B) * rad
  const latRad = lat * rad
  const HA = Math.acos(-Math.tan(latRad) * Math.tan(declination)) / rad
  const offset = lon / 15 + eqTime / 60

  const sunriseHour = 12 - HA / 15 - offset
  const sunsetHour = 12 + HA / 15 - offset

  function toTime(h) {
    const totalMin = Math.round(h * 60)
    let hours = Math.floor(totalMin / 60)
    const mins = totalMin % 60
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${hours}:${mins.toString().padStart(2, '0')} ${ampm}`
  }

  const now = date.getHours() + date.getMinutes() / 60
  const localSunrise = sunriseHour + lon / 15
  const localSunset = sunsetHour + lon / 15
  const progress = Math.max(0, Math.min(1, (now - localSunrise) / (localSunset - localSunrise)))

  return {
    sunrise: toTime(sunriseHour),
    sunset: toTime(sunsetHour),
    progress: isNaN(progress) ? 0.5 : progress,
    dayLength: `${Math.floor(HA * 2 / 15)}h ${Math.round((HA * 2 / 15 % 1) * 60)}m`,
  }
}

export default function SunriseSunset({ lat, lon }) {
  if (!lat || !lon) return null
  const { sunrise, sunset, progress, dayLength } = getSunTimes(lat, lon)

  const arcWidth = 240
  const arcHeight = 100
  const cx = arcWidth / 2
  const cy = arcHeight + 10
  const r = arcHeight - 10

  // Arc path
  const startAngle = Math.PI
  const endAngle = 0
  const angle = startAngle + (startAngle - endAngle) * progress
  const sunX = cx + r * Math.cos(Math.PI - progress * Math.PI)
  const sunY = cy - r * Math.sin(progress * Math.PI)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.07)',
      borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginBottom: 12 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></svg>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sun</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>{dayLength} of daylight</span>
      </div>

      <svg width={arcWidth} height={arcHeight + 20} style={{ overflow: 'visible' }}>
        {/* Horizon line */}
        <line x1={cx - r - 10} y1={cy} x2={cx + r + 10} y2={cy} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Arc track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
        {/* Arc progress */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${sunX} ${sunY}`}
          fill="none"
          stroke="rgba(255, 209, 102, 0.5)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Sun */}
        {progress > 0 && progress < 1 && (
          <g>
            <circle cx={sunX} cy={sunY} r={10} fill="#FFD166" opacity="0.2" />
            <circle cx={sunX} cy={sunY} r={6} fill="#FFD166" />
          </g>
        )}

        {/* Labels */}
        <text x={cx - r - 5} y={cy + 18} fill="rgba(255,255,255,0.5)" fontSize="11" textAnchor="middle">{sunrise}</text>
        <text x={cx + r + 5} y={cy + 18} fill="rgba(255,255,255,0.5)" fontSize="11" textAnchor="middle">{sunset}</text>
      </svg>

      <div style={{ display: 'flex', gap: 28, marginTop: 4 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Sunrise</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>{sunrise}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Sunset</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>{sunset}</div>
        </div>
      </div>
    </div>
  )
}
