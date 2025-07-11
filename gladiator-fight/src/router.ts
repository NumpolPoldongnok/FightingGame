import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import PrepareScene from './components/PrepareScene.vue'
import FightScene from './components/FightScene.vue'
import ResultScene from './components/ResultScene.vue'
import App from './App.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/prepare' },
  { path: '/prepare', component: PrepareScene },
  { path: '/fight', component: FightScene },
  { path: '/result', component: ResultScene },
  { path: '/:pathMatch(.*)*', redirect: '/prepare' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
