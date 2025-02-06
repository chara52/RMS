import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import ReservationTable from '../components/ReservationTable.vue'
import ReservationForm from '../components/ReservationForm.vue'
import EditForm from '@/components/EditForm.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/table', component: ReservationTable },
    { path: '/form', component: ReservationForm },
    { path: '/editform', component: EditForm },
  ],
})

export default router
