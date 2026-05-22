<template>
  <main>
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
      <h1 style="margin:0">Livescore</h1>
      <span class="badge badge-live">LIVE</span>
      <span style="font-size:0.8rem;color:var(--text-muted);margin-left:auto">
        Actualisation auto toutes les 30s
      </span>
    </div>

    <p v-if="loading" class="loading">Chargement...</p>

    <div v-else-if="live.length === 0" class="empty">
      <div style="font-size:2rem;margin-bottom:1rem">⏰</div>
      <p>Aucun match en direct pour le moment.</p>
      <p style="font-size:0.85rem;margin-top:0.5rem">
        Les matchs en direct apparaîtront ici automatiquement.
      </p>
    </div>

    <div v-else>
      <div v-for="match in live" :key="match.api_id" class="match-card">
        <div class="match-card-header">
          <span style="font-size:0.8rem;color:var(--text-muted)">
            {{ match.competition }}
          </span>
          <div style="display:flex;gap:0.5rem;align-items:center">
            <span style="font-size:0.75rem;color:var(--text-muted)">
              {{ match.sport === 'Basketball' ? '🏀' : '⚽' }}
            </span>
            <span class="badge badge-live">{{ match.minute }}</span>
          </div>
        </div>
        <div class="teams-row">
          <div class="team">
            <img
              :src="match.home_logo"
              :alt="match.home_team"
              @error="e => e.target.style.display='none'"
            />
            <span class="team-name">{{ match.home_team }}</span>
          </div>
          <div style="text-align:center">
            <div style="font-size:2rem;font-weight:800">
              {{ match.home_score }} - {{ match.away_score }}
            </div>
          </div>
          <div class="team">
            <img
              :src="match.away_logo"
              :alt="match.away_team"
              @error="e => e.target.style.display='none'"
            />
            <span class="team-name">{{ match.away_team }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useMatchesStore } from '../stores/matches.js'
import { storeToRefs } from 'pinia'

const store          = useMatchesStore()
const { live, loading } = storeToRefs(store)

let interval

onMounted(() => {
  store.fetchLive()
  interval = setInterval(() => store.fetchLive(), 30000)
})

onUnmounted(() => clearInterval(interval))
</script>
