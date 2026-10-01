<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { GeoCity, TripDraft } from '../types'

const props = defineProps<{
  searchResults: GeoCity[]
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  (event: 'search', value: string): void
  (event: 'addTrip', value: TripDraft): void
}>()

const query = ref('')

const form = reactive<TripDraft>({
  cityName: '',
  latitude: 0,
  longitude: 0,
  country: '',
  startDate: '',
  notes: '',
})

watch(
  () => props.searchResults,
  (results) => {
    if (results.length > 0 && !form.cityName) {
      const first = results[0]
      form.cityName = first.name
      form.latitude = first.latitude
      form.longitude = first.longitude
      form.country = first.country
    }
  },
  { immediate: true },
)

function chooseCity(city: GeoCity) {
  form.cityName = city.name
  form.latitude = city.latitude
  form.longitude = city.longitude
  form.country = city.country
}

function submitForm() {
  if (!form.cityName || !form.startDate) {
    return
  }

  emit('addTrip', { ...form })
  form.cityName = ''
  form.latitude = 0
  form.longitude = 0
  form.country = ''
  form.startDate = ''
  form.notes = ''
  query.value = ''
}
</script>

<template>
  <section class="panel">
    <h2>Ajouter un voyage</h2>

    <form class="trip-form" @submit.prevent="submitForm">
      <div class="field-group">
        <label>Recherche de ville</label>
        <input v-model="query" type="text" placeholder="Paris" @input="emit('search', query)" />
      </div>

      <div v-if="props.searchResults.length" class="city-list compact">
        <button
          v-for="city in props.searchResults"
          :key="city.id"
          class="city-item"
          type="button"
          @click="chooseCity(city)"
        >
          {{ city.name }} • {{ city.country }}
        </button>
      </div>

      <div class="field-group">
        <label>Ville sélectionnée</label>
        <input v-model="form.cityName" type="text" readonly />
      </div>

      <div class="field-group">
        <label>Date de départ</label>
        <input v-model="form.startDate" type="date" />
      </div>

      <div class="field-group">
        <label>Notes</label>
        <textarea v-model="form.notes" rows="3" placeholder="Décrivez votre voyage..."></textarea>
      </div>

      <button type="submit" class="primary" :disabled="props.isSubmitting || !form.cityName || !form.startDate">
        {{ props.isSubmitting ? 'Enregistrement...' : 'Ajouter le voyage' }}
      </button>
    </form>
  </section>
</template>
