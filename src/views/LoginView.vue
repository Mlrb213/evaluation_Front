<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, signInWithEmailAndPassword } from '../services/firebase'

const router = useRouter()
const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function login() {
  if (!auth) {
    error.value = 'La configuration Firebase est absente. Ajoutez les variables d’environnement.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await signInWithEmailAndPassword(auth, form.email, form.password)
    await router.push({ name: 'dashboard' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur lors de la connexion.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="page auth-page">
    <section class="panel auth-card">
      <h1>Connexion</h1>

      <form class="auth-form" @submit.prevent="login">
        <label>
          Email
          <input v-model="form.email" type="email" required />
        </label>

        <label>
          Mot de passe
          <input v-model="form.password" type="password" required />
        </label>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>

      <p class="switch-link">
        Pas encore inscrit ?
        <router-link to="/register">Créer un compte</router-link>
      </p>
    </section>
  </main>
</template>
