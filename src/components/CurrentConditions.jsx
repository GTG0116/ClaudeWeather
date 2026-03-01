import React from 'react'
import WeatherIcon from './WeatherIcon.jsx'
import {
  celsiusToFahrenheit,
  metersPerSecondToMph,
  pascalsToInHg,
  parseWindDirection,
  getWeatherIcon,
} from '../utils/nws.js'

function StatCard({ label, value, unit, icon }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.07)',
      borderRadius: 16,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      border: '1px solid rgba(255,255,255,0.08)',
      flex: '1 1 120px',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon}
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color: 'white' }}>
        {value != null ? value : '—'}
        {value != null && unit && <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginLeft: 3 }}>{unit}</span>}
      </div>
    </div>
  )
}

export default function CurrentConditions({ observation, daily, locationName, alerts }) {
  const period = daily?.[0]
  const obs = observation

  // Temperature: prefer observation, fall back to forecast
  let tempF = null
  if (obs?.temperature?.value != null) {
    tempF = celsiusToFahrenheit(obs.temperature.value)
  } else if (period?.temperature != null) {
    tempF = period.temperatureUnit === 'F' ? period.temperature : celsiusToFahrenheit(period.temperature)
  }

  // Feels like
  let feelsLike = null
  if (obs?.heatIndex?.value != null) feelsLike = celsiusToFahrenheit(obs.heatIndex.value)
  else if (obs?.windChill?.value != null) feelsLike = celsiusToFahrenheit(obs.windChill.value)

  const humidity = obs?.relativeHumidity?.value != null ? Math.round(obs.relativeHumidity.value) : null
  const windSpeed = obs?.windSpeed?.value != null ? metersPerSecondToMph(obs.windSpeed.value) : null
  const windDir = obs?.windDirection?.value != null ? parseWindDirection(obs.windDirection.value) : null
  const visibility = obs?.visibility?.value != null ? (obs.visibility.value / 1609).toFixed(1) : null
  const pressure = obs?.barometricPressure?.value != null ? pascalsToInHg(obs.barometricPressure.value) : null
  const dewpoint = obs?.dewpoint?.value != null ? celsiusToFahrenheit(obs.dewpoint.value) : null

  const description = obs?.textDescription || period?.shortForecast || 'Unknown'
  const iconType = getWeatherIcon(obs?.icon || period?.icon, period?.isDaytime !== false)

  // High/Low from today's periods
  const todayPeriods = daily?.slice(0, 2) || []
  const dayPeriod = todayPeriods.find(p => p.isDaytime)
  const nightPeriod = todayPeriods.find(p => !p.isDaytime)
  const high = dayPeriod?.temperature
  const low = nightPeriod?.temperature

  return (
    <div>
      {/* Alerts */}
      {alerts?.length > 0 && (
        <div style={{
          background: 'rgba(255, 140, 66, 0.15)',
          border: '1px solid rgba(255, 140, 66, 0.4)',
          borderRadius: 14,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff8c42" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            {alerts.slice(0, 2).map((a, i) => (
              <div key={i} style={{ color: '#ff8c42', fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>
                {a.properties?.headline || a.properties?.event || 'Weather Alert'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main hero */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 4, fontWeight: 500 }}>
            {locationName || 'Loading...'}
          </div>
          <div style={{ fontSize: 80, fontWeight: 200, lineHeight: 1, color: 'white', letterSpacing: -2 }}>
            {tempF != null ? `${tempF}°` : '—'}
          </div>
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: 400 }}>
            {description}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            {high != null && <span>H: {high}°</span>}
            {low != null && <span>L: {low}°</span>}
            {feelsLike != null && <span>Feels like {feelsLike}°</span>}
          </div>
        </div>
        <WeatherIcon type={iconType} size={120} />
      </div>

      {/* Stats grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <StatCard
          label="Humidity"
          value={humidity}
          unit="%"
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>}
        />
        <StatCard
          label="Wind"
          value={windSpeed != null ? `${windDir || ''} ${windSpeed}` : null}
          unit="mph"
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" /></svg>}
        />
        <StatCard
          label="Visibility"
          value={visibility}
          unit="mi"
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
        />
        <StatCard
          label="Pressure"
          value={pressure}
          unit="inHg"
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
        />
        <StatCard
          label="Dew Point"
          value={dewpoint}
          unit="°F"
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>}
        />
        <StatCard
          label="UV Index"
          value={period?.isDaytime ? 'Moderate' : 'None'}
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></svg>}
        />
      </div>
    </div>
  )
}
