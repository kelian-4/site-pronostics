import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API = 'http://localhost:3000'

export const useEventsStore = defineStore('events', () => {
  const events  = ref([])
  const loading = ref(false)
  const error   = ref(null)

  async function fetchEvents() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await axios.get(`${API}/events`)
      events.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { events, loading, error, fetchEvents }
})
