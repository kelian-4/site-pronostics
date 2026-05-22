<template>
  <main>
    <h1>Historique des résultats</h1>

    <div class="stats-bar" style="margin-bottom:2rem" v-if="stats">
      <div class="stat-card">
        <span class="stat-value">{{ stats.win_rate ?? 0 }}%</span>
        <span class="stat-label">Réussite globale</span>
      </div>
      <div class="stat-card">
        <span class="stat-value" style="color:var(--accent)">{{ stats.won ?? 0 }}</span>
        <span class="stat-label">Gagnés</span>
      </div>
      <div class="stat-card">
        <span class="stat-value" style="color:var(--danger)">{{ stats.lost ?? 0 }}</span>
        <span class="stat-label">Perdus</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.avg_odds ?? '—' }}</span>
        <span class="stat-label">Cote moyenne</span>
      </div>
    </div>

    <div v-if="finished.length === 0" class="empty">
      Aucun résultat disponible pour le moment.
    </div>

    <div v-else class="card" style="padding:0">
      <table>
        <thead>
          <tr>
            <th>Match</th>
            <th>Pronostic</th>
            <th>Marché</th>
            <th>Cote</th>
            <th>Confiance</th>
            <th>Résultat</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pred in finished" :key="pred.id">
            <td>
              <div style="font-weight:600">{{ pred.home_team }} vs {{ pred.away_team }}</div>
              <div style="font-size:0.8rem;color:var(--text-muted)">{{ pred.competition_name }}</div>
            </td>
            <td style="font-weight:600;color:var(--accent)">{{ pred.tip }}</td>
            <td style="color:var(--text-muted)">{{ pred.market || '1X2' }}</td>
            <td style="font-weight:700">{{ pred.odds }}</td>
            <td>{{ pred.confidence }}/10</td>
            <td>
              <span class="badge" :class="`badge-${pred.result.toLowerCase()}`">
                {{ pred.result === 'WON' ? '✓ Gagné' : '✗ Perdu' }}
              </span>
            </td>
            <td style="color:var(--text-muted)">{{ formatDate(pred.match_date) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePredictionsStore } from '../stores/predictions.js'
import { storeToRefs } from 'pinia'

const store = usePredictionsStore()
const { predictions, stats } = storeToRefs(store)

const finished = computed(() =>
  predictions.value.filter(p => p.result !== 'PENDING')
)

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short'
  })
}

onMounted(() => {
  store.fetchPredictions()
  store.fetchStats()
})
</script>
