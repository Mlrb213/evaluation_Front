<script setup lang="ts">
import { ref } from 'vue'
import type { GeoCity, WeatherData } from '../types'

const props = defineProps<{
  searchResults: GeoCity[]
  loading: boolean
  selectedCity: GeoCity | null
  selectedWeather: WeatherData | null
}>()

const emit = defineEmits<{
  (event: 'search', value: string): void
  (event: 'selectCity', value: GeoCity): void
}>()

const query = ref('')

function submitSearch() {
  emit('search', query.value)
}
</script>

<template>
  <section class="panel">
    <h2>Recherche météo</h2>

    <form class="search-form" @submit.prevent="submitSearch">
      <input v-model="query" type="text" placeholder="Rechercher une ville" />
      <button type="submit" :disabled="props.loading">
        {{ props.loading ? 'Chargement...' : 'Chercher' }}
      </button>
    </form>

    <div v-if="props.searchResults.length" class="city-list">
      <button
        v-for="city in props.searchResults"
        :key="city.id"
        class="city-item"
        type="button"
        @click="emit('selectCity', city)"
      >
        <span class="city-name">{{ city.name }}</span>
        <span class="city-country">{{ city.country }}</span>
      </button>
    </div>

    <div v-else-if="!props.loading && query" class="empty-state">
      Aucune ville trouvée.
    </div>

    <div v-if="props.selectedCity && props.selectedWeather" class="weather-card">
      <p class="label">Météo actuelle</p>
      <h3>{{ props.selectedCity.name }}</h3>
      <div class="weather-main">
        <strong>{{ props.selectedWeather.temperature }}°C</strong>
        <span>{{ props.selectedWeather.windSpeed }} km/h</span>
      </div>
      <small>Mis à jour : {{ new Date(props.selectedWeather.updatedAt).toLocaleString() }}</small>
    </div>
  </section>
</template>
