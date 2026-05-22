kk<template>
  <div class="home">

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-left">
      <div class="hero-badge">⚡ Pronostics IA · Football & Basketball</div>
      <h1 class="hero-title">
        Gagnez plus avec<br>
        <span class="hero-accent">des pronostics data</span>
      </h1>
      <p class="hero-sub">
        Analyses expertes basées sur les statistiques réelles.
        Taux de réussite vérifié publiquement depuis le premier jour.
      </p>
      <div class="hero-actions">
        <router-link v-if="!auth.isLoggedIn" to="/register" class="btn btn-primary btn-lg">
          Commencer gratuitement →
        </router-link>
        <router-link v-else to="/predictions" class="btn btn-primary btn-lg">
          Voir les pronostics du jour →
        </router-link>
        <router-link to="/results" class="btn btn-outline btn-lg">Voir l'historique</router-link>
      </div>
      <div class="hero-social">
        <span>★★★★★ <strong>4.8</strong> · 320 avis vérifiés</span>
        <span>·</span>
        <span>10 000+ membres actifs</span>
      </div>
    </div>
    <div class="hero-right">
      <img src="/hero.png" alt="WinProno dashboard" class="hero-img" />
    </div>
  </div>
</section>

<!-- STATS -->
<section class="section-wrap">
  <div class="stats-bar">
    <div class="stat-card">
      <span class="stat-value accent">94%</span>
      <span class="stat-label">Taux de réussite</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">+1194€</span>
      <span class="stat-sub">782 370 FCFA</span>
      <span class="stat-label">Gains avril 2026</span>
    </div>
    <div class="stat-card" style="cursor:pointer" @click="router.push('/predictions')">
      <span class="stat-value">{{ predictions.length || 0 }}</span>
      <span class="stat-label">Pronostics publiés</span>
    </div>
    <div class="stat-card" style="cursor:pointer" @click="router.push('/news')">
      <span class="stat-value">📰</span>
      <span class="stat-label">Actus foot →</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">2026</span>
      <span class="stat-label">Depuis</span>
    </div>
  </div>
</section>
    <!-- MATCHS DU JOUR + DERNIERS GAGNANTS -->
    <section class="section-wrap">
      <div class="two-col">
        <div>
          <div class="section-header">
            <h2>Matchs du jour</h2>
            <router-link to="/predictions" class="link-more">Voir tous →</router-link>
          </div>
          <div class="match-list">
            <div
              v-for="pred in recentPredictions"
              :key="pred.id"
              class="match-row"
              @click="router.push(`/matches/${pred.match_id}`)"
            >
              <div class="match-row-top">
                <span class="comp-tag">{{ pred.competition_name }}</span>
                <span class="match-date-tag">{{ formatTime(pred.match_date) }}</span>
              </div>
              <div class="match-row-teams">
                <span class="team-label">{{ pred.home_team }}</span>
                <span class="vs-tag">VS</span>
                <span class="team-label">{{ pred.away_team }}</span>
              </div>
              <div class="match-row-tip">
                <span class="tip-chip">{{ pred.tip }}</span>
                <span class="odds-chip">{{ pred.odds }}</span>
              </div>
            </div>
            <div v-if="!recentPredictions.length" class="empty-small">
              Aucun match disponible
            </div>
          </div>
        </div>

        <div>
          <div class="section-header">
            <h2>Derniers pronostics gagnants</h2>
            <span class="badge badge-won">✓ Vérifiés</span>
          </div>
          <div class="card" style="padding:0">
            <table class="results-table">
              <thead>
                <tr>
                  <th>Match</th>
                  <th>Pronostic</th>
                  <th>Cote</th>
                  <th>Gain</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pred in wonPredictions" :key="pred.id">
                  <td>
                    <div class="fw600">{{ pred.home_team }} vs {{ pred.away_team }}</div>
                    <div class="muted sm">{{ formatShortDate(pred.match_date) }}</div>
                  </td>
                  <td class="accent">{{ pred.tip }}</td>
                  <td class="fw600">{{ pred.odds }}</td>
                  <td class="accent fw600">+{{ ((pred.odds - 1) * 10).toFixed(0) }}€</td>
                </tr>
                <tr v-if="!wonPredictions.length">
                  <td colspan="4" style="text-align:center;color:var(--text-muted)">
                    Aucun résultat encore
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- OUTILS PREMIUM -->
    <section class="section-wrap">
      <div class="section-header">
        <h2>Outils Premium</h2>
        <router-link to="/register" class="link-more">Tout débloquer →</router-link>
      </div>
      <div class="tools-grid">
        <div class="tool-card" v-for="tool in tools" :key="tool.name">
          <div class="tool-icon">{{ tool.icon }}</div>
          <div class="tool-name">{{ tool.name }}</div>
          <div class="tool-desc">{{ tool.desc }}</div>
          <span class="badge badge-premium">Premium</span>
        </div>
      </div>
    </section>

    <!-- LA VRAIE DIFFÉRENCE -->
    <section class="section-wrap">
      <h2 style="text-align:center;margin-bottom:0.5rem">La vraie différence</h2>
      <p class="section-sub">Parier seul VS avec WinProno</p>
      <div class="diff-grid">
        <div class="diff-card bad">
          <div class="diff-title">✗ Sans WinProno</div>
          <div class="diff-item" v-for="item in withoutUs" :key="item.title">
            <div class="diff-item-icon">{{ item.icon }}</div>
            <div>
              <div class="diff-item-title">{{ item.title }}</div>
              <div class="diff-item-desc">{{ item.desc }}</div>
            </div>
          </div>
          <div class="diff-result bad-result">📉 Résultat moyen : -47€/mois</div>
        </div>

        <div class="diff-vs">VS</div>

        <div class="diff-card good">
          <div class="diff-title">✔ Avec WinProno</div>
          <div class="diff-item" v-for="item in withUs" :key="item.title">
            <div class="diff-item-icon">{{ item.icon }}</div>
            <div>
              <div class="diff-item-title">{{ item.title }}</div>
              <div class="diff-item-desc">{{ item.desc }}</div>
            </div>
          </div>
          <div class="diff-result good-result">📈 Résultat VIP : +578€/mois</div>
        </div>
      </div>
    </section>

    <!-- RÉSULTATS PUBLICS -->
    <section class="section-wrap results-public">
      <div class="results-public-inner">
        <div class="results-public-text">
          <div class="badge badge-won" style="margin-bottom:1rem">94% de réussite · tout est public</div>
          <h2>Résultats 100% vérifiables depuis 2019</h2>
          <p>
            WinProno publie l'intégralité de ses résultats — gagnants et perdants sans exception.
            Aucun cherry-picking, aucun résultat effacé.
          </p>
          <router-link to="/results" class="btn btn-outline" style="margin-top:1rem;display:inline-flex">
            Voir l'historique complet
          </router-link>
        </div>
        <div class="results-public-stats">
          <div class="pub-stat"><span class="pub-val accent">94%</span><span class="pub-lbl">Taux réussite</span></div>
          <div class="pub-stat"><span class="pub-val accent">+1194€</span><span class="pub-lbl">Avril 2026</span></div>
          <div class="pub-stat"><span class="pub-val">52+</span><span class="pub-lbl">Pronos publiés</span></div>
          <div class="pub-stat"><span class="pub-val">49/52</span><span class="pub-lbl">Gagnés</span></div>
          <div class="pub-stat"><span class="pub-val">1.30</span><span class="pub-lbl">Cote moy.</span></div>
          <div class="pub-stat"><span class="pub-val">2019</span><span class="pub-lbl">Depuis</span></div>
        </div>
      </div>
    </section>

    <!-- CHAMPIONNATS -->
    <section class="section-wrap">
      <h2 style="margin-bottom:1rem">Pronostics par championnat</h2>
      <div class="leagues-grid">
        <div class="league-chip" v-for="league in leagues" :key="league.name">
          <img :src="league.logo" :alt="league.name" />
          <span>{{ league.name }}</span>
          <span class="league-count">+{{ league.count }}</span>
        </div>
      </div>
    </section>

    <!-- TÉMOIGNAGES -->
    <section class="section-wrap">
      <div class="section-header" style="margin-bottom:1.5rem">
        <div>
          <h2>Ce que disent nos membres</h2>
          <div style="margin-top:0.25rem">
            <span style="color:var(--warning)">★★★★★</span>
            <strong style="margin-left:0.5rem">4.8</strong>
            <span style="color:var(--text-muted);font-size:0.85rem;margin-left:0.5rem">320 avis vérifiés</span>
          </div>
        </div>
      </div>
      <div class="reviews-grid">
        <div class="review-card" v-for="review in reviews" :key="review.name">
          <div class="review-header">
            <div class="review-avatar">{{ review.initials }}</div>
            <div>
              <div class="fw600" style="font-size:0.9rem">{{ review.name }}</div>
              <div class="muted sm">{{ review.ago }}</div>
            </div>
            <div class="review-stars">{{ '★'.repeat(review.stars) }}</div>
          </div>
          <p class="review-text">{{ review.text }}</p>
          <div v-if="review.gain" class="review-gain">{{ review.gain }}</div>
          <div v-else class="muted sm">✓ Membre vérifié</div>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="section-wrap">
      <div class="cta-final">
        <h2>Prêt à améliorer vos pronostics ?</h2>
        <p>Rejoignez 10 000+ membres. Sans engagement, annulable à tout moment.</p>
        <router-link to="/register" class="btn btn-primary btn-lg">
          Essayer gratuitement →
        </router-link>
        <div class="cta-checks">
          <span>✓ Accès immédiat</span>
          <span>✓ Résultats publics</span>
          <span>✓ Sans engagement</span>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="accent fw600" style="font-size:1.1rem">⚽ WinProno</span>
          <p>Votre plateforme de pronostics football & basketball depuis 2019.</p>
          <div class="footer-stats">
            <span>94% · Taux de réussite</span>
            <span>+1194€ · Gains avril 2026</span>
            <span>840+ · Membres VIP</span>
          </div>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <div class="footer-col-title">Pronostics</div>
            <router-link to="/predictions">Pronostics du jour</router-link>
            <router-link to="/results">Résultats</router-link>
            <router-link to="/livescore">Livescore</router-link>
          </div>
          <div class="footer-col">
            <div class="footer-col-title">Outils</div>
            <span>ProOdds</span>
            <span>ProScore</span>
            <span>ProForm</span>
            <span>ProComparator</span>
          </div>
          <div class="footer-col">
            <div class="footer-col-title">Compte</div>
            <router-link to="/register">Inscription</router-link>
            <router-link to="/login">Connexion</router-link>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 WinProno. Tous droits réservés.</span>
        <span class="muted sm">⚠️ Les pronostics sont donnés à titre indicatif. Jeu responsable : 09 74 75 13 13</span>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { usePredictionsStore } from '../stores/predictions.js'
import { storeToRefs } from 'pinia'

const router    = useRouter()
const auth      = useAuthStore()
const predStore = usePredictionsStore()
const { predictions, stats } = storeToRefs(predStore)

const recentPredictions = computed(() =>
  predictions.value.filter(p => p.result === 'PENDING').slice(0, 4)
)
const wonPredictions = computed(() =>
  predictions.value.filter(p => p.result === 'WON').slice(0, 5)
)

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

const tools = [
  { icon: '📊', name: 'ProOdds',       desc: 'Meilleures cotes en temps réel sur 15 bookmakers' },
  { icon: '🎯', name: 'ProScore',      desc: 'Probabilités de score exact calculées par IA' },
  { icon: '📈', name: 'ProComparator', desc: 'Stats de buts comparées entre deux équipes' },
  { icon: '⚽', name: 'ProForm',       desc: 'Analyse de forme des équipes sur 10 derniers matchs' },
]

const withoutUs = [
  { icon: '😤', title: 'Paris au feeling',          desc: 'Basé sur la réputation des équipes sans donnée statistique.' },
  { icon: '📋', title: 'Cotes non questionnées',    desc: 'Le bookmaker propose 1.80. Vous pariez sans savoir si c\'est une bonne valeur.' },
  { icon: '🎲', title: 'Pas de scoring ni d\'edge', desc: 'Impossible de savoir si un pari vaut le risque. ROI négatif garanti.' },
  { icon: '🤡', title: 'Tipsters non vérifiables',  desc: 'Screenshots sans horodatage, résultats sélectionnés, pertes effacées.' },
]

const withUs = [
  { icon: '🤖', title: '47 variables analysées',       desc: 'xG, PPG, H2H, timing de buts, suspensions, cotes 15 bookmakers.' },
  { icon: '🎯', title: 'Edge value calculée',          desc: 'Vous savez exactement si la cote proposée est une bonne valeur.' },
  { icon: '💡', title: 'Score de confiance /10',       desc: 'Chaque pronostic est noté sur 10. Score exact IA disponible en VIP.' },
  { icon: '🔒', title: 'Résultats 100% publics',       desc: '840+ pronostics publiés et vérifiables. Gagnants ET perdants.' },
]

const leagues = [
  { name: 'Ligue 1',         logo: 'https://media.api-sports.io/football/leagues/61.png',  count: 18 },
  { name: 'Premier League',  logo: 'https://media.api-sports.io/football/leagues/39.png',  count: 20 },
  { name: 'La Liga',         logo: 'https://media.api-sports.io/football/leagues/140.png', count: 20 },
  { name: 'Serie A',         logo: 'https://media.api-sports.io/football/leagues/135.png', count: 20 },
  { name: 'Bundesliga',      logo: 'https://media.api-sports.io/football/leagues/78.png',  count: 18 },
  { name: 'Champions League',logo: 'https://media.api-sports.io/football/leagues/2.png',   count: 8  },
  { name: 'NBA',             logo: 'https://media.api-sports.io/basketball/leagues/12.png',count: 30 },
]

const reviews = [
  { initials: 'JM', name: 'Jean-Marc D.', ago: 'Il y a 3 jours',    stars: 5, text: 'Depuis que je suis WinProno, mon ROI a explosé. Les analyses sont précises, les cotes toujours bien choisies.', gain: '+180€ ce mois' },
  { initials: 'SC', name: 'Sophie C.',    ago: 'Il y a 5 jours',    stars: 5, text: 'Interface claire, résultats transparents. Pas de promesses folles, juste du sérieux. Exactement ce que je cherchais.', gain: null },
  { initials: 'TR', name: 'Thomas R.',    ago: 'Il y a 1 semaine',  stars: 4, text: 'Très bon taux de réussite sur la Champions League. ProScore est vraiment utile pour gérer sa bankroll.', gain: null },
  { initials: 'AL', name: 'Alex L.',      ago: 'Il y a 2 semaines', stars: 5, text: 'J\'ai essayé beaucoup de tipsters avant WinProno. La différence ? Ici tout est transparent, les pertes comme les gains.', gain: '+95€ ce mois' },
  { initials: 'MB', name: 'Marie B.',     ago: 'Il y a 2 semaines', stars: 5, text: 'Le suivi est impeccable. Je reçois les tips à temps, les analyses sont bien expliquées.', gain: null },
  { initials: 'KP', name: 'Kevin P.',     ago: 'Il y a 3 semaines', stars: 4, text: 'Bon service dans l\'ensemble. Quelques loosers ce mois mais le bilan reste positif sur la durée.', gain: null },
]

onMounted(() => predStore.fetchPredictions())
</script>

<style scoped>
.home { min-height: 100vh; }

/* HERO */
.hero {
  background: linear-gradient(160deg, var(--surface) 0%, var(--bg) 60%);
  border-bottom: 1px solid var(--border);
  padding: 5rem 1.5rem 4rem;
}
.hero-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}
.hero-left { display: flex; flex-direction: column; gap: 0; }
.hero-badge {
  display: inline-block;
  background: rgba(0,220,130,0.1);
  border: 1px solid rgba(0,220,130,0.3);
  color: var(--accent);
  padding: 0.35rem 1rem;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  width: fit-content;
}
.hero-title {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1rem;
}
.hero-accent { color: var(--accent); }
.hero-sub {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}
.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.btn-lg { padding: 0.75rem 1.75rem; font-size: 1rem; }
.hero-social {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.hero-social strong { color: var(--text); }
.hero-right {
  display: flex;
  justify-content: center;
  align-items: center;
}
.hero-img {
  width: 100%;
  max-width: 480px;
  border-radius: var(--radius-lg);
  object-fit: contain;
}

/* STATS */
.stat-sub {
  display: block;
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 600;
  margin-top: -0.25rem;
  margin-bottom: 0.15rem;
}

/* SECTIONS */
.section-wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 0;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.section-sub {
  text-align: center;
  color: var(--text-muted);
  margin-bottom: 2rem;
  font-size: 0.9rem;
}
.link-more { font-size: 0.85rem; color: var(--accent); }

/* TWO COL */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* MATCH LIST */
.match-list { display: flex; flex-direction: column; gap: 0.75rem; }
.match-row {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.85rem 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
}
.match-row:hover { border-color: var(--accent); }
.match-row-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}
.comp-tag { font-size: 0.75rem; color: var(--text-muted); }
.match-date-tag { font-size: 0.75rem; color: var(--text-muted); }
.match-row-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.team-label { font-size: 0.9rem; font-weight: 600; }
.vs-tag { font-size: 0.8rem; color: var(--text-muted); }
.match-row-tip { display: flex; align-items: center; gap: 0.5rem; }
.tip-chip {
  background: rgba(0,220,130,0.1);
  color: var(--accent);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 600;
}
.odds-chip {
  background: var(--surface2);
  color: var(--text);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 700;
}
.empty-small {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px dashed var(--border);
  font-size: 0.9rem;
}

/* RESULTS TABLE */
.results-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.results-table th {
  padding: 0.6rem 1rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border);
  text-align: left;
}
.results-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
}
.results-table tr:last-child td { border-bottom: none; }
.results-table tr:hover td { background: var(--surface2); }

/* TOOLS */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.tool-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.tool-icon { font-size: 1.5rem; }
.tool-name { font-weight: 700; font-size: 0.95rem; }
.tool-desc { font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; flex: 1; }

/* DIFF */
.diff-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem;
  align-items: center;
}
.diff-vs {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-muted);
  text-align: center;
}
.diff-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}
.diff-card.good { border-color: rgba(0,220,130,0.3); }
.diff-card.bad  { border-color: rgba(255,71,87,0.2); }
.diff-title {
  font-weight: 800;
  font-size: 1rem;
  margin-bottom: 1rem;
}
.diff-card.good .diff-title { color: var(--accent); }
.diff-card.bad  .diff-title { color: var(--danger); }
.diff-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
  align-items: flex-start;
}
.diff-item-icon { font-size: 1.1rem; margin-top: 0.1rem; flex-shrink: 0; }
.diff-item-title { font-weight: 600; font-size: 0.88rem; margin-bottom: 0.2rem; }
.diff-item-desc { font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; }
.diff-result {
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  border-radius: var(--radius);
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
}
.bad-result  { background: rgba(255,71,87,0.1);  color: var(--danger); }
.good-result { background: rgba(0,220,130,0.1);  color: var(--accent); }

/* RÉSULTATS PUBLICS */
.results-public {
  background: var(--surface);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  max-width: 100%;
  padding: 3rem 1.5rem;
}
.results-public-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}
.results-public-text h2 { margin-bottom: 0.75rem; }
.results-public-text p { color: var(--text-muted); line-height: 1.6; }
.results-public-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.pub-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--surface2);
  border-radius: var(--radius);
  padding: 1rem;
}
.pub-val { font-size: 1.5rem; font-weight: 800; }
.pub-lbl { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }

/* LEAGUES */
.leagues-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.league-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s;
}
.league-chip:hover { border-color: var(--accent); }
.league-chip img { width: 20px; height: 20px; object-fit: contain; }
.league-count {
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 700;
}

/* REVIEWS */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.review-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}
.review-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.review-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(0,220,130,0.15);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}
.review-stars { margin-left: auto; color: var(--warning); font-size: 0.85rem; }
.review-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 0.75rem;
}
.review-gain {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--accent);
}

/* CTA FINAL */
.cta-final {
  background: var(--surface);
  border: 1px solid rgba(0,220,130,0.3);
  border-radius: var(--radius-lg);
  padding: 3rem;
  text-align: center;
  margin-bottom: 2.5rem;
}
.cta-final h2 { margin-bottom: 0.75rem; }
.cta-final p { color: var(--text-muted); margin-bottom: 1.5rem; }
.cta-checks {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 1rem;
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* FOOTER */
.footer {
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 3rem 1.5rem 1.5rem;
  margin-top: 2.5rem;
}
.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 3rem;
  margin-bottom: 2rem;
}
.footer-brand p {
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0.75rem 0;
}
.footer-stats {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.82rem;
  color: var(--text-muted);
}
.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.footer-col-title {
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}
.footer-col a,
.footer-col span {
  font-size: 0.85rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
}
.footer-col a:hover { color: var(--text); }
.footer-bottom {
  max-width: 1100px;
  margin: 0 auto;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* UTILS */
.accent { color: var(--accent); }
.fw600  { font-weight: 600; }
.muted  { color: var(--text-muted); }
.sm     { font-size: 0.8rem; }
</style>
