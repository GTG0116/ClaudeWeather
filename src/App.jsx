import React, { useState, useEffect } from 'react'
import { useWeather } from './hooks/useWeather.js'
import LocationSearch from './components/LocationSearch.jsx'
import CurrentConditions from './components/CurrentConditions.jsx'
import HourlyForecast from './components/HourlyForecast.jsx'
import DailyForecast from './components/DailyForecast.jsx'
import RadarMap from './components/RadarMap.jsx'
import SunriseSunset from './components/SunriseSunset.jsx'
import WeatherIcon from './components/WeatherIcon.jsx'
import { getWeatherIcon } from './utils/nws.js'

const TABS = [
  { id: 'current', label: 'Now', icon: '◉' },
  { id: 'hourly', label: 'Hourly', icon: '⏱' },
  { id: 'daily', label: '10-Day', icon: '📅' },
  { id: 'radar', label: 'Radar', icon: '🌐' },
]

function getBgGradient(iconType, isDaytime) {
  if (!isDaytime) return 'linear-gradient(160deg, #0a0f1e 0%, #0d1530 40%, #121a3a 100%)'
  if (iconType === 'sunny') return 'linear-gradient(160deg, #0a1628 0%, #1a3a6a 40%, #1e4a8a 100%)'
  if (iconType?.includes('rain') || iconType === 'thunderstorm') return 'linear-gradient(160deg, #0a0f20 0%, #101828 40%, #162035 100%)'
  if (iconType === 'snow' || iconType === 'sleet') return 'linear-gradient(160deg, #0f1a2e 0%, #162040 40%, #1a2a50 100%)'
  if (iconType?.includes('cloudy')) return 'linear-gradient(160deg, #0a1020 0%, #121a30 40%, #182035 100%)'
  return 'linear-gradient(160deg, #0a0f1e 0%, #0d1530 40%, #121a3a 100%)'
}

export default function App() {
  const [location, setLocation] = useState(null)
  const [activeTab, setActiveTab] = useState('current')
  const weather = useWeather(location)

  // Auto-detect location on first load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setLocation({ lat: 40.7128, lon: -74.0060 }) // Default: NYC
      )
    } else {
      setLocation({ lat: 40.7128, lon: -74.0060 })
    }
  }, [])

  const firstPeriod = weather.daily?.[0]
  const iconType = weather.observation
    ? null
    : firstPeriod?.shortForecast?.toLowerCase().includes('sun') ? 'sunny' : 'cloudy'
  const isDaytime = firstPeriod?.isDaytime !== false
  const bg = getBgGradient(iconType, isDaytime)

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      transition: 'background 1.5s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed',
        top: -200,
        right: -100,
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74,158,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        bottom: -100,
        left: -100,
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* App container */}
      <div style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '0 16px 100px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0 16px',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" fill="#FFD166" />
              <g stroke="#FFD166" strokeWidth="1.8" strokeLinecap="round" opacity="0.7">
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </g>
            </svg>
            <span style={{ fontSize: 17, fontWeight: 700, color: 'white', letterSpacing: -0.5 }}>Weather</span>
          </div>
          <LocationSearch onSelect={setLocation} />
          <button
            onClick={weather.refresh}
            disabled={weather.loading}
            title="Refresh"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              padding: 8,
              color: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              opacity: weather.loading ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{ animation: weather.loading ? 'spin 1s linear infinite' : 'none' }}>
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </header>

        {/* Error state */}
        {weather.error && !weather.loading && (
          <div style={{
            background: 'rgba(255, 80, 80, 0.12)',
            border: '1px solid rgba(255, 80, 80, 0.3)',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 20,
            color: '#ff8080',
            fontSize: 14,
          }}>
            {weather.error}
          </div>
        )}

        {/* Loading skeleton */}
        {weather.loading && !weather.daily?.length && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[180, 120, 200].map((h, i) => (
              <div key={i} style={{
                height: h, borderRadius: 20,
                background: 'rgba(255,255,255,0.05)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
          </div>
        )}

        {/* Main content */}
        {weather.daily?.length > 0 && (
          <>
            {/* Tab nav */}
            <nav style={{
              display: 'flex',
              gap: 4,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: 4,
              marginBottom: 20,
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 500,
                    color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
                    background: activeTab === tab.id ? 'rgba(74,158,255,0.2)' : 'none',
                    border: activeTab === tab.id ? '1px solid rgba(74,158,255,0.3)' : '1px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Tab content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeTab === 'current' && (
                <>
                  <div style={{
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '24px 22px',
                  }}>
                    <CurrentConditions
                      observation={weather.observation}
                      daily={weather.daily}
                      locationName={weather.locationName}
                      alerts={weather.alerts}
                    />
                  </div>
                  <HourlyForecast hourly={weather.hourly} />
                  <DailyForecast daily={weather.daily} />
                  <SunriseSunset lat={location?.lat} lon={location?.lon} />
                </>
              )}

              {activeTab === 'hourly' && (
                <div style={{
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '24px 22px',
                }}>
                  <HourlyDetailView hourly={weather.hourly} />
                </div>
              )}

              {activeTab === 'daily' && (
                <DailyForecast daily={weather.daily} />
              )}

              {activeTab === 'radar' && (
                <RadarMap lat={location?.lat} lon={location?.lon} />
              )}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
              Data: NOAA/NWS · Radar: RainViewer · Maps: OpenStreetMap
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function HourlyDetailView({ hourly }) {
  if (!hourly?.length) return null
  const periods = hourly.slice(0, 48)

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>48-Hour Forecast</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {periods.map((p, i) => {
          const d = new Date(p.startTime)
          const isNewDay = i === 0 || new Date(periods[i - 1].startTime).getDate() !== d.getDate()
          const pop = p.probabilityOfPrecipitation?.value
          return (
            <div key={i}>
              {isNewDay && (
                <div style={{
                  fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
                  padding: '12px 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em',
                  borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  marginTop: i > 0 ? 4 : 0,
                }}>
                  {d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ width: 52, fontSize: 13, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
                  {d.getHours() === 0 ? '12 AM' : d.getHours() === 12 ? '12 PM' : d.getHours() < 12 ? `${d.getHours()} AM` : `${d.getHours() - 12} PM`}
                </span>
                <WeatherIcon type={getWeatherIcon(p.icon, p.isDaytime)} size={26} />
                <span style={{ fontSize: 18, fontWeight: 600, color: 'white', width: 40, flexShrink: 0 }}>
                  {p.temperature}°
                </span>
                <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.55)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.shortForecast}
                </span>
                <span style={{ fontSize: 12, color: '#4a9eff', fontWeight: 500, flexShrink: 0 }}>
                  {pop ?? 0}%
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                  {p.windSpeed}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
