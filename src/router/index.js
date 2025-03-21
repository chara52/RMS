import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import ReservationTable from '../components/ReservationTable.vue'
import ReservationTableCompact from '../components/ReservationTableCompact.vue'
import ReservationForm from '../components/ReservationForm.vue'
import EditForm from '../components/EditForm.vue'
import ReservationDetail from '../components/ReservationDetail.vue'
import ConfirmReservation from '../components/ConfirmReservation.vue'
import BeforeForm from '../components/BeforeForm.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/table', component: ReservationTable },
    { path: '/table-compact', component: ReservationTableCompact },
    { path: '/form', component: ReservationForm },
    { path: '/editform', component: EditForm },
    { path: '/detail', component: ReservationDetail },
    { path: '/confirm', component: ConfirmReservation },
    { path: '/before', component: BeforeForm },
  ],
})

export default router
