import React, { useState } from 'react'
import WeatherIcon from './WeatherIcon.jsx'
import { getWeatherIcon } from '../utils/nws.js'

// Full temperature scale: -50°F to 120°F
const SCALE_MIN = -50
const SCALE_MAX = 120
const SCALE_RANGE = SCALE_MAX - SCALE_MIN // 170

// Color stops matching Apple Weather's palette
const COLOR_STOPS = [
  { p: 0,    r: 100, g: 120, b: 255 }, // -50°F: blue-purple
  { p: 0.29, r: 74,  g: 158, b: 255 }, //   0°F: blue
  { p: 0.48, r: 0,   g: 212, b: 255 }, //  32°F: cyan
  { p: 0.65, r: 80,  g: 220, b: 120 }, //  60°F: green
  { p: 0.76, r: 255, g: 209, b: 102 }, //  80°F: yellow
  { p: 0.88, r: 255, g: 140, b: 66  }, // 100°F: orange
  { p: 1.00, r: 255, g: 60,  b: 60  }, // 120°F: red
]

function tempToRgb(temp) {
  const t = Math.max(SCALE_MIN, Math.min(SCALE_MAX, temp))
  const pct = (t - SCALE_MIN) / SCALE_RANGE
  for (let i = 1; i < COLOR_STOPS.length; i++) {
    const prev = COLOR_STOPS[i - 1]
    const curr = COLOR_STOPS[i]
    if (pct <= curr.p) {
      const f = (pct - prev.p) / (curr.p - prev.p)
      const r = Math.round(prev.r + f * (curr.r - prev.r))
      const g = Math.round(prev.g + f * (curr.g - prev.g))
      const b = Math.round(prev.b + f * (curr.b - prev.b))
      return `rgb(${r},${g},${b})`
    }
  }
  return 'rgb(255,60,60)'
}

// Full-scale gradient string for the dimmed background track
const FULL_GRADIENT =
  'linear-gradient(90deg, rgb(100,120,255) 0%, rgb(74,158,255) 29%, rgb(0,212,255) 48%, rgb(80,220,120) 65%, rgb(255,209,102) 76%, rgb(255,140,66) 88%, rgb(255,60,60) 100%)'

function formatDay(dateStr, index) {
  if (index === 0) return 'Today'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

export default function DailyForecast({ daily }) {
  const [expanded, setExpanded] = useState(null)
  if (!daily?.length) return null

  // Group into day pairs (day + night)
  const days = []
  for (let i = 0; i < daily.length; i++) {
    const p = daily[i]
    if (p.isDaytime || days.length === 0) {
      days.push({ day: p.isDaytime ? p : null, night: p.isDaytime ? null : p })
    } else {
      if (days.length > 0 && !days[days.length - 1].night) {
        days[days.length - 1].night = p
      } else {
        days.push({ day: null, night: p })
      }
    }
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.07)',
      borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '18px 18px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{days.length}-Day Forecast</span>
      </div>

      {days.map((d, i) => {
        const period = d.day || d.night
        const high = d.day?.temperature
        const low = d.night?.temperature
        const icon = getWeatherIcon(period?.icon, true)
        const pop = d.day?.probabilityOfPrecipitation?.value ?? d.night?.probabilityOfPrecipitation?.value ?? 0

        // Position within the -50 to 120°F scale
        const lowVal = low ?? high ?? 32
        const highVal = high ?? low ?? 32
        const lowPct = ((lowVal - SCALE_MIN) / SCALE_RANGE) * 100
        const highPct = ((highVal - SCALE_MIN) / SCALE_RANGE) * 100

        return (
          <div key={i}>
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '12px 18px',
                background: expanded === i ? 'rgba(255,255,255,0.05)' : 'none',
                color: 'white',
                gap: 12,
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                transition: 'background 0.15s',
                textAlign: 'left',
              }}
            >
              {/* Day */}
              <span style={{ width: 48, fontSize: 14, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? 'white' : 'rgba(255,255,255,0.8)', flexShrink: 0 }}>
                {formatDay(period?.startTime, i)}
              </span>

              {/* Icon */}
              <WeatherIcon type={icon} size={28} style={{ flexShrink: 0 }} />

              {/* Precip — always shown, 0% default */}
              <span style={{ width: 36, fontSize: 12, color: '#4a9eff', fontWeight: 500, flexShrink: 0 }}>
                {pop}%
              </span>

              {/* Temp bar — Apple Weather style: full -50 to 120°F palette */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', width: 30, textAlign: 'right', flexShrink: 0 }}>
                  {low != null ? `${low}°` : '—'}
                </span>

                <div style={{ flex: 1, height: 6, borderRadius: 3, position: 'relative', minWidth: 60 }}>
                  {/* Full-scale gradient track (dimmed) */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 3,
                    background: FULL_GRADIENT,
                    opacity: 0.2,
                  }} />
                  {/* Active range segment */}
                  <div style={{
                    position: 'absolute',
                    left: `${lowPct}%`,
                    width: `${Math.max(highPct - lowPct, 3)}%`,
                    height: '100%',
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${tempToRgb(lowVal)}, ${tempToRgb(highVal)})`,
                  }} />
                </div>

                <span style={{ fontSize: 13, fontWeight: 600, color: 'white', width: 30, flexShrink: 0 }}>
                  {high != null ? `${high}°` : '—'}
                </span>
              </div>

              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"
                style={{ transform: expanded === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {expanded === i && (
              <div style={{
                padding: '8px 18px 16px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.03)',
              }}>
                {d.day && (
                  <div style={{ marginBottom: d.night ? 12 : 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Day</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{d.day.detailedForecast}</div>
                  </div>
                )}
                {d.night && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Night</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{d.night.detailedForecast}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
