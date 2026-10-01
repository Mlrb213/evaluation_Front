import type { GeoCity, WeatherData } from '../types'

const WEATHER_CACHE_PREFIX = 'weather-travel-weather:'
const GEO_SEARCH_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'

class WeatherService {
  async searchCities(query: string): Promise<GeoCity[]> {
    const value = query.trim()
    if (!value) return []

    const response = await fetch(
      `${GEO_SEARCH_URL}?name=${encodeURIComponent(value)}&count=5&language=fr`,
    )

    if (!response.ok) {
      throw new Error('Impossible de charger les villes')
    }

    const data = await response.json()
    return (data.results ?? []).map((city: any) => ({
      id: Number(city.id),
      name: city.name,
      latitude: Number(city.latitude),
      longitude: Number(city.longitude),
      country: city.country,
      country_code: city.country_code,
    }))
  }

  async getWeather(lat: number, lng: number): Promise<WeatherData> {
    const cacheKey = `${WEATHER_CACHE_PREFIX}${lat}:${lng}`

    const cached = this.getCachedWeather(lat, lng)
    if (cached) {
      return cached
    }

    const response = await fetch(
      `${WEATHER_URL}?latitude=${lat}&longitude=${lng}&current_weather=true&timezone=auto`,
    )

    if (!response.ok) {
      throw new Error('Impossible de récupérer la météo')
    }

    const data = await response.json()
    const weatherData: WeatherData = {
      temperature: Number(data.current_weather?.temperature ?? 0),
      windSpeed: Number(data.current_weather?.windspeed ?? 0),
      weatherCode: Number(data.current_weather?.weathercode ?? 0),
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(cacheKey, JSON.stringify(weatherData))
    return weatherData
  }

  getCachedWeather(lat: number, lng: number): WeatherData | null {
    const cacheKey = `${WEATHER_CACHE_PREFIX}${lat}:${lng}`
    const raw = localStorage.getItem(cacheKey)

    if (!raw) {
      return null
    }

    try {
      return JSON.parse(raw) as WeatherData
    } catch {
      return null
    }
  }
}

export const weatherService = new WeatherService()
