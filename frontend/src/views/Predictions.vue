<template>
  <main>
    <div class="page-header">
      <h1>Pronostics du jour</h1>
      <div class="sport-filter">
        <button
          class="sport-btn"
          :class="{ active: filter === 'all' }"
          @click="filter = 'all'"
        >Tous</button>
        <button
          class="sport-btn"
          :class="{ active: filter === 'football' }"
          @click="filter = 'football'"
        >⚽ Football</button>
        <button
          class="sport-btn"
          :class="{ active: filter === 'basketball' }"
          @click="filter = 'basketball'"
        >🏀 Basketball</button>
      </div>
    </div>

    <p v-if="loading" class="loading">Chargement des pronostics...</p>
    <p v-else-if="error" class="empty">Erreur : {{ error }}</p>

    <div v-else-if="filtered.length === 0" class="empty">
      Aucun pronostic disponible pour le moment.
    </div>

    <div v-else>
      <div
        v-for="pred in filtered"
        :key="pred.id"
        class="match-card"
        @click="router.push(`/matches/${pred.match_id}`)"
      >
        <!-- Header compétition -->
        <div class="match-card-header">
          <div class="competition-info">
            <img :src="pred.competition_logo" :alt="pred.competition_name" />
            <span>{{ pred.competition_name }}</span>
            <span>·</span>
            <span>{{ formatDate(pred.match_date) }}</span>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center">
            <span v-if="pred.is_premium" class="badge badge-premium">Premium</span>
            <span class="badge" :class="`badge-${pred.result.toLowerCase()}`">
              {{ resultLabel(pred.result) }}
            </span>
          </div>
        </div>

        <!-- Équipes -->
        <div class="teams-row">
          <div class="team">
            <img :src="pred.home_logo" :alt="pred.home_team" />
            <span class="team-name">{{ pred.home_team }}</span>
          </div>
          <span class="match-vs">VS</span>
          <div class="team">
            <img :src="pred.away_logo" :alt="pred.away_team" />
            <span class="team-name">{{ pred.away_team }}</span>
          </div>
        </div>

        <!-- Pronostic -->
        <div class="tip-row">
          <div>
            <div class="tip-label">Pronostic</div>
            <div class="tip-value">{{ pred.tip }}</div>
          </div>
          <div style="text-align:center">
            <div class="tip-label">Marché</div>
            <div style="font-size:0.85rem; color:var(--text-muted)">{{ pred.market || '1X2' }}</div>
          </div>
          <div style="text-align:right">
            <div class="tip-label">Cote</div>
            <div class="tip-odds">{{ pred.odds }}</div>
          </div>
        </div>

        <!-- Confiance -->
        <div class="confidence-wrap">
          <span class="confidence-text">Confiance</span>
          <div class="confidence-track">
            <div
              class="confidence-fill"
              :style="{ width: pred.confidence * 10 + '%' }"
            ></div>
          </div>
          <span class="confidence-text">{{ pred.confidence }}/10</span>
        </div>

        <!-- Analyse courte -->
        <p v-if="pred.analysis" style="margin-top:0.75rem; font-size:0.85rem; color:var(--text-muted); line-height:1.5">
          {{ pred.analysis }}
        </p>

        <div style="margin-top:0.75rem; font-size:0.8rem; color:var(--accent)">
          Voir l'analyse complète →
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePredictionsStore } from '../stores/predictions.js'
import { storeToRefs } from 'pinia'

const router = useRouter()
const store  = usePredictionsStore()
const { predictions, loading, error } = storeToRefs(store)

const filter = ref('all')

const filtered = computed(() => {
  if (filter.value === 'all') return predictions.value
  return predictions.value.filter(p => {
    const sport = p.competition_name?.toLowerCase().includes('nba') ? 'basketball' : 'football'
    return sport === filter.value
  })
})

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit'
  })
}

function resultLabel(result) {
  return { PENDING: 'En cours', WON: '✓ Gagné', LOST: '✗ Perdu', VOID: 'Annulé' }[result] || result
}

onMounted(() => store.fetchPredictions())
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.sport-filter {
  display: flex;
  gap: 0.5rem;
}

.sport-btn {
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  transition: all 0.2s;
}

.sport-btn.active {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
}
</style>
