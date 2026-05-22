import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth.js'

const API = 'http://localhost:3000'

export const useMatchesStore = defineStore('matches', () => {
  const matches = ref([])
  const live    = ref([])
  const loading = ref(false)
  const error   = ref(null)

  async function fetchMatches() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await axios.get(`${API}/matches`)
      matches.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchLive() {
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get(`${API}/matches/live`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    live.value = data
  } catch (e) {
    console.error(e)
  }
}

  return { matches, live, loading, error, fetchMatches, fetchLive }
})