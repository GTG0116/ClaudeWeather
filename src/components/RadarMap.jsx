import React, { useEffect, useRef, useState } from 'react'

export default function RadarMap({ lat, lon }) {
  const mapRef = useRef(null)
  const leafletRef = useRef(null)
  const radarLayerRef = useRef(null)
  const [frames, setFrames] = useState([])
  const [frameIdx, setFrameIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [radarLoading, setRadarLoading] = useState(true)
  const intervalRef = useRef(null)

  // Initialize Leaflet map
  useEffect(() => {
    if (!lat || !lon || mapRef.current?._leaflet_id) return

    import('leaflet').then(L => {
      const map = L.default.map(mapRef.current, {
        center: [lat, lon],
        zoom: 7,
        zoomControl: true,
        attributionControl: true,
      })

      L.default.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map)

      // Location marker
      L.default.circleMarker([lat, lon], {
        radius: 6,
        color: '#4a9eff',
        fillColor: '#4a9eff',
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(map)

      leafletRef.current = { map, L: L.default }

      // Load radar frames
      loadRadar(map, L.default)
    })

    return () => {
      if (mapRef.current?._leaflet_id && leafletRef.current?.map) {
        leafletRef.current.map.remove()
        mapRef.current._leaflet_id = undefined
        leafletRef.current = null
      }
      clearInterval(intervalRef.current)
    }
  }, [lat, lon])

  async function loadRadar(map, L) {
    setRadarLoading(true)
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json')
      const data = await res.json()
      const radar = data.radar?.past || []
      const nowcast = data.radar?.nowcast || []
      const allFrames = [...radar, ...nowcast]
      if (!allFrames.length) return

      setFrames(allFrames)
      setFrameIdx(allFrames.length - 1)

      // Load the most recent frame
      showFrame(map, L, allFrames, allFrames.length - 1)
    } catch (e) {
      console.error('Radar load error:', e)
    } finally {
      setRadarLoading(false)
    }
  }

  function showFrame(map, L, frameList, idx) {
    if (!map || !L || !frameList?.length) return
    const frame = frameList[idx]
    if (!frame) return

    if (radarLayerRef.current) {
      map.removeLayer(radarLayerRef.current)
    }

    const layer = L.tileLayer(
      `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`,
      { opacity: 0.7, zIndex: 10 }
    )
    layer.addTo(map)
    radarLayerRef.current = layer
  }

  // Animate frames
  useEffect(() => {
    clearInterval(intervalRef.current)
    if (!playing || !frames.length || !leafletRef.current) return

    intervalRef.current = setInterval(() => {
      setFrameIdx(prev => {
        const next = (prev + 1) % frames.length
        const { map, L } = leafletRef.current
        showFrame(map, L, frames, next)
        return next
      })
    }, 600)

    return () => clearInterval(intervalRef.current)
  }, [playing, frames])

  function handleFrameChange(idx) {
    setFrameIdx(idx)
    if (leafletRef.current && frames.length) {
      const { map, L } = leafletRef.current
      showFrame(map, L, frames, idx)
    }
  }

  function formatFrameTime(frame) {
    if (!frame?.time) return ''
    return new Date(frame.time * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  if (!lat || !lon) return null

  return (
    <div style={{
      background: 'rgba(255,255,255,0.07)',
      borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '18px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Radar</span>
        </div>
        {frames.length > 0 && (
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            {formatFrameTime(frames[frameIdx])}
            {frameIdx >= (frames.filter(f => f.time <= Date.now() / 1000).length) && ' (forecast)'}
          </span>
        )}
      </div>

      {/* Map */}
      <div style={{ position: 'relative', height: 320 }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {radarLoading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10, 15, 30, 0.6)', pointerEvents: 'none',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '3px solid rgba(74,158,255,0.2)',
              borderTopColor: '#4a9eff',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}
      </div>

      {/* Playback controls */}
      {frames.length > 0 && (
        <div style={{ padding: '12px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="range"
            min={0}
            max={frames.length - 1}
            value={frameIdx}
            onChange={e => handleFrameChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#4a9eff', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => setPlaying(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(74,158,255,0.15)',
                border: '1px solid rgba(74,158,255,0.3)',
                borderRadius: 20,
                padding: '6px 14px',
                color: '#4a9eff',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {playing ? (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="#4a9eff"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg> Pause</>
              ) : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="#4a9eff"><polygon points="5 3 19 12 5 21 5 3" /></svg> Animate</>
              )}
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { label: 'Past', color: '#4a9eff' },
                { label: 'Nowcast', color: '#ffd166' },
              ].map(({ label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, opacity: 0.8 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
