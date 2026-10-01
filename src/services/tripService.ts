import { get, push, ref, remove, set } from 'firebase/database'
import { database } from './firebase'
import type { Trip, TripDraft } from '../types'

const LOCAL_STORAGE_KEY = 'weather-travel-trips'

class TripService {
  async getUserTrips(userId: string): Promise<Trip[]> {
    if (!database) {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}:${userId}`)
      return raw ? (JSON.parse(raw) as Trip[]) : []
    }

    const tripsRef = ref(database, `users/${userId}/trips`)
    const snapshot = await get(tripsRef)

    if (!snapshot.exists()) {
      return []
    }

    const values = snapshot.val() as Record<string, Trip>
    return Object.entries(values).map(([id, trip]) => ({ ...trip, id }))
  }

  async addTrip(userId: string, trip: TripDraft): Promise<Trip> {
    const newTrip: Trip = {
      ...trip,
      createdAt: new Date().toISOString(),
    }

    if (!database) {
      const stored = JSON.parse(localStorage.getItem(`${LOCAL_STORAGE_KEY}:${userId}`) ?? '[]') as Trip[]
      const savedTrip = { ...newTrip, id: crypto.randomUUID() }
      localStorage.setItem(
        `${LOCAL_STORAGE_KEY}:${userId}`,
        JSON.stringify([savedTrip, ...stored]),
      )
      return savedTrip
    }

    const tripRef = ref(database, `users/${userId}/trips`)
    const itemRef = push(tripRef)
    await set(itemRef, newTrip)

    return {
      ...newTrip,
      id: itemRef.key ?? undefined,
    }
  }

  async deleteTrip(userId: string, tripId: string): Promise<void> {
    if (!database) {
      const stored = JSON.parse(localStorage.getItem(`${LOCAL_STORAGE_KEY}:${userId}`) ?? '[]') as Trip[]
      localStorage.setItem(
        `${LOCAL_STORAGE_KEY}:${userId}`,
        JSON.stringify(stored.filter((trip) => trip.id !== tripId)),
      )
      return
    }

    await remove(ref(database, `users/${userId}/trips/${tripId}`))
  }
}

export const tripService = new TripService()
