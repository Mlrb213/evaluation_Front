<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CitySearch from '../components/CitySearch.vue'
import { weatherService } from '../services/weatherService'
import type { GeoCity, WeatherData } from '../types'

const searchResults = ref<GeoCity[]>([])
const selectedCity = ref<GeoCity | null>(null)
const selectedWeather = ref<WeatherData | null>(null)
const loading = ref(false)



async function searchCities(query: string) {
    if (!query.trim()) {
        searchResults.value = []
        return
    }

    loading.value = true 

    try {
        searchResults.value = await weatherService.searchCities(query)
    } finally {
        loading.value = false
    }
} 

async function selectCity(city: GeoCity) {
  selectedCity.value = city
  selectedWeather.value = await weatherService.getWeather(city.latitude, city.longitude)
}

onMounted(async () => {
  await searchCities('Paris')
  if (searchResults.value[0]) {
    await selectCity(searchResults.value[0])
  }
})
</script>

<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Weather Travel App</p>
      <h1>Planifiez vos voyages avec la météo en temps réel</h1>
    </section>

    <CitySearch
      :search-results="searchResults"
      :loading="loading"
      :selected-city="selectedCity"
      :selected-weather="selectedWeather"
      @search="searchCities"
      @select-city="selectCity"
    />
  </main>
</template>
