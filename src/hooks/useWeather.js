import { useState, useEffect, useCallback } from 'react'
import {
  getNWSPoint,
  getForecast,
  getHourlyForecast,
  getCurrentObservation,
  getAlerts,
  reverseGeocode,
} from '../utils/nws.js'

export function useWeather(location) {
  const [state, setState] = useState({
    loading: false,
    error: null,
    locationName: null,
    point: null,
    observation: null,
    hourly: [],
    daily: [],
    alerts: [],
  })

  const load = useCallback(async (lat, lon) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const [point, locationName, alerts] = await Promise.all([
        getNWSPoint(lat, lon),
        reverseGeocode(lat, lon),
        getAlerts(lat, lon),
      ])

      const [daily, hourly, observation] = await Promise.all([
        getForecast(point.forecast),
        getHourlyForecast(point.forecastHourly),
        getCurrentObservation(point.observationStations),
      ])

      setState({
        loading: false,
        error: null,
        locationName,
        point,
        observation,
        hourly,
        daily,
        alerts,
      })
    } catch (err) {
      setState(s => ({
        ...s,
        loading: false,
        error: err.message || 'Failed to load weather data',
      }))
    }
  }, [])

  useEffect(() => {
    if (location?.lat != null && location?.lon != null) {
      load(location.lat, location.lon)
    }
  }, [location?.lat, location?.lon, load])

  const refresh = useCallback(() => {
    if (location?.lat != null && location?.lon != null) {
      load(location.lat, location.lon)
    }
  }, [location, load])

  return { ...state, refresh }
}
