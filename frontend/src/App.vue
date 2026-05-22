<template>
  <nav>
    <span class="nav-brand">⚽ WinProno</span>

    <template v-if="auth.isLoggedIn">
      <router-link to="/">Accueil</router-link>
      <router-link to="/predictions">Pronostics</router-link>
      <router-link to="/livescore">Livescore</router-link>
      <router-link to="/results">Résultats</router-link>
      <router-link to="/news">Actus</router-link>
      <span class="nav-user">{{ auth.user?.username }}</span>
      <button class="btn-logout" @click="handleLogout">Déconnexion</button>
      <router-link v-if="auth.user?.role === 'admin'" to="/admin">⚙️ Admin</router-link>
    </template>

    <template v-else>
      <router-link to="/">Accueil</router-link>
      <router-link to="/login">Connexion</router-link>
      <router-link to="/register" class="btn btn-primary" style="padding: 0.4rem 1rem; font-size:0.85rem">
        Essayer gratuitement
      </router-link>
    </template>
  </nav>

  <router-view />
</template>

<script setup>
import { useAuthStore } from './stores/auth.js'
import { useRouter } from 'vue-router'

const auth   = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>
