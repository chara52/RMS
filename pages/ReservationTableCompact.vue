<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { createClient } from 'microcms-js-sdk'
import { sortTime } from '../utils/sortTime.js'
import { addCourseDrink } from '../utils/addCourseDrink.js'
import { useRouter, useRoute } from 'vue-router'
import EditShiftData from '../components/EditShiftData.vue'
import BottomNavigation from '../components/BottomNavigation.vue'
import { sortPeople } from '../utils/sortPeople.js'
import { sortSeat } from '../utils/sortSeat.js'

defineProps({ reservationsDetail: Array });

const router = useRouter();
const route = useRoute();

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

const reservations = ref([]);
const originalReservations = ref([]);
const shiftList = ref([]);
const inputDate = ref('');
const activeSort = ref('');

const showCalendar = ref(false)
const selectedDate = ref('')
const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth())
const weekdays = ['日', '月', '火', '水', '木', '金', '土']

const firstDay = computed(() => {
  return new Date(year.value, month.value, 1).getDay()
})

const daysInMonth = computed(() => {
  return new Date(year.value, month.value + 1, 0).getDate()
})

const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = weekdays[date.getDay()]
  return `${month}月${day}日(${weekday})`
})

function selectDate(day) {
  selectedDate.value = `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function applySelectedDate() {
  if (selectedDate.value) {
    inputDate.value = selectedDate.value
  }
  showCalendar.value = false
}

function resetCalendar() {
  selectedDate.value = ''
  inputDate.value = ''
  showCalendar.value = false
}

function prevMonth() {
  if (month.value === 0) {
    month.value = 11
    year.value -= 1
  } else {
    month.value -= 1
  }
}

function nextMonth() {
  if (month.value === 11) {
    month.value = 0
    year.value += 1
  } else {
    month.value += 1
  }
}

function isToday(day) {
  const today = new Date()
  return (
    day === today.getDate() &&
    month.value === today.getMonth() &&
    year.value === today.getFullYear()
  )
}

function isSelected(day) {
  const selected = new Date(selectedDate.value)
  return (
    day === selected.getDate() &&
    month.value === selected.getMonth() &&
    year.value === selected.getFullYear()
  )
}

reservationClient.getList({
  endpoint: 'data',
  queries: { limit: 100 }
})
  .then((res) => {
    originalReservations.value = reverseArray(res.contents);
    reservations.value = [...originalReservations.value];
  })
  .catch((err) => console.error(err))

const dateInputGroupRef = ref(null)
const calendarRef = ref(null)

function handleClickOutside(event) {
  const calendar = calendarRef.value
  const dateInputGroup = dateInputGroupRef.value
  if (
    calendar && !calendar.contains(event.target) &&
    dateInputGroup && !dateInputGroup.contains(event.target)
  ) {
    showCalendar.value = false
  }
}

onMounted(() => {
  if (!inputDate.value) {
    const now = new Date()
    inputDate.value = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
  if (route.query.date) {
    inputDate.value = route.query.date
  }
  document.addEventListener('click', handleClickOutside)
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(inputDate, (newVal) => {
  if (newVal) {
    selectedDate.value = newVal
  }
})

shiftClient.getList({
  endpoint: 'shiftdata',
  queries: { limit: 100 }
})
  .then((res) => {
    shiftList.value = res.contents
  })
  .catch((err) => console.error(err))

const filteredReservations = computed(() => {
  if (!inputDate.value) {
    return reservations;
  }
  return reservations.value.filter((reservation) => {
    const reservationDate = reservation.time.split('T')[0];
    return inputDate.value === reservationDate;
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

function reverseArray(arr) {
  const reversed = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    reversed.push(arr[i]);
  }
  return reversed;
}
</script>

<template>
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
    <div class="date-input-group" ref="dateInputGroupRef">
      <div class="date-display-box" @click="showCalendar = true">
        {{ formattedDate }}
      </div>
      <div v-if="showCalendar" class="calendar" ref="calendarRef">
        <div class="header">
          <button type="button" @click="prevMonth">‹</button>
          {{ year }}年{{ month + 1 }}月
          <button type="button" @click="nextMonth">›</button>
        </div>
        <div class="weekdays">
          <span v-for="w in weekdays" :key="w">{{ w }}</span>
        </div>
        <div class="days">
          <span v-for="n in firstDay" :key="'blank' + n"></span>
          <span v-for="d in daysInMonth" :key="d" @click="selectDate(d)" :class="{
            today: isToday(d),
            selected: isSelected(d)
          }">
            {{ d }}
          </span>
        </div>
        <div class="calender-buttons">
          <button type="button" @click="resetCalendar">リセット</button>
          <button type="button" @click="applySelectedDate">完了</button>
        </div>
      </div>
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
  </div>

  <BottomNavigation :selectedDate="inputDate" />
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
  padding: 0 8px;
}

.calendar {
  width: 100%;
  border: 1px solid #ccc;
  padding: 1rem;
  background: white;
  position: absolute;
  box-sizing: border-box;
  font-size: 16px;
  z-index: 1000;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
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
