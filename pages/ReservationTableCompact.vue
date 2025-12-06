<script setup>
import { ref, computed, onMounted } from 'vue'
import { createClient } from 'microcms-js-sdk'
import { sortTime } from '../utils/sortTime.js'
import { addCourseDrink } from '../utils/addCourseDrink.js'
import { useRouter, useRoute } from 'vue-router'
import EditShiftData from '../components/EditShiftData.vue'
import BottomNavigation from '../components/BottomNavigation.vue'
import { sortPeople } from '../utils/sortPeople.js'
import { sortSeat } from '../utils/sortSeat.js'
import CalendarPicker from '../components/CalendarPicker.vue'
import MenuButton from '../components/MenuButton.vue'

defineProps({ reservationsDetail: Array });

const router = useRouter();
const route = useRoute();

const goToDetail = (reservation) => {
  localStorage.setItem('selectedReservation', JSON.stringify(reservation));
  router.push('/ReservationDetail');
};

const shiftClient = createClient({
  serviceDomain: import.meta.env.VITE_SHIFT_DOMAIN,
  apiKey: import.meta.env.VITE_SHIFT_API_KEY,
})

const reservations = ref([]);
const originalReservations = ref([]);
const shiftList = ref([]);
const inputDate = ref('');
const activeSort = ref('');

// Firestoreから予約データを取得（onMountedで実行）
const fetchReservations = async () => {
  try {
    const response = await fetch('/api/reservations')
    if (!response.ok) {
      throw new Error('予約データの取得に失敗しました')
    }
    const data = await response.json()
    originalReservations.value = reverseArray(data.reservations);
    reservations.value = [...originalReservations.value];
  } catch (err) {
    alert('予約データ取得エラー:', err)
  }
}

onMounted(async () => {
  // 予約データを取得
  await fetchReservations()

  if (!inputDate.value) {
    const now = new Date()
    inputDate.value = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
  if (route.query.date) {
    inputDate.value = route.query.date
  }

  // 削除後に戻ってきた場合の処理
  router.afterEach(async (to) => {
    if (to.path === '/ReservationTableCompact') {
      await fetchReservations()
    }
  })
});

function handleDateSelected(date) {
  inputDate.value = date
}

shiftClient.getList({
  endpoint: 'shiftdata',
  queries: { limit: 100 }
})
.then((res) => {
  shiftList.value = res.contents
})
.catch((err) => alert(err))

const filteredReservations = computed(() => {
  let filtered;

  if (!inputDate.value) {
    // 休みという情報を持つ予約を除外する
    filtered = reservations.value.filter((reservation) => reservation.info !== '休み');
  } else {
    filtered = reservations.value.filter((reservation) => {
      const reservationDate = reservation.time?.split('T')[0];
      return reservationDate && inputDate.value === reservationDate && reservation.info !== '休み';
    });
  }

  return filtered;
});

const isHoliday = computed(() => {
  if (!inputDate.value) return false;
  return reservations.value.some((reservation) => {
    const reservationDate = reservation.time?.split('T')[0];
    // 特定の日で、予約データのinfoが”休み”というのが1つでもあったらtrueを返す
    return reservationDate && inputDate.value === reservationDate && reservation.info === '休み';
  });
});

const filteredShiftList = computed(() => {
  if (!inputDate.value) {
    return shiftList.value;
  }
  return shiftList.value.filter((shift) => {
    const shiftDate = shift.date.split('T')[0];
    return inputDate.value === shiftDate;
  });
});

function goToEditShift() {
  router.push({ path: '/EditShift', query: { id: inputDate.value } });
}

function handleSort(type, sortFunction) {
  if (activeSort.value === type) {
    reservations.value = [...originalReservations.value];
    activeSort.value = '';
  } else {
    sortFunction(reservations.value);
    activeSort.value = type;
  }
}

function getTimeFromReservation(timeString) {
  if (!timeString) return '';
  return timeString.split('T')[1]?.slice(0, 5) || '';
}

function reverseArray(arr) {
  const reversed = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    reversed.push(arr[i]);
  }
  return reversed;
}

function setTodayDate(todayStr) {
  inputDate.value = todayStr;
}

function goToNewReservation() {
  if (isHoliday.value) {
    alert('この日は休業日のため予約を作成できません。')
    return
  }

  router.push({
    path: '/ReservationForm',
    query: {
      date: inputDate.value,
      reset: 'true'
    }
  })
}
</script>

<template>
  <MenuButton />
  <div class="reservation-table-name">
    <h1 class="global-h1">予約表</h1>
    <div class="shift-info-container">
      <EditShiftData :id="inputDate" />
      <div v-if="filteredShiftList.length > 0" class="shift-name" @click="goToEditShift">
        {{filteredShiftList.map(shift => shift.name).join(', ')}}
      </div>
      <span v-else class="shift-name" @click="goToEditShift">
        シフトはありません
      </span>
    </div>
    <div class="date-input-group">
      <CalendarPicker :selectedDate="inputDate" @date-selected="handleDateSelected" />
    </div>
  </div>

  <div class="sort-button-group">
    <button @click="handleSort('people', sortPeople)" :class="['sort-button', { active: activeSort === 'people' }]">
      人数順
    </button>
    <button @click="handleSort('seat', sortSeat)" :class="['sort-button', { active: activeSort === 'seat' }]">
      卓順
    </button>
    <button @click="handleSort('time', sortTime)" :class="['sort-button', { active: activeSort === 'time' }]">
      時間順
    </button>
  </div>

  <div class="table-wrapper">
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
            <td class="time-space">{{ getTimeFromReservation(reservation.time) }}</td>
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
      <p class="no-reservations-message" :class="{ 'holiday-text': isHoliday }">{{ isHoliday ? '休み' : '予約はありません' }}</p>
    </div>
  </div>

  <BottomNavigation :selectedDate="inputDate" @setTodayDate="setTodayDate" @goToNewReservation="goToNewReservation" />
</template>

<style scoped>
.reservation-table-name {
  text-align: center;
}

.date-display {
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
  color: #333;
}

.table-wrapper {
  margin-bottom: 100px;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

table th.name {
  width: 20%;
  writing-mode: horizontal-tb;
}

table th.people {
  width: 14%;
  writing-mode: horizontal-tb;
}

table th.time {
  width: 13%;
  writing-mode: horizontal-tb;
}

table th.seat {
  width: 13%;
  writing-mode: horizontal-tb;
}

table th.info {
  width: 40%;
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

.holiday-text {
  color: red;
}

.shift-info-container {
  display: flex;
}

.shift-name {
  padding: 5px 10px;
  border-radius: 4px;
  margin-left: 5px;
  white-space: nowrap;
  font-size: 15px;
}

.sort-button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.sort-button {
  width: 120px;
  height: 35px;
  color: black;
  background-color: #ececec;
  border: 0px;
  border-radius: 25px;
  padding: 0px 10px;
  cursor: pointer;
  font-size: 14.5px;
  font-weight: bold;
}

.sort-button.active {
  background-color: #f9a825;
}

.date-input-group {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 0;
}

.calendar {
  width: 100%;
  max-width: 375px;
  border: 1px solid #ccc;
  padding: 1rem;
  background: white;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  box-sizing: border-box;
  font-size: 16px;
  z-index: 1000;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-size: 16px;
}

.header button {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  color: #007bff;
  font-weight: bold;
}

.header button:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}

.weekdays,
.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.days span {
  cursor: pointer;
  padding: 0.65rem;
}

.days span:nth-child(7n+1) {
  color: #ff4444;
}

.days span:nth-child(7n) {
  color: #007bff;
}

.days span.today {
  color: #007bff;
  font-weight: bold;
}

.days span.selected {
  color: #007bff;
  background-color: #cce5ff;
  border-radius: 50%;
  font-weight: bold;
}

.calender-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.calender-buttons button {
  background: transparent;
  color: #007bff;
  font-size: 16px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.date-display-box {
  width: 100%;
  height: 36px;
  border: 1.5px solid #bbb;
  border-radius: 12px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  color: #333;
  cursor: pointer;
  margin: 8px 0 12px 0;
  box-sizing: border-box;
  font-weight: bold;
  transition: border-color 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.date-display-box:hover {
  border-color: #888;
  background: #fff;
}
</style>
