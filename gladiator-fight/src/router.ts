import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import PrepareScene from './components/PrepareScene.vue'
import FightScene from './components/FightScene.vue'
import ResultScreen from './components/ResultScreen.vue'
import App from './App.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/prepare' },
  { path: '/prepare', component: PrepareScene },
  { path: '/fight', component: FightScene },
  { path: '/result', component: ResultScreen },
  { path: '/:pathMatch(.*)*', redirect: '/prepare' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
