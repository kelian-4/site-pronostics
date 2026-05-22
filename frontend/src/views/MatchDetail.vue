<template>
  <main>
    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else-if="match">
      <!-- Retour -->
      <button class="btn btn-outline" style="margin-bottom:1.5rem" @click="router.back()">
        ← Retour
      </button>

      <!-- Header compétition -->
      <div class="competition-info" style="margin-bottom:1rem">
        <img :src="match.competition_logo" :alt="match.competition_name" />
        <span>{{ match.competition_name }}</span>
        <span>·</span>
        <span>{{ formatDate(match.match_date) }}</span>
        <span class="badge badge-live" v-if="match.status === 'LIVE'">LIVE</span>
      </div>

      <!-- Équipes -->
      <div class="card" style="margin-bottom:1rem">
        <div class="teams-row" style="margin-bottom:0">
          <div class="team">
            <img :src="match.home_logo" :alt="match.home_team" style="width:64px;height:64px" />
            <span class="team-name" style="font-size:1.1rem">{{ match.home_team }}</span>
            <span v-if="homeForm" style="font-size:0.8rem;color:var(--text-muted)">
              {{ homeForm.rank }}e · {{ homeForm.points }} pts
            </span>
          </div>

          <div style="text-align:center">
            <div v-if="match.status === 'FINISHED'" style="font-size:2rem;font-weight:800">
              {{ match.home_score }} - {{ match.away_score }}
            </div>
            <div v-else style="font-size:1.5rem;font-weight:800;color:var(--text-muted)">VS</div>
            <div class="match-time">{{ formatTime(match.match_date) }}</div>
          </div>

          <div class="team">
            <img :src="match.away_logo" :alt="match.away_team" style="width:64px;height:64px" />
            <span class="team-name" style="font-size:1.1rem">{{ match.away_team }}</span>
            <span v-if="awayForm" style="font-size:0.8rem;color:var(--text-muted)">
              {{ awayForm.rank }}e · {{ awayForm.points }} pts
            </span>
          </div>
        </div>

        <!-- Forme récente -->
        <div v-if="homeForm || awayForm" style="display:flex;justify-content:space-between;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border)">
          <div class="form-results">
            <span
              v-for="(r, i) in homeForm?.results?.split('')"
              :key="i"
              class="form-dot"
              :class="r"
            >{{ r }}</span>
          </div>
          <span style="font-size:0.8rem;color:var(--text-muted)">Forme récente</span>
          <div class="form-results">
            <span
              v-for="(r, i) in awayForm?.results?.split('')"
              :key="i"
              class="form-dot"
              :class="r"
            >{{ r }}</span>
          </div>
        </div>
      </div>

      <!-- Stats comparatives -->
      <div v-if="match.stats?.length" class="card" style="margin-bottom:1rem">
        <h2>Statistiques comparatives</h2>
        <div
          v-for="stat in homeStats"
          :key="stat.id"
          class="stat-row"
        >
          <span class="stat-val home">{{ stat.value }}</span>
          <span class="stat-lbl">{{ stat.label }}</span>
          <span class="stat-val away">
            {{ awayStatValue(stat.label) }}
          </span>
        </div>
      </div>

      <!-- Pronostics -->
      <div v-if="match.predictions?.length">
        <h2>Nos pronostics</h2>
        <div
          v-for="pred in match.predictions"
          :key="pred.id"
          class="card"
          style="margin-bottom:0.75rem"
        >
          <div class="tip-row">
            <div>
              <div class="tip-label">Pronostic</div>
              <div class="tip-value">{{ pred.tip }}</div>
            </div>
            <div style="text-align:center">
              <div class="tip-label">Marché</div>
              <div style="font-size:0.85rem;color:var(--text-muted)">{{ pred.market || '1X2' }}</div>
            </div>
            <div style="text-align:right">
              <div class="tip-label">Cote</div>
              <div class="tip-odds">{{ pred.odds }}</div>
            </div>
          </div>

          <div class="confidence-wrap" style="margin-top:0.75rem">
            <span class="confidence-text">Confiance</span>
            <div class="confidence-track">
              <div class="confidence-fill" :style="{ width: pred.confidence * 10 + '%' }"></div>
            </div>
            <span class="confidence-text">{{ pred.confidence }}/10</span>
          </div>

          <p v-if="pred.analysis" style="margin-top:0.75rem;font-size:0.88rem;color:var(--text-muted);line-height:1.6">
            {{ pred.analysis }}
          </p>

          <div style="margin-top:0.75rem">
            <span class="badge" :class="`badge-${pred.result.toLowerCase()}`">
              {{ resultLabel(pred.result) }}
            </span>
            <span v-if="pred.is_premium" class="badge badge-premium" style="margin-left:0.5rem">Premium</span>
          </div>
        </div>
      </div>

      <div v-else class="empty">Aucun pronostic publié pour ce match.</div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route  = useRoute()
const router = useRouter()

const match   = ref(null)
const loading = ref(false)

const homeForm  = computed(() => match.value?.form?.find(f => f.team === 'home'))
const awayForm  = computed(() => match.value?.form?.find(f => f.team === 'away'))
const homeStats = computed(() => match.value?.stats?.filter(s => s.team === 'home') || [])

function awayStatValue(label) {
  return match.value?.stats?.find(s => s.team === 'away' && s.label === label)?.value || '—'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit'
  })
}

function resultLabel(result) {
  return { PENDING: 'En cours', WON: '✓ Gagné', LOST: '✗ Perdu', VOID: 'Annulé' }[result] || result
}

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`http://localhost:3000/matches/${route.params.id}`)
    match.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.form-results { display: flex; gap: 0.3rem; }

.form-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
}

.form-dot.W { background: rgba(0,220,130,0.2); color: var(--accent); }
.form-dot.D { background: rgba(132,146,166,0.2); color: var(--text-muted); }
.form-dot.L { background: rgba(255,71,87,0.2); color: var(--danger); }

.stat-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.88rem;
}

.stat-row:last-child { border-bottom: none; }

.stat-lbl {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.stat-val.home { font-weight: 700; color: var(--accent); }
.stat-val.away { font-weight: 700; text-align: right; }
</style>
