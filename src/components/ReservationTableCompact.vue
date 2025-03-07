<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { createClient } from 'microcms-js-sdk'
import FilteredComponent from './FilteredReservation.vue'
import MenuButtonComponent from './MenuButton.vue'
import { sortReservations } from '../utils/sortReservations.js'
import { useRouter } from 'vue-router'

defineProps({ reservationsDetail: Array });

const router = useRouter();

const goToDetail = (reservation) => {
  localStorage.setItem('selectedReservation', JSON.stringify(reservation)); // 予約情報を保存
  router.push('/detail'); // /detail に遷移
};

const client = createClient({
  serviceDomain: import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.VITE_API_KEY,
})

const reservations = reactive([])

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

const inputDate = ref(null)

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
  <div class="reservation-table-name">
    <h1>予約表</h1>
  </div>

  <MenuButtonComponent />

  <FilteredComponent v-on:input-Date="recordDate" />

  <div v-if="reservations.length > 0">
    <table border="1" width="100%">
      <tbody>
        <tr>
          <th class="name">名前</th>
          <th class="people">人数</th>
          <th class="time">時間</th>
          <th class="seat">卓</th>
          <th class="info">詳細</th>
        </tr>
      </tbody>
      <tbody>
        <tr v-for="reservation in filteredReservations" :key="reservation.id" @click="goToDetail(reservation)">
            <td class="name-space">{{ reservation.name }}</td>
            <td class="number-space">{{ reservation.people }}</td>
            <td class="time-space">{{ reservation.time.split('T')[1].slice(0, 5) }}</td>
            <td class="seat-space">{{ reservation.seat }}</td>
            <td class="info-space">{{ reservation.info }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-else>
    <p>現在、予約はありません。</p>
  </div>
</template>

<style scoped>
.reservation-table-name {
  text-align: center;
}

@media (max-width: 768px) {
  table {
    width: auto;
    border-collapse: collapse;
    table-layout: fixed;
    /* 幅を決める */
  }

  table th.name {
    width: 15%;
    writing-mode: horizontal-tb;
    /* 横書きに変換 */
  }

  table th.people {
    width: 10%;
    writing-mode: horizontal-tb;
  }

  table th.time {
    width: 15%;
    writing-mode: horizontal-tb;
  }

  table th.seat {
    width: 10%;
    writing-mode: horizontal-tb;
  }

  table th.info {
    width: 65%;
    writing-mode: horizontal-tb;
  }

  table tr {
    height: 70px;
    /* 枠の縦幅を調整 */
    background-color: #fff9e6;
  }

  .name-space,
  .number-space,
  .time-space,
  .seat-space,
  .info-space {
    font-size: 13px;
    text-align: center;
    white-space: normal;
    /* 枠の中に入らなかった場合自動で改行 */
  }
}
</style>
