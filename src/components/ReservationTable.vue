<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { createClient } from 'microcms-js-sdk'
import FilteredComponent from './FilteredReservation.vue'
import MenuButtonComponent from './MenuButton.vue'
import { sortReservations } from '../utils/sortReservations.js'

const client = createClient({
  serviceDomain: import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.VITE_API_KEY,
})

const reservations = reactive([])
const inputDate = ref(null)

client
  .getList({
    endpoint: 'data',
  })
  .then((res) => {
    console.log(res)
    reservations.push(...res.contents)
    sortReservations(reservations)
  })
  .catch((err) => console.error(err))

onMounted(() => {
  const now = new Date()
  inputDate.value = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
})

const recordDate = (date) => {
  inputDate.value = date
  console.log('これは設定した日付です\n', inputDate.value)
  console.log('これはCMSから持ってきた日付です\n', reservations[0].time)
}

const filteredReservations = computed(() => {
  if (!inputDate.value) {
    return reservations
  }
  return reservations.filter((reservation) => {
    const reservationDate = reservation.time.split('T')[0]
    console.log(reservationDate)
    return inputDate.value === reservationDate
  })
})

</script>

<template>
  <h1>予約表</h1>

  <MenuButtonComponent />
  <FilteredComponent v-on:input-Date="recordDate" />

  <div v-if="reservations.length > 0">
    <body v-for="reservation in filteredReservations" :key="reservation.id">
      <div class="reservation-table">
        <p><strong>名前 :</strong> {{ reservation.name }}</p>
        <p><strong>人数 :</strong> {{ reservation.people }}</p>
        <p><strong>時間 :</strong> {{ reservation.time.split('T')[1].slice(0, 5) }}</p>
        <p><strong>卓番号 :</strong> {{ reservation.seat }}</p>
        <p><strong>コース :</strong>
          <span v-if="reservation.course && reservation.course.length > 0">
            {{ reservation.course.join(", ") }}円
          </span>
          <span v-else>
            コースなし
          </span>
        </p>
        <p><strong>飲み放題 :</strong>
          <span v-if="reservation.drink && reservation.drink.length > 0">
            {{ reservation.drink.join(", ") }}
          </span>
          <span v-else>
            飲み放題なし
          </span>
        </p>
        <p><strong>詳細 :</strong> {{ reservation.info }}</p>
        <p><strong>電話番号 :</strong> {{ reservation.phone }}</p>
      </div>
    </body>
  </div>
  <div v-else>
    <p>現在、予約はありません。</p>
  </div>
</template>

<style scoped>
/* スマホ向けのスタイル */
@media (max-width: 768px) {
  table {
    border-collapse: collapse;
    background-color: #fff9e6;
  }

  th {
    writing-mode: vertical-rl;
    /* 縦書きに設定 */
  }

  .name-space {
    font-size: 12px;
    white-space: nowrap;
    /* 自動改行を防ぐ */
  }

  .number-space {
    font-size: 12px;
  }

  .time-space {
    font-size: 12px;
    /* 卓番号が見えるように文字の大きさを調整 */
  }

  .seat-space {
    font-size: 12px;
  }

  .phone-space {
    font-size: 12px;
  }
}

.reservation-table {
  background-color: #fff9e6;
  padding: 0.5em 1em;
  border-left: solid 10px #ffc06e;
}
</style>
