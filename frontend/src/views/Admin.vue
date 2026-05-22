<template>
  <main class="admin-page">
    <div class="admin-header">
      <h1>⚙️ Panel Admin</h1>
      <p class="admin-subtitle">Gestion de WinProno</p>
    </div>

    <!-- Onglets -->
    <div class="admin-tabs">
      <button
        v-for="tab in tabs" :key="tab.key"
        class="tab-btn" :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ===== ONGLET MATCHS ===== -->
    <section v-if="activeTab === 'matches'">
      <div class="section-header">
        <h2>Matchs</h2>
        <button class="btn btn-primary" @click="showMatchForm = !showMatchForm">
          {{ showMatchForm ? '✕ Annuler' : '+ Ajouter un match' }}
        </button>
      </div>

      <!-- Formulaire ajout match -->
      <div v-if="showMatchForm" class="admin-form">
        <h3>{{ editingMatch ? 'Modifier le match' : 'Nouveau match' }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Sport *</label>
            <select v-model="matchForm.sport">
              <option value="football">⚽ Football</option>
              <option value="basketball">🏀 Basketball</option>
            </select>
          </div>
          <div class="form-group">
            <label>Compétition</label>
            <select v-model="matchForm.competition_id">
              <option value="">— Aucune —</option>
              <option
                v-for="c in competitions.filter(c => c.sport === matchForm.sport)"
                :key="c.id" :value="c.id"
              >{{ c.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Équipe domicile *</label>
            <input v-model="matchForm.home_team" placeholder="Ex: Real Madrid" />
          </div>
          <div class="form-group">
            <label>Logo domicile (URL)</label>
            <input v-model="matchForm.home_logo" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label>Équipe extérieure *</label>
            <input v-model="matchForm.away_team" placeholder="Ex: FC Barcelona" />
          </div>
          <div class="form-group">
            <label>Logo extérieur (URL)</label>
            <input v-model="matchForm.away_logo" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label>Date et heure *</label>
            <input type="datetime-local" v-model="matchForm.match_date" />
          </div>
          <div class="form-group">
            <label>Statut</label>
            <select v-model="matchForm.status">
              <option value="UPCOMING">UPCOMING</option>
              <option value="LIVE">LIVE</option>
              <option value="HT">HT (Mi-temps)</option>
              <option value="FINISHED">FINISHED</option>
              <option value="POSTPONED">POSTPONED</option>
            </select>
          </div>
          <div v-if="matchForm.status === 'LIVE' || matchForm.status === 'FINISHED'" class="form-group">
            <label>Score domicile</label>
            <input type="number" v-model.number="matchForm.home_score" min="0" />
          </div>
          <div v-if="matchForm.status === 'LIVE' || matchForm.status === 'FINISHED'" class="form-group">
            <label>Score extérieur</label>
            <input type="number" v-model.number="matchForm.away_score" min="0" />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="saveMatch" :disabled="saving">
            {{ saving ? 'Enregistrement...' : editingMatch ? 'Modifier' : 'Ajouter' }}
          </button>
          <button class="btn btn-ghost" @click="cancelMatchForm">Annuler</button>
        </div>
        <p v-if="matchError" class="form-error">{{ matchError }}</p>
      </div>

      <!-- Filtre statut -->
      <div class="filters">
        <button
          v-for="s in ['TOUS','UPCOMING','LIVE','FINISHED']" :key="s"
          class="sport-btn" :class="{ active: matchFilter === s }"
          @click="matchFilter = s"
        >{{ s }}</button>
        <input v-model="matchSearch" class="search-input" placeholder="🔍 Rechercher..." />
      </div>

      <!-- Tableau matchs -->
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Match</th>
              <th>Compétition</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredMatches.length === 0">
              <td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem">
                Aucun match
              </td>
            </tr>
            <tr v-for="m in filteredMatches" :key="m.id">
              <td>
                <span class="sport-icon">{{ m.sport === 'basketball' ? '🏀' : '⚽' }}</span>
                <strong>{{ m.home_team }}</strong> vs <strong>{{ m.away_team }}</strong>
              </td>
              <td>{{ m.competition_name || '—' }}</td>
              <td>{{ formatDate(m.match_date) }}</td>
              <td><span class="status-badge" :class="m.status?.toLowerCase()">{{ m.status }}</span></td>
              <td>{{ m.home_score ?? '—' }} - {{ m.away_score ?? '—' }}</td>
              <td class="actions-cell">
                <button class="btn-icon" title="Score rapide" @click="openScoreModal(m)">🎯</button>
                <button class="btn-icon" title="Modifier" @click="editMatch(m)">✏️</button>
                <button class="btn-icon danger" title="Supprimer" @click="deleteMatch(m.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ===== ONGLET PRONOSTICS ===== -->
    <section v-if="activeTab === 'predictions'">
      <div class="section-header">
        <h2>Pronostics</h2>
        <button class="btn btn-primary" @click="showPredForm = !showPredForm">
          {{ showPredForm ? '✕ Annuler' : '+ Ajouter un pronostic' }}
        </button>
      </div>

      <div v-if="showPredForm" class="admin-form">
        <h3>{{ editingPred ? 'Modifier le pronostic' : 'Nouveau pronostic' }}</h3>
        <div class="form-grid">
          <div class="form-group" style="grid-column: 1/-1">
            <label>Match *</label>
            <select v-model="predForm.match_id">
              <option value="">— Sélectionner un match —</option>
              <option v-for="m in matches" :key="m.id" :value="m.id">
                {{ m.home_team }} vs {{ m.away_team }} — {{ formatDate(m.match_date) }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Marché</label>
            <select v-model="predForm.market">
              <option value="1X2">1X2</option>
              <option value="BTTS">BTTS</option>
              <option value="Over/Under">Over/Under</option>
              <option value="Handicap">Handicap</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tip *</label>
            <input v-model="predForm.tip" placeholder="Ex: Victoire Real Madrid" />
          </div>
          <div class="form-group">
            <label>Cote *</label>
            <input type="number" step="0.01" v-model.number="predForm.odds" placeholder="1.85" />
          </div>
          <div class="form-group">
            <label>Confiance ({{ predForm.confidence }}%)</label>
            <input type="range" min="1" max="100" v-model.number="predForm.confidence" />
          </div>
          <div class="form-group">
            <label>Premium</label>
            <select v-model="predForm.is_premium">
              <option :value="false">Gratuit</option>
              <option :value="true">Premium</option>
            </select>
          </div>
          <div class="form-group" style="grid-column: 1/-1">
            <label>Analyse</label>
            <textarea v-model="predForm.analysis" rows="4" placeholder="Analyse détaillée..."></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="savePrediction" :disabled="saving">
            {{ saving ? 'Enregistrement...' : editingPred ? 'Modifier' : 'Publier' }}
          </button>
          <button class="btn btn-ghost" @click="cancelPredForm">Annuler</button>
        </div>
        <p v-if="predError" class="form-error">{{ predError }}</p>
      </div>

      <!-- Tableau pronostics -->
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Match</th>
              <th>Tip</th>
              <th>Cote</th>
              <th>Confiance</th>
              <th>Résultat</th>
              <th>Premium</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="predictions.length === 0">
              <td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem">
                Aucun pronostic
              </td>
            </tr>
            <tr v-for="p in predictions" :key="p.id">
              <td>{{ p.home_team }} vs {{ p.away_team }}</td>
              <td><strong>{{ p.tip }}</strong></td>
              <td>{{ p.odds }}</td>
              <td>
                <div class="confidence-bar">
                  <div class="confidence-fill" :style="{ width: p.confidence + '%' }"></div>
                  <span>{{ p.confidence }}%</span>
                </div>
              </td>
              <td>
                <select
                  :value="p.result"
                  @change="updateResult(p.id, $event.target.value)"
                  class="result-select"
                  :class="p.result?.toLowerCase()"
                >
                  <option value="">En attente</option>
                  <option value="WON">✅ WON</option>
                  <option value="LOST">❌ LOST</option>
                  <option value="VOID">⚪ VOID</option>
                </select>
              </td>
              <td>{{ p.is_premium ? '⭐ Premium' : 'Gratuit' }}</td>
              <td class="actions-cell">
                <button class="btn-icon" title="Modifier" @click="editPrediction(p)">✏️</button>
                <button class="btn-icon danger" title="Supprimer" @click="deletePrediction(p.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ===== ONGLET COMPETITIONS ===== -->
    <section v-if="activeTab === 'competitions'">
      <div class="section-header">
        <h2>Compétitions</h2>
        <button class="btn btn-primary" @click="showCompForm = !showCompForm">
          {{ showCompForm ? '✕ Annuler' : '+ Ajouter une compétition' }}
        </button>
      </div>

      <div v-if="showCompForm" class="admin-form">
        <h3>Nouvelle compétition</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Nom *</label>
            <input v-model="compForm.name" placeholder="Ex: Ligue 1" />
          </div>
          <div class="form-group">
            <label>Pays</label>
            <input v-model="compForm.country" placeholder="Ex: France" />
          </div>
          <div class="form-group">
            <label>Sport *</label>
            <select v-model="compForm.sport">
              <option value="football">⚽ Football</option>
              <option value="basketball">🏀 Basketball</option>
            </select>
          </div>
          <div class="form-group">
            <label>Logo (URL)</label>
            <input v-model="compForm.logo_url" placeholder="https://..." />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="saveCompetition" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Ajouter' }}
          </button>
          <button class="btn btn-ghost" @click="showCompForm = false">Annuler</button>
        </div>
        <p v-if="compError" class="form-error">{{ compError }}</p>
      </div>

      <div class="comp-grid">
        <div v-for="c in competitions" :key="c.id" class="comp-card">
          <img v-if="c.logo_url" :src="c.logo_url" :alt="c.name" class="comp-logo"
            @error="e => e.target.style.display='none'" />
          <div v-else class="comp-logo-placeholder">{{ c.sport === 'basketball' ? '🏀' : '⚽' }}</div>
          <div class="comp-info">
            <strong>{{ c.name }}</strong>
            <span>{{ c.country }}</span>
            <span class="comp-sport">{{ c.sport }}</span>
          </div>
          <button class="btn-icon danger" @click="deleteCompetition(c.id)">🗑️</button>
        </div>
      </div>
    </section>

    <!-- Modal score rapide -->
    <div v-if="scoreModal" class="modal-overlay" @click.self="scoreModal = null">
      <div class="modal">
        <h3>🎯 Mettre à jour le score</h3>
        <p>{{ scoreModal.home_team }} vs {{ scoreModal.away_team }}</p>
        <div class="score-inputs">
          <input type="number" v-model.number="scoreForm.home_score" min="0" />
          <span>—</span>
          <input type="number" v-model.number="scoreForm.away_score" min="0" />
        </div>
        <div class="form-group" style="margin-top:1rem">
          <label>Statut</label>
          <select v-model="scoreForm.status">
            <option value="UPCOMING">UPCOMING</option>
            <option value="LIVE">LIVE</option>
            <option value="HT">HT</option>
            <option value="FINISHED">FINISHED</option>
          </select>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="saveScore">Enregistrer</button>
          <button class="btn btn-ghost" @click="scoreModal = null">Annuler</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const tabs = [
  { key: 'matches',      label: '⚽ Matchs' },
  { key: 'predictions',  label: '🎯 Pronostics' },
  { key: 'competitions', label: '🏆 Compétitions' },
]
const activeTab = ref('matches')

// ── Data ──────────────────────────────────────────────
const matches      = ref([])
const predictions  = ref([])
const competitions = ref([])
const saving       = ref(false)

// ── Match form ────────────────────────────────────────
const showMatchForm = ref(false)
const editingMatch  = ref(null)
const matchError    = ref('')
const matchFilter   = ref('TOUS')
const matchSearch   = ref('')

const defaultMatchForm = () => ({
  sport: 'football', competition_id: '', home_team: '', home_logo: '',
  away_team: '', away_logo: '', match_date: '', status: 'UPCOMING',
  home_score: null, away_score: null,
})
const matchForm = ref(defaultMatchForm())

// ── Prediction form ───────────────────────────────────
const showPredForm = ref(false)
const editingPred  = ref(null)
const predError    = ref('')

const defaultPredForm = () => ({
  match_id: '', market: '1X2', tip: '', odds: null,
  confidence: 70, is_premium: false, analysis: '',
})
const predForm = ref(defaultPredForm())

// ── Competition form ──────────────────────────────────
const showCompForm = ref(false)
const compError    = ref('')
const compForm     = ref({ name: '', country: '', sport: 'football', logo_url: '' })

// ── Score modal ───────────────────────────────────────
const scoreModal = ref(null)
const scoreForm  = ref({ home_score: 0, away_score: 0, status: 'LIVE' })

// ── Computed ──────────────────────────────────────────
const filteredMatches = computed(() => {
  let list = matches.value
  if (matchFilter.value !== 'TOUS') list = list.filter(m => m.status === matchFilter.value)
  if (matchSearch.value) {
    const q = matchSearch.value.toLowerCase()
    list = list.filter(m =>
      m.home_team.toLowerCase().includes(q) ||
      m.away_team.toLowerCase().includes(q)
    )
  }
  return list
})

// ── API calls ─────────────────────────────────────────
async function loadAll() {
  const [m, p, c] = await Promise.all([
    axios.get(`${API}/admin/matches`),
    axios.get(`${API}/admin/predictions`),
    axios.get(`${API}/admin/competitions`),
  ])
  matches.value      = m.data
  predictions.value  = p.data
  competitions.value = c.data
}

// ── Match actions ─────────────────────────────────────
async function saveMatch() {
  matchError.value = ''
  if (!matchForm.value.home_team || !matchForm.value.away_team || !matchForm.value.match_date) {
    matchError.value = 'Les champs marqués * sont obligatoires'
    return
  }
  saving.value = true
  try {
    if (editingMatch.value) {
      await axios.patch(`${API}/admin/matches/${editingMatch.value}`, matchForm.value)
    } else {
      await axios.post(`${API}/admin/matches`, matchForm.value)
    }
    await loadAll()
    cancelMatchForm()
  } catch (e) {
    matchError.value = e.response?.data?.message || e.message
  } finally {
    saving.value = false
  }
}

function editMatch(m) {
  editingMatch.value = m.id
  matchForm.value = {
    sport:          m.sport || 'football',
    competition_id: m.competition_id || '',
    home_team:      m.home_team,
    home_logo:      m.home_logo || '',
    away_team:      m.away_team,
    away_logo:      m.away_logo || '',
    match_date:     m.match_date?.slice(0, 16) || '',
    status:         m.status || 'UPCOMING',
    home_score:     m.home_score ?? null,
    away_score:     m.away_score ?? null,
  }
  showMatchForm.value = true
}

async function deleteMatch(id) {
  if (!confirm('Supprimer ce match et ses pronostics ?')) return
  await axios.delete(`${API}/admin/matches/${id}`)
  await loadAll()
}

function cancelMatchForm() {
  showMatchForm.value = false
  editingMatch.value  = null
  matchForm.value     = defaultMatchForm()
  matchError.value    = ''
}

function openScoreModal(m) {
  scoreModal.value = m
  scoreForm.value  = {
    home_score: m.home_score ?? 0,
    away_score: m.away_score ?? 0,
    status:     m.status || 'LIVE',
  }
}

async function saveScore() {
  await axios.patch(`${API}/admin/matches/${scoreModal.value.id}`, scoreForm.value)
  await loadAll()
  scoreModal.value = null
}

// ── Prediction actions ────────────────────────────────
async function savePrediction() {
  predError.value = ''
  if (!predForm.value.match_id || !predForm.value.tip || !predForm.value.odds) {
    predError.value = 'Match, tip et cote sont obligatoires'
    return
  }
  saving.value = true
  try {
    if (editingPred.value) {
      await axios.patch(`${API}/admin/predictions/${editingPred.value}`, predForm.value)
    } else {
      await axios.post(`${API}/admin/predictions`, predForm.value)
    }
    await loadAll()
    cancelPredForm()
  } catch (e) {
    predError.value = e.response?.data?.message || e.message
  } finally {
    saving.value = false
  }
}

function editPrediction(p) {
  editingPred.value = p.id
  predForm.value = {
    match_id:   p.match_id,
    market:     p.market || '1X2',
    tip:        p.tip,
    odds:       p.odds,
    confidence: p.confidence,
    is_premium: p.is_premium,
    analysis:   p.analysis || '',
  }
  showPredForm.value = true
}

async function deletePrediction(id) {
  if (!confirm('Supprimer ce pronostic ?')) return
  await axios.delete(`${API}/admin/predictions/${id}`)
  await loadAll()
}

async function updateResult(id, result) {
  await axios.patch(`${API}/admin/predictions/${id}/result`, { result })
  await loadAll()
}

function cancelPredForm() {
  showPredForm.value = false
  editingPred.value  = null
  predForm.value     = defaultPredForm()
  predError.value    = ''
}

// ── Competition actions ───────────────────────────────
async function saveCompetition() {
  compError.value = ''
  if (!compForm.value.name || !compForm.value.sport) {
    compError.value = 'Nom et sport obligatoires'
    return
  }
  saving.value = true
  try {
    await axios.post(`${API}/admin/competitions`, compForm.value)
    await loadAll()
    showCompForm.value = false
    compForm.value = { name: '', country: '', sport: 'football', logo_url: '' }
  } catch (e) {
    compError.value = e.response?.data?.message || e.message
  } finally {
    saving.value = false
  }
}

async function deleteCompetition(id) {
  if (!confirm('Supprimer cette compétition ?')) return
  await axios.delete(`${API}/admin/competitions/${id}`)
  await loadAll()
}

// ── Helpers ───────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

onMounted(loadAll)
</script>

<style scoped>
.admin-page {
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.admin-header { margin-bottom: 1.5rem; }
.admin-header h1 { font-size: 1.8rem; font-weight: 800; margin: 0 0 0.25rem; }
.admin-subtitle { color: var(--text-muted); font-size: 0.9rem; margin: 0; }

/* Tabs */
.admin-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0;
}
.tab-btn {
  padding: 0.6rem 1.2rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -1px;
}
.tab-btn:hover { color: var(--accent); }
.tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }

/* Section header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.section-header h2 { font-size: 1.2rem; font-weight: 700; margin: 0; }

/* Buttons */
.btn {
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-primary { background: var(--accent); color: #000; }
.btn-primary:hover { opacity: 0.85; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
}
.btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

.btn-icon {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.btn-icon:hover { border-color: var(--accent); }
.btn-icon.danger:hover { border-color: var(--danger); }

/* Form */
.admin-form {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.admin-form h3 { margin: 0 0 1.25rem; font-size: 1rem; }
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
.form-group input,
.form-group select,
.form-group textarea {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  color: inherit;
  font-size: 0.88rem;
  transition: border-color 0.2s;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
}
.form-group textarea { resize: vertical; font-family: inherit; }
.form-actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
.form-error { color: var(--danger); font-size: 0.85rem; margin-top: 0.5rem; }

/* Filters */
.filters {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.sport-btn {
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.sport-btn.active { background: var(--accent); color: #000; border-color: var(--accent); }
.search-input {
  margin-left: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.35rem 0.75rem;
  color: inherit;
  font-size: 0.85rem;
  width: 200px;
}
.search-input:focus { outline: none; border-color: var(--accent); }

/* Table */
.admin-table-wrap { overflow-x: auto; }
.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
.admin-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
}
.admin-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.admin-table tr:hover td { background: var(--surface); }
.actions-cell { display: flex; gap: 0.4rem; }

/* Status badge */
.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}
.status-badge.upcoming { background: rgba(255,165,2,0.15); color: var(--warning); }
.status-badge.live     { background: rgba(255,71,87,0.15);  color: var(--danger);  }
.status-badge.finished { background: rgba(0,220,130,0.15);  color: var(--accent);  }
.status-badge.ht       { background: rgba(255,165,2,0.15);  color: var(--warning); }

/* Confidence bar */
.confidence-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.confidence-bar > div {
  height: 6px;
  width: 80px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}
.confidence-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
}

/* Result select */
.result-select {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  color: inherit;
  font-size: 0.82rem;
  cursor: pointer;
}
.result-select.won  { border-color: var(--accent); color: var(--accent); }
.result-select.lost { border-color: var(--danger); color: var(--danger); }

/* Competitions grid */
.comp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
.comp-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.comp-logo { width: 36px; height: 36px; object-fit: contain; }
.comp-logo-placeholder { font-size: 1.8rem; }
.comp-info { display: flex; flex-direction: column; gap: 0.1rem; flex: 1; font-size: 0.85rem; }
.comp-info strong { font-size: 0.92rem; }
.comp-sport {
  font-size: 0.72rem;
  color: var(--accent);
  font-weight: 700;
  text-transform: uppercase;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  width: 360px;
  max-width: 90vw;
}
.modal h3 { margin: 0 0 0.5rem; }
.score-inputs {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}
.score-inputs input {
  width: 80px;
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem;
  color: inherit;
}
.score-inputs span { font-size: 1.5rem; font-weight: 700; }

.sport-icon { margin-right: 0.4rem; }
</style>
