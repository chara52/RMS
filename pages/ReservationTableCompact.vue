<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { createClient } from 'microcms-js-sdk'
import FilteredComponent from '../components/FilteredReservation.vue'
import MenuButtonComponent from '../components/MenuButton.vue'
import { sortTime } from '../utils/sortTime.js'
import { addCourseDrink } from '../utils/addCourseDrink.js'
import { useRouter } from 'vue-router'

const showShift = ref(false)

const toggleShift = () => {
  showShift.value = !showShift.value
}

/* テスト用 */

defineProps({ reservationsDetail: Array })

const router = useRouter()

const goToDetail = (reservation) => {
  localStorage.setItem('selectedReservation', JSON.stringify(reservation))
  router.push('/ReservationDetail')
}

const reservationClient = createClient({
  serviceDomain: import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.VITE_API_KEY,
})

const shiftClient = createClient({
  serviceDomain: import.meta.env.VITE_SHIFT_DOMAIN,
  apiKey: import.meta.env.VITE_SHIFT_API_KEY,
})

const reservations = reactive([])
const shiftList = ref([])
const inputDate = ref('')

// 予約データを取得
reservationClient.getList({
  endpoint: 'data',
  queries: { limit: 100 }
})
.then((res) => {
  console.log(res)
  reservations.push(...res.contents)
  sortTime(reservations)
})
.catch((err) => console.error(err))

// 初期値設定
onMounted(() => {
  const now = new Date()
  inputDate.value = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
})

// 日付を記録する関数
const recordDate = (date) => {
  inputDate.value = date
}

//シフトデータの取得
shiftClient.getList({
  endpoint: 'shiftdata',
  queries: { limit: 100 }
})
.then((res) => {
  console.log(res)
  shiftList.value = res.contents
})
.catch((err) => console.error(err))

const filteredReservations = computed(() => {
  if (!inputDate.value) {
    return reservations
  }
  return reservations.filter((reservation) => {
    const reservationDate = reservation.time.split('T')[0]
    return inputDate.value === reservationDate
  })
})

const filteredShiftList = computed(() => {
  if (!inputDate.value) {
    return shiftList.value
  }
  return shiftList.value.filter((shift) => {
    const shiftDate = shift.date.split('T')[0] // 日付フォーマットに合わせて調整してください
    return inputDate.value === shiftDate
  })
})
</script>

<template>
  <div class="reservation-table-name">
    <h1>予約表</h1>
  </div>

  <MenuButtonComponent />

  <div class="shift-section">
  <div class="shift-controls">
    <button @click="goToShiftEdit" class="edit-button">シフト編集</button>
    <button @click="toggleShift" class="toggle-button">
      {{ showShift ? 'シフトを隠す' : 'シフトを表示' }}
    </button>
  </div>

  <div v-if="showShift" class="shift-display">
    <div v-if="filteredShiftList.length > 0" class="shift-list">
      <div v-for="shift in filteredShiftList" :key="shift.id" class="shift-name">
        {{ shift.name }}
      </div>
    </div>
    <p v-else class="shift-list">シフトはありません。</p>
  </div>
</div>


  <FilteredComponent v-model:inputDate="inputDate" v-on:update:inputDate="recordDate" />

  <div class="button-container1">
    <button @click="sortPeople(reservations)" class="bc1">人数順</button>
    <button @click="sortSeat(reservations)" class="bc1">卓順</button>
    <button @click="sortTiime(reservations)" class="bc1">時間順</button>
  </div>

  <div v-if="filteredReservations.length > 0">
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
        <tr
          v-for="reservation in filteredReservations"
          :key="reservation.id"
          @click="goToDetail(reservation)"
        >
          <td class="name-space">{{ reservation.name }}</td>
          <td class="number-space">{{ reservation.people }}</td>
          <td class="time-space">{{ reservation.time.split('T')[1].slice(0, 5) }}</td>
          <td class="seat-space">{{ reservation.seat }}</td>
          <td class="info-space">
            <div>
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
    <p class="no-reservations-message">予約はありません</p>
  </div>
</template>

<style scoped>
table th,
table td {
  text-align: center;
  vertical-align: middle;
}
.sort-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 10px 0;
}

.sort-buttons button {
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 6px;
  background-color: #ffe38f;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sort-buttons button:hover {
  background-color: #ffd75e;
}
.button-container1 {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}
.bc1 {
  width: 120px;
  height: 35px;
  background-color: #ececec;
  border: 0px;
  border-radius: 25px;
  padding: 0px 10px;
  cursor: pointer;
  font-size: 14.5px;
  font-weight: bold;
}

.shift-section {
  margin: 15px 0;
}

.shift-controls {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.edit-button,
.toggle-button {
  background-color: #ececec;
  border: none;
  border-radius: 20px;
  padding: 6px 14px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.edit-button:hover,
.toggle-button:hover {
  background-color: #ddd;
}

.shift-display {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* ← 左寄せ */
  padding-left: 10px;
}

.shift-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-start;
}

.shift-name {
  background-color: #fff9e6;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

/* ここから上はテスト用 */
.reservation-table-name {
  text-align: center;
}

@media (max-width: 768px) {
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  table th.name {
    width: 15%;
    writing-mode: horizontal-tb;
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
    width: 50%;
    writing-mode: horizontal-tb;
  }

  table tr {
    height: 70px;
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
  }
  .no-reservations-message {
    text-align: center;
    font-size: 22px;
    margin-top: 45px;
  }
}

.shift-info {
  background-color: #f9f9f9;
  padding: 10px;
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.shift-info h2 {
  margin-bottom: 5px;
}
.shift-info ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.shift-info li {
  margin: 2px 0;
}

.shift-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.shift-name {
  padding: 5px 10px;
  border-radius: 4px;
}
</style>
