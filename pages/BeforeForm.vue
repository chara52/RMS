<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { createClient } from 'microcms-js-sdk'
import { useRouter } from 'vue-router'
import FilteredComponent from '../components/FilteredReservation.vue'
import MenuButtonComponent from '../components/MenuButton.vue'
import { addCourseDrink } from '../utils/addCourseDrink.js'
import { sortPeople } from '../utils/sortPeople.js'
import { sortSeat } from '../utils/sortSeat.js'


defineProps({ reservationsDetail: Array });

const router = useRouter();

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
  })
  .catch((err) => console.error(err))

const inputDate = ref(null)

onMounted(() => {
  const now = new Date()
  inputDate.value = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
})

const recordDate = (date) => {
  inputDate.value = date
}

const filteredReservations = computed(() => {
  if (!inputDate.value) {
    return reservations
  }
  return reservations.filter((reservation) => {
    const reservationDate = reservation.time.split('T')[0]
    return inputDate.value === reservationDate
  })
})

</script>

<template>
  <div class="reservation-table-name">
    <h1>予約確認</h1>
  </div>

  <MenuButtonComponent />

  <FilteredComponent v-model:inputDate="inputDate" v-on:update:inputDate="recordDate" />

  <div class="button-container1">
    <button @click="sortPeople(reservations)" class="bc1">人数順</button>
    <button @click="sortSeat(reservations)" class="bc1">卓順</button>
  </div>

  <div v-if="reservations.length > 0">
    <table border="1" width="100%">
      <tbody>
        <tr>
          <th class="name">名前</th>
          <th class="people">人数</th>
          <th class="seat">卓</th>
          <th class="info">詳細</th>
        </tr>
      </tbody>
      <tbody>
        <tr v-for="reservation in filteredReservations" :key="reservation.id">
            <td class="name-space">{{ reservation.name }}</td>
            <td class="number-space">{{ reservation.people }}</td>
            <td class="seat-space">{{ reservation.seat }}</td>
            <td class="info-space">
              <div v-if="addCourseDrink(reservation.course, reservation.drink) !== '0込'">
                {{ addCourseDrink(reservation.course, reservation.drink) }}
              </div>
              <div>
                {{ reservation.info }}
              </div>
            </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-else>
    <p>現在、予約はありません。</p>
  </div>

  <div class="button-container2">
    <button @click="router.push('/')" class="bc2">戻る</button>
    <button @click="router.push('ReservationForm')" class="bc2">予約へ</button>
  </div>
</template>

<style scoped>
.reservation-table-name {
  text-align: center;
}

@media (max-width: 768px) {
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    /* 幅を決める */
  }

  table th.name {
    width: 25%;
    writing-mode: horizontal-tb;
    /* 横書きに変換 */
  }

  table th.people {
    width: 15%;
    writing-mode: horizontal-tb;
  }

  table th.seat {
    width: 20%;
    writing-mode: horizontal-tb;
  }

  table th.info {
    width: 35%;
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

  .button-container1 {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 13px;
  }

  .button-container2 {
    display: flex;
    justify-content: center;
    gap: 19px;
    margin-top: 18px;
  }

  .bc1 {
    width: 180px;
    height: 40px;
    background-color: #ffcb46;
    border: 2px solid #565655;
    border-radius: 12px;
    padding: 4px 60px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
  }

  .bc2 {
    width: 180px;
    height: 63px;
    background-color: #fbc02d;
    border: 2px solid #565655;
    border-radius: 12px;
    padding: 5px 20px;
    cursor: pointer;
    font-size: 24px;
    font-weight: bold;
  }

  button:hover {
    background-color: #f9a825;
  }
}
</style>
