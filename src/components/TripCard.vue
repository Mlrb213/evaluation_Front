<script setup lang="ts">
import type { Trip, WeatherData } from '../types'

const props = defineProps<{
  trip: Trip
  weather: WeatherData | null
}>()

const emit = defineEmits<{
  (event: 'delete', value: string): void
}>()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <article class="trip-card">
    <div class="trip-head">
      <div>
        <p class="trip-city">{{ props.trip.cityName }}</p>
        <p class="trip-country">{{ props.trip.country }}</p>
      </div>
      <button type="button" class="delete-btn" @click="emit('delete', props.trip.id ?? '')">
        Supprimer
      </button>
    </div>

    <div class="trip-meta">
      <span>Départ : {{ formatDate(props.trip.startDate) }}</span>
      <span v-if="props.weather">Température : {{ props.weather.temperature }}°C</span>
    </div>

    <p v-if="props.trip.notes" class="trip-notes">{{ props.trip.notes }}</p>
  </article>
</template>
