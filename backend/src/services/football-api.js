/*import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const BASE_URL = 'https://v3.football.api-sports.io'
const API_KEY  = process.env.API_FOOTBALL_KEY

async function apiFetch(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'x-apisports-key': API_KEY
    }
  })
  const data = await res.json()
  return data.response
}

// Matchs du jour pour une ligue
export async function getTodayFixtures(leagueId, season = 2024) {
  const today = new Date().toISOString().split('T')[0]
  return apiFetch(`/fixtures?league=${leagueId}&season=${season}&date=${today}`)
}

// Matchs d'une ligue sur les 7 prochains jours
export async function getUpcomingFixtures(leagueId, season = 2024) {
  const today = new Date().toISOString().split('T')[0]
  return apiFetch(`/fixtures?league=${leagueId}&season=${season}&from=${today}&to=${getDateInDays(7)}`)
}

// Stats d'une équipe
export async function getTeamStats(teamId, leagueId, season = 2024) {
  return apiFetch(`/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`)
}

// H2H entre deux équipes
export async function getH2H(team1Id, team2Id) {
  return apiFetch(`/fixtures/headtohead?h2h=${team1Id}-${team2Id}&last=5`)
}

// Livescore
export async function getLiveFixtures() {
  return apiFetch('/fixtures?live=all')
}

// Cotes d'un match
export async function getOdds(fixtureId) {
  return apiFetch(`/odds?fixture=${fixtureId}&bookmaker=8`) // 8 = Unibet
}

function getDateInDays(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}
*/
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const client = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY }
})

async function apiFetch(endpoint) {
  const { data } = await client.get(endpoint)
  return data.response
}

function getDateInDays(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export async function getUpcomingFixtures(leagueId, season = 2024) {
  const today = new Date().toISOString().split('T')[0]
  const to    = getDateInDays(7)
  return apiFetch(`/fixtures?league=${leagueId}&season=${season}&from=${today}&to=${to}`)
}

export async function getTodayFixtures(leagueId, season = 2024) {
  const today = new Date().toISOString().split('T')[0]
  return apiFetch(`/fixtures?league=${leagueId}&season=${season}&date=${today}`)
}

export async function getTeamStats(teamId, leagueId, season = 2024) {
  return apiFetch(`/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`)
}

export async function getH2H(team1Id, team2Id) {
  return apiFetch(`/fixtures/headtohead?h2h=${team1Id}-${team2Id}&last=5`)
}

export async function getLiveFixtures() {
  return apiFetch('/fixtures?live=all')
}

export async function getOdds(fixtureId) {
  return apiFetch(`/odds?fixture=${fixtureId}&bookmaker=8`)
}
