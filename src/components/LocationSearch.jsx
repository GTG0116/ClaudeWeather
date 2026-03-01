import React, { useState, useRef, useEffect } from 'react'
import { geocodeLocation } from '../utils/nws.js'

export default function LocationSearch({ onSelect, currentLocation }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInput(e) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(timerRef.current)
    if (val.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const locs = await geocodeLocation(val.trim())
        setResults(locs)
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }

  function handleSelect(loc) {
    setQuery(loc.name)
    setOpen(false)
    setResults([])
    onSelect({ lat: loc.lat, lon: loc.lon, name: loc.name })
  }

  function handleGPS() {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsLoading(false)
        onSelect({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setQuery('')
      },
      () => setGpsLoading(false),
      { timeout: 10000 }
    )
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 50,
        border: '1px solid rgba(255,255,255,0.2)',
        padding: '10px 16px',
        gap: 10,
        backdropFilter: 'blur(10px)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={handleInput}
          placeholder="Search city..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: 15,
            fontWeight: 400,
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {loading && (
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            animation: 'spin 0.7s linear infinite',
          }} />
        )}
        <button
          onClick={handleGPS}
          title="Use my location"
          style={{
            background: 'none',
            color: gpsLoading ? '#4a9eff' : 'rgba(255,255,255,0.6)',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {gpsLoading ? (
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              border: '2px solid rgba(74,158,255,0.3)',
              borderTopColor: '#4a9eff',
              animation: 'spin 0.7s linear infinite',
            }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
            </svg>
          )}
        </button>
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: 'rgba(15, 25, 50, 0.97)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 16,
          overflow: 'hidden',
          zIndex: 1000,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        }}>
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '12px 16px',
                background: 'none',
                color: 'white',
                textAlign: 'left',
                fontSize: 14,
                borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{r.name}</span>
            </button>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
