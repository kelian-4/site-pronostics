import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

import Home        from '../views/Home.vue'
import Login       from '../views/Login.vue'
import Register    from '../views/Register.vue'
import Predictions from '../views/Predictions.vue'
import Livescore   from '../views/Livescore.vue'
import Results     from '../views/Results.vue'
import MatchDetail from '../views/MatchDetail.vue'
import News from '../views/News.vue'
import Admin from '../views/Admin.vue'

const routes = [
  { path: '/',            component: Home },
  { path: '/login',       component: Login },
  { path: '/register',    component: Register },
  { path: '/predictions', component: Predictions, meta: { requiresAuth: true } },
  { path: '/livescore',   component: Livescore,   meta: { requiresAuth: true } },
  { path: '/results',     component: Results,     meta: { requiresAuth: true } },
  { path: '/matches/:id', component: MatchDetail, meta: { requiresAuth: true } },
  { path: '/news',        component: News,        meta: { requiresAuth: true } },
  { path: '/admin', component: Admin, meta: { requiresAuth: true, requiresAdmin: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) return '/login'
    if (to.meta.requiresAdmin && auth.user?.role !== 'admin') return '/'
})

export default router
