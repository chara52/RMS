<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  selectedDate: {
    type: String,
    default: ''
  },
  rounded: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['dateSelected'])

const showCalendar = ref(false)
const selectedDate = ref(props.selectedDate)

watch(() => props.selectedDate, (newVal) => {
  selectedDate.value = newVal
}, { immediate: true })

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
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
  return `${month}月${day}日(${weekday})`
})

const dateDisplayBoxStyle = computed(() => ({
  borderRadius: props.rounded ? '12px' : '4px',
  height: props.rounded ? '36px' : '40px',
  border: props.rounded ? '1.5px solid #bbb' : '2px solid rgb(187, 182, 182)',
  fontSize: props.rounded ? '17px' : '16px',
  color: props.rounded ? '#333' : 'black',
  fontWeight: 'bold',
  margin: props.rounded ? '8px 0 12px 0' : '0',
  padding: props.rounded ? '0' : '10px',
  boxShadow: props.rounded ? '0 1px 2px rgba(0, 0, 0, 0.03)' : 'none'
}))

function getDayClass(day) {
  const date = new Date(year.value, month.value, day)
  const weekday = date.getDay()
  if (weekday === 0) return 'sunday'
  if (weekday === 6) return 'saturday'
  return ''
}

function selectDate(day) {
  selectedDate.value = `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function applySelectedDate() {
  if (selectedDate.value) {
    emit('dateSelected', selectedDate.value)
  }
  showCalendar.value = false
}

function resetCalendar() {
  selectedDate.value = ''
  emit('dateSelected', '')
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

const calendarRef = ref(null)

function handleClickOutside(event) {
  const calendar = calendarRef.value
  const dateInput = event.target.closest('.date-display-box')
  if (calendar && !calendar.contains(event.target) && !dateInput) {
    showCalendar.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="calendar-picker">
    <div class="date-display-box" @click="showCalendar = true" :style="dateDisplayBoxStyle">
      {{ formattedDate }}
    </div>
    <div v-if="showCalendar" class="calendar" ref="calendarRef">
      <div class="header">
        <button type="button" @click="prevMonth">‹</button>
        <div class="header-title">{{ year }}年{{ month + 1 }}月</div>
        <button type="button" @click="nextMonth">›</button>
      </div>
      <div class="weekdays">
        <span v-for="(w, i) in weekdays" :key="w" :class="{
            sunday: i === 0,
            saturday: i === 6
          }">
          {{ w }}
        </span>
      </div>
      <div class="days">
        <span v-for="n in firstDay" :key="'blank' + n"></span>
        <span v-for="d in daysInMonth" :key="d" @click="selectDate(d)" :class="[
            { today: isToday(d), selected: isSelected(d) },
            getDayClass(d)
          ]">
          {{ d }}
        </span>
      </div>
      <div class="calender-buttons">
        <button type="button" @click="resetCalendar">リセット</button>
        <button type="button" @click="applySelectedDate">完了</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-picker {
  position: relative;
}

.date-display-box {
  width: 100%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
  transition: border-color 0.2s;
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

.weekdays, .days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.weekdays span {
  padding: 0.5rem;
  font-weight: bold;
}

.weekdays .sunday {
  color: red;
}

.weekdays .saturday {
  color: blue;
}

.days span {
  cursor: pointer;
  padding: 0.65rem;
}

.days span.today {
  color: blue;
  font-weight: bold;
}

.days span.today:not(.selected) {
  color: rgb(0, 130, 255);
  font-weight: normal;
}

.days span.selected {
  color: blue;
  background-color: #cce5ff;
  border-radius: 50%;
  font-weight: bold;
}

.days span.today.selected {
  color: white;
  background-color: rgb(42, 152, 254);
}

.days .sunday {
  color: red;
}

.days .saturday {
  color: blue;
}

.calender-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #ccc;
  margin-left: -1rem;
  margin-right: -1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  width: calc(100% + 2rem);
  box-sizing: border-box;
}

.calender-buttons button {
  background: transparent;
  color: blue;
  font-size: 16px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
