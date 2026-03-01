import React from 'react'
import WeatherIcon from './WeatherIcon.jsx'
import { getWeatherIcon } from '../utils/nws.js'

function formatHour(dateStr) {
  const d = new Date(dateStr)
  const h = d.getHours()
  if (h === 0) return '12 AM'
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

export default function HourlyForecast({ hourly }) {
  if (!hourly?.length) return null
  const periods = hourly.slice(0, 24)

  // Find min/max for temp bar
  const temps = periods.map(p => p.temperature)
  const minT = Math.min(...temps)
  const maxT = Math.max(...temps)
  const range = maxT - minT || 1

  return (
    <div style={{
      background: 'rgba(255,255,255,0.07)',
      borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '18px 0',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '0 18px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Hourly Forecast</span>
      </div>

      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: 0,
        paddingBottom: 4,
        scrollbarWidth: 'thin',
      }}>
        {periods.map((p, i) => {
          const icon = getWeatherIcon(p.icon, p.isDaytime)
          const barH = Math.round(((p.temperature - minT) / range) * 40 + 10)
          const isNow = i === 0

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '0 14px',
                minWidth: 70,
                borderRight: i < periods.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background: isNow ? 'rgba(74,158,255,0.08)' : 'none',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: isNow ? 600 : 400, color: isNow ? '#4a9eff' : 'rgba(255,255,255,0.6)' }}>
                {isNow ? 'Now' : formatHour(p.startTime)}
              </div>
              <WeatherIcon type={icon} size={32} />
              <div style={{ fontSize: 11, color: '#4a9eff', fontWeight: 500 }}>
                {p.probabilityOfPrecipitation?.value ?? 0}%
              </div>
              <div style={{ width: 4, height: barH, background: `hsl(${220 - (p.temperature - minT) / range * 60}, 80%, 65%)`, borderRadius: 2 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>
                {p.temperature}°
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
