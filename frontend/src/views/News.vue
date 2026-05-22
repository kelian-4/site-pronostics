<template>
  <main class="news-page">
    <div class="news-header">
      <h1>Actualités</h1>
      <p class="news-subtitle">Les dernières infos foot & basket en temps réel</p>
    </div>

    <div class="news-filters">
      <button
        v-for="source in sources"
        :key="source.name"
        class="sport-btn"
        :class="{ active: activeSource === source.name }"
        @click="selectSource(source)"
      >
        {{ source.label }}
      </button>
    </div>

    <div v-if="error" class="news-error">
      ⚠️ {{ error }}
    </div>

    <div v-if="loading" class="news-loading">
      <div class="spinner"></div>
      <span>Chargement des actualités...</span>
    </div>

    <div v-else-if="!error && articles.length === 0 && !loading" class="empty">
      Aucune actualité disponible pour cette source.
    </div>

    <div v-else class="news-grid">
      <div
        v-for="article in articles"
        :key="article.link"
        class="news-card"
        @click="openArticle(article.link)"
      >
        <div class="news-img-wrap">
          <img
            v-if="article.thumbnail && article.thumbnail.startsWith('http')"
            :src="article.thumbnail"
            :alt="article.title"
            class="news-img"
            @error="e => e.target.style.display = 'none'"
          />
          <div v-else class="news-img-placeholder">{{ activeSourceObj?.icon || '📰' }}</div>
        </div>
        <div class="news-body">
          <div class="news-meta">
            <span class="news-source">{{ activeSource }}</span>
            <span class="news-date">{{ formatDate(article.pubDate) }}</span>
          </div>
          <h3 class="news-title">{{ article.title }}</h3>
          <p class="news-desc">{{ truncate(stripHtml(article.description), 120) }}</p>
          <span class="news-link">Lire l'article →</span>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ✅ sources déclaré EN PREMIER avant tout ce qui l'utilise
const sources = [
  { name: 'BBC Football', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 BBC Sport', icon: '⚽', key: 'bbc'  },
  { name: 'Sky Sports',   label: '🔵 Sky Sports',   icon: '⚽', key: 'sky'  },
  { name: 'ESPN FC',      label: '🇺🇸 ESPN FC',      icon: '⚽', key: 'espn' },
  { name: 'NBA',          label: '🏀 NBA / ESPN',    icon: '🏀', key: 'nba'  },
]

const articles     = ref([])
const loading      = ref(false)
const error        = ref('')
const activeSource = ref(sources[0].name)

const activeSourceObj = computed(() =>
  sources.find(s => s.name === activeSource.value)
)

function selectSource(source) {
  activeSource.value = source.name
  fetchNews(source.key)
}

function openArticle(url) {
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}

async function fetchNews(key) {
  if (!key) key = sources[0].key
  loading.value  = true
  error.value    = ''
  articles.value = []

  try {
    const res = await fetch(`${BASE}/news?source=${key}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml    = await res.text()
    const parsed = new DOMParser().parseFromString(xml, 'application/xml')
    const items  = [...parsed.querySelectorAll('item')]

    articles.value = items.map(item => ({
      title:       item.querySelector('title')?.textContent || '',
      link:        item.querySelector('link')?.textContent  || '',
      pubDate:     item.querySelector('pubDate')?.textContent || '',
      description: item.querySelector('description')?.textContent || '',
      thumbnail:   item.querySelector('enclosure')?.getAttribute('url')
                || item.querySelector('thumbnail')?.getAttribute('url')
                || '',
    })).filter(a => a.title)

  } catch (e) {
    console.error('[News]', e)
    error.value = `Impossible de charger ce flux : ${e.message}`
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim() || ''
}

function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

onMounted(() => fetchNews(sources[0].key))
</script>

<style scoped>
.news-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.news-header {
  margin-bottom: 1.5rem;
}

.news-header h1 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}

.news-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.news-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.75rem;
}

.sport-btn {
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.sport-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.sport-btn.active {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
}

/* Loader */
.news-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  color: var(--text-muted);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Erreur */
.news-error {
  padding: 1rem 1.25rem;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid var(--danger);
  border-radius: 8px;
  color: var(--danger);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.empty {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

/* Grille */
.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

@media (max-width: 900px) {
  .news-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .news-grid { grid-template-columns: 1fr; }
}

.news-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s, transform 0.2s;
  cursor: pointer;
}

.news-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
}

.news-img-wrap {
  height: 175px;
  overflow: hidden;
  background: var(--surface2, #0f1923);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.news-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.news-img-placeholder {
  font-size: 3rem;
  opacity: 0.4;
}

.news-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-source {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.news-date {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.news-title {
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
}

.news-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.5;
  flex: 1;
  margin: 0;
}

.news-link {
  font-size: 0.82rem;
  color: var(--accent);
  font-weight: 600;
  margin-top: auto;
}
</style>
