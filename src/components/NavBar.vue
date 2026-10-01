<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, onAuthChange, signOut } from '../services/firebase'

const router = useRouter()
const isAuthenticated = ref(Boolean(auth?.currentUser))
let unsubscribe: (() => void) | undefined

onMounted(() => { 
    unsubscribe = onAuthChange((user) => {
        isAuthenticated.value = Boolean(user)

    })
})
 

onBeforeUnmount(() => {
    unsubscribe?.()
})


async function logout() {
    if (!auth) return 

    await signOut(auth)
    await router.push({name: 'home'})
}
</script>

<template>
  <nav class="navbar">
    <div class="brand-block">
      <div class="nav-brand">Weather Travel</div>
      <div class="brand-note">Design fait à l'ia </div>
    </div>
    <div class="nav-links">
      <router-link to="/">Accueil</router-link>
      <router-link v-if="isAuthenticated" to="/dashboard">Dashboard</router-link>
      <router-link v-else to="/login">Connexion</router-link>
      <button v-if="isAuthenticated" type="button" class="link-button" @click="logout">
        Se déconnecter
      </button>
    </div>
  </nav>
</template>
