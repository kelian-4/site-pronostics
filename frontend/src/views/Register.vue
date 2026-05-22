<template>
  <div class="form-card">
    <h1>Inscription</h1>
    <p class="form-subtitle">Commencez gratuitement, sans engagement</p>

    <div class="form-group">
      <label>Nom d'utilisateur</label>
      <input v-model="form.username" type="text" placeholder="Votre pseudo" />
    </div>
    <div class="form-group">
      <label>Email</label>
      <input v-model="form.email" type="email" placeholder="vous@exemple.com" />
    </div>
    <div class="form-group">
      <label>Mot de passe</label>
      <input v-model="form.password" type="password" placeholder="••••••••" />
    </div>

    <p v-if="error" class="form-error">{{ error }}</p>

    <button class="btn btn-primary" style="width:100%" :disabled="loading" @click="handleSubmit">
      {{ loading ? 'Création...' : 'Créer mon compte' }}
    </button>

    <p class="form-footer">
      Déjà un compte ? <router-link to="/login">Se connecter</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import axios from 'axios'

const router  = useRouter()
const auth    = useAuthStore()
const form    = ref({ username: '', email: '', password: '' })
const error   = ref(null)
const loading = ref(false)

async function handleSubmit() {
  error.value = null
  loading.value = true
  try {
    const { data } = await axios.post('http://localhost:3000/auth/register', form.value)
    auth.setAuth(data.token, data.user)
    router.push('/predictions')
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur serveur'
  } finally {
    loading.value = false
  }
}
</script>
