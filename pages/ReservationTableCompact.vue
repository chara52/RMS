<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { createClient } from 'microcms-js-sdk'
import FilteredComponent from '../components/FilteredReservation.vue'
import MenuButtonComponent from '../components/MenuButton.vue'
import { sortTime } from '../utils/sortTime.js'
import { addCourseDrink } from '../utils/addCourseDrink.js'
import { useRouter } from 'vue-router'

defineProps({ reservationsDetail: Array });

const router = useRouter();

const goToDetail = (reservation) => {
  localStorage.setItem('selectedReservation', JSON.stringify(reservation));
  router.push('/ReservationDetail');
};

const reservationClient = createClient({
  serviceDomain: import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.VITE_API_KEY,
})

const shiftClient = createClient({
  serviceDomain: import.meta.env.VITE_SHIFT_DOMAIN,
  apiKey: import.meta.env.VITE_SHIFT_API_KEY,
})

const reservations = reactive([])
reservationClient.getList({
  endpoint: 'data',
})
.then((res) => {
  console.log(res)
  reservations.push(...res.contents)
  sortTime(reservations)
})
.catch((err) => console.error(err))

const inputDate = ref('')
const shiftList = ref([])

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

// 日付が変更されたらシフト情報を取得
watch(inputDate, async (newDate) => {
  if (!newDate) return
  try {
    const res = await shiftClient.getList({
      endpoint: 'shiftdata',
      queries: {
        filters: `date[equals]${newDate}`,
        limit: 100,
      },
    })
    shiftList.value = res.contents
    console.log('取得したシフト:', shiftList.value)
  } catch (error) {
    console.error('シフトデータ取得エラー:', error)
  }
}, { immediate: true })
</script>

<template>
  <div class="reservation-table-name">
    <h1>予約表</h1>
  </div>

  <MenuButtonComponent />

  <FilteredComponent v-model:inputDate="inputDate" v-on:update:inputDate="recordDate" />

  <div>
    <ul v-if="shiftList.length > 0">
      <li v-for="(shift, index) in shiftList" :key="index">
        {{ shift.name }}
      </li>
    </ul>
    <p v-else>シフトはありません。</p>
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
        <tr v-for="reservation in filteredReservations" :key="reservation.id" @click="goToDetail(reservation)">
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
    <p class="no-reservations-message">現在、予約はありません。</p>
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
    width: 50%;
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
  .no-reservations-message {
    text-align: center;
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
</style>
