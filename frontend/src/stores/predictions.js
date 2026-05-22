import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API = 'http://localhost:3000'

export const usePredictionsStore = defineStore('predictions', () => {
  const predictions = ref([])
  const stats       = ref(null)
  const loading     = ref(false)
  const error       = ref(null)

  async function fetchPredictions() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await axios.get(`${API}/predictions`)
      predictions.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    try {
      const { data } = await axios.get(`${API}/predictions/stats`)
      stats.value = data
    } catch (e) {
      console.error(e)
    }
  }

  return { predictions, stats, loading, error, fetchPredictions, fetchStats }
})
