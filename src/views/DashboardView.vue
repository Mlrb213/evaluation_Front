<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { useRouter } from 'vue-router'
import AddTrip from '../components/AddTrip.vue'
import TripCard from '../components/TripCard.vue'
import { auth } from '../services/firebase'
import { tripService } from '../services/tripService'
import { weatherService } from '../services/weatherService'
import type { GeoCity, Trip, TripDraft, WeatherData } from '../types'

const router = useRouter()
const user = ref<User | null>(auth?.currentUser ?? null)
const trips = ref<Trip[]>([])
const searchResults = ref<GeoCity[]>([])
const loading = ref(false)
const isSubmitting = ref(false)
const weatherMap = ref<Record<string, WeatherData>>({})

async function fetchTrips(userId: string) {
  trips.value = await tripService.getUserTrips(userId)

  for (const trip of trips.value) {
    const key = trip.id ?? `${trip.cityName}-${trip.startDate}`
    const cachedWeather = weatherService.getCachedWeather(trip.latitude, trip.longitude)

    if (cachedWeather) {
      weatherMap.value[key] = cachedWeather
      continue
    }

    try {
      weatherMap.value[key] = await weatherService.getWeather(trip.latitude, trip.longitude)
    } catch {
      weatherMap.value[key] = {
        temperature: 0,
        windSpeed: 0,
        weatherCode: 0,
        updatedAt: new Date().toISOString(),
      }
    }
  }
}

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

async function addTrip(trip: TripDraft) {
  if (!user.value) {
    await router.push({ name: 'login' })
    return
  }

  isSubmitting.value = true

  try {
    const createdTrip = await tripService.addTrip(user.value.uid, trip)
    trips.value = [createdTrip, ...trips.value]

    const key = createdTrip.id ?? `${createdTrip.cityName}-${createdTrip.startDate}`
    weatherMap.value[key] = await weatherService.getWeather(
      createdTrip.latitude,
      createdTrip.longitude,
    )
  } finally {
    isSubmitting.value = false
  }
}

async function deleteTrip(tripId: string) {
  if (!user.value) return

  await tripService.deleteTrip(user.value.uid, tripId)
  trips.value = trips.value.filter((trip) => trip.id !== tripId)
}

onMounted(() => {
  if (!auth) return

  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    if (currentUser) {
      fetchTrips(currentUser.uid)
    }
  })
})
</script>

<template>
  <main class="page dashboard-page">
    <section class="dashboard-header">
      <div>
        <p class="eyebrow">Espace protégé</p>
        <h1>Dashboard Travel</h1>
      </div>
      <span class="user-badge">{{ user?.email ?? 'Utilisateur' }}</span>
    </section>

    <div class="dashboard-grid">
      <AddTrip
        :search-results="searchResults"
        :is-submitting="isSubmitting"
        @search="searchCities"
        @add-trip="addTrip"
      />

      <section class="panel">
        <h2>Mes voyages</h2>

        <div v-if="trips.length" class="trip-list">
          <TripCard
            v-for="trip in trips"
            :key="trip.id ?? `${trip.cityName}-${trip.startDate}`"
            :trip="trip"
            :weather="weatherMap[trip.id ?? `${trip.cityName}-${trip.startDate}`] ?? null"
            @delete="deleteTrip"
          />
        </div>

        <p v-else class="empty-state">Aucun voyage enregistré pour le moment.</p>
      </section>
    </div>
  </main>
</template>
