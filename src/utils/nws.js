const NWS_BASE = 'https://api.weather.gov'
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

const nwsHeaders = {
  'User-Agent': 'ClaudeWeatherApp/1.0 (weather-app@example.com)',
  'Accept': 'application/geo+json',
}

export async function geocodeLocation(query) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: 5,
    countrycodes: 'us',
    addressdetails: 1,
  })
  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: { 'Accept-Language': 'en-US,en' },
  })
  if (!res.ok) throw new Error('Geocoding failed')
  const data = await res.json()
  return data.map(r => ({
    name: formatLocationName(r),
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    displayName: r.display_name,
  }))
}

function formatLocationName(result) {
  const a = result.address || {}
  const city = a.city || a.town || a.village || a.hamlet || a.county || ''
  const state = a.state || ''
  if (city && state) return `${city}, ${state}`
  if (city) return city
  return result.display_name.split(',').slice(0, 2).join(',').trim()
}

export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({ lat, lon, format: 'json', addressdetails: 1 })
  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: { 'Accept-Language': 'en-US,en' },
  })
  if (!res.ok) throw new Error('Reverse geocoding failed')
  const data = await res.json()
  const a = data.address || {}
  const city = a.city || a.town || a.village || a.hamlet || a.county || ''
  const state = a.state || ''
  return city && state ? `${city}, ${state}` : data.display_name.split(',').slice(0, 2).join(',').trim()
}

export async function getNWSPoint(lat, lon) {
  const res = await fetch(`${NWS_BASE}/points/${lat.toFixed(4)},${lon.toFixed(4)}`, {
    headers: nwsHeaders,
  })
  if (!res.ok) throw new Error(`NWS points API error: ${res.status}`)
  const data = await res.json()
  return data.properties
}

export async function getForecast(forecastUrl) {
  const res = await fetch(forecastUrl, { headers: nwsHeaders })
  if (!res.ok) throw new Error(`NWS forecast error: ${res.status}`)
  const data = await res.json()
  return data.properties.periods
}

export async function getHourlyForecast(hourlyUrl) {
  const res = await fetch(hourlyUrl, { headers: nwsHeaders })
  if (!res.ok) throw new Error(`NWS hourly error: ${res.status}`)
  const data = await res.json()
  return data.properties.periods
}

export async function getCurrentObservation(stationsUrl) {
  const stRes = await fetch(stationsUrl, { headers: nwsHeaders })
  if (!stRes.ok) return null
  const stData = await stRes.json()
  const stations = stData.features || []
  if (!stations.length) return null

  for (const station of stations.slice(0, 3)) {
    const stationId = station.properties?.stationIdentifier
    if (!stationId) continue
    try {
      const obsRes = await fetch(`${NWS_BASE}/stations/${stationId}/observations/latest`, {
        headers: nwsHeaders,
      })
      if (!obsRes.ok) continue
      const obsData = await obsRes.json()
      return obsData.properties
    } catch {
      continue
    }
  }
  return null
}

export async function getAlerts(lat, lon) {
  const res = await fetch(`${NWS_BASE}/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`, {
    headers: nwsHeaders,
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.features || []
}

export function celsiusToFahrenheit(c) {
  if (c == null) return null
  return Math.round(c * 9 / 5 + 32)
}

export function metersPerSecondToMph(mps) {
  if (mps == null) return null
  return Math.round(mps * 2.237)
}

export function metersToFeet(m) {
  if (m == null) return null
  return Math.round(m * 3.281)
}

export function pascalsToInHg(pa) {
  if (pa == null) return null
  return (pa / 3386.39).toFixed(2)
}

export function parseWindDirection(degrees) {
  if (degrees == null) return '—'
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(degrees / 22.5) % 16]
}

export function getWeatherIcon(iconUrl, isDaytime = true) {
  if (!iconUrl) return 'cloudy'
  const url = iconUrl.toLowerCase()

  if (url.includes('tsra') || url.includes('thunder')) return 'thunderstorm'
  if (url.includes('tornado')) return 'tornado'
  if (url.includes('hurr') || url.includes('tropical')) return 'hurricane'
  if (url.includes('blizzard') || url.includes('blizzard')) return 'blizzard'
  if (url.includes('snow') || url.includes('blizzard') || url.includes('flurries')) return 'snow'
  if (url.includes('sleet') || url.includes('freezing') || url.includes('ice')) return 'sleet'
  if (url.includes('rain') || url.includes('shower')) return isDaytime ? 'rain_day' : 'rain_night'
  if (url.includes('drizzle')) return isDaytime ? 'rain_day' : 'rain_night'
  if (url.includes('fog') || url.includes('haze') || url.includes('smoke') || url.includes('dust')) return 'fog'
  if (url.includes('wind')) return 'windy'
  if (url.includes('bkn') || url.includes('ovc') || url.includes('overcast')) return 'cloudy'
  if (url.includes('sct') || url.includes('few')) return isDaytime ? 'partly_cloudy_day' : 'partly_cloudy_night'
  if (url.includes('skc') || url.includes('clear') || url.includes('sunny')) return isDaytime ? 'sunny' : 'clear_night'
  return isDaytime ? 'partly_cloudy_day' : 'partly_cloudy_night'
}
