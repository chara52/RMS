import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import ReservationTable from '../components/ReservationTable.vue'
import ReservationForm from '../components/ReservationForm.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/table', component: ReservationTable },
    { path: '/form', component: ReservationForm },
  ],
})

export default router
