import React, { useState } from 'react'
import WeatherIcon from './WeatherIcon.jsx'
import { getWeatherIcon } from '../utils/nws.js'

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

  const allHighs = days.map(d => d.day?.temperature || d.night?.temperature || 0)
  const allLows = days.map(d => d.night?.temperature || d.day?.temperature || 0)
  const absMax = Math.max(...allHighs)
  const absMin = Math.min(...allLows)
  const absRange = absMax - absMin || 1

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
        const pop = d.day?.probabilityOfPrecipitation?.value || d.night?.probabilityOfPrecipitation?.value

        const lowNorm = low != null ? (low - absMin) / absRange : 0
        const highNorm = high != null ? (high - absMin) / absRange : 1
        const barLeft = `${lowNorm * 100}%`
        const barWidth = `${(highNorm - lowNorm) * 100}%`

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

              {/* Precip */}
              <span style={{ width: 36, fontSize: 12, color: '#4a9eff', fontWeight: 500, flexShrink: 0 }}>
                {pop > 5 ? `${pop}%` : ''}
              </span>

              {/* Temp bar */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', width: 30, textAlign: 'right', flexShrink: 0 }}>
                  {low != null ? `${low}°` : '—'}
                </span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, position: 'relative', minWidth: 60 }}>
                  <div style={{
                    position: 'absolute',
                    left: barLeft,
                    width: barWidth,
                    height: '100%',
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, #4a9eff, #ffd166)',
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
