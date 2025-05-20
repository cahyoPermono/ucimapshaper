import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import Home from './views/Home.vue'

const routes = [
  { path: '/', component: Home }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)

// Tambahkan directive global focus jika belum ada
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

app.mount('#app')