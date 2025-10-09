<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  startDate: {
    type: String,
    default: ''
  },
  endDate: {
    type: String,
    default: ''
  },
  rounded: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['datesSelected', 'calendarToggle'])

const showCalendar = ref(false)
const selectedStartDate = ref(props.startDate)
const selectedEndDate = ref(props.endDate)
const selectionMode = ref('start')

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

const formattedDateRange = computed(() => {
  if (!selectedStartDate.value && !selectedEndDate.value) return ''

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  }

  if (selectedStartDate.value && selectedEndDate.value) {
    return `${formatDate(selectedStartDate.value)} - ${formatDate(selectedEndDate.value)}`
  } else if (selectedStartDate.value) {
    return `${formatDate(selectedStartDate.value)} - 未選択`
  }
  return ''
})

const dateDisplayBoxStyle = computed(() => ({
  borderRadius: props.rounded ? '12px' : '4px',
  height: props.rounded ? '36px' : '40px',
  border: props.rounded ? '1.5px solid #bbb' : '2px solid rgb(187, 182, 182)',
  fontSize: props.rounded ? '17px' : '16px',
  color: props.rounded ? '#333' : 'black',
  fontWeight: props.rounded ? 'bold' : 'normal',
  fontFamily: 'inherit',
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
  const dateStr = `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  if (selectionMode.value === 'start') {
    selectedStartDate.value = dateStr
    selectedEndDate.value = ''
    selectionMode.value = 'end'
  } else {
    const start = new Date(selectedStartDate.value)
    const end = new Date(dateStr)

    if (end >= start) {
      selectedEndDate.value = dateStr
    } else {
      selectedEndDate.value = selectedStartDate.value
      selectedStartDate.value = dateStr
    }
  }
}

function applySelectedDates() {
  if (selectedStartDate.value && selectedEndDate.value) {
    emit('datesSelected', {
      startDate: selectedStartDate.value,
      endDate: selectedEndDate.value
    })
  }
  showCalendar.value = false
  emit('calendarToggle', false)
}

function resetCalendar() {
  selectedStartDate.value = ''
  selectedEndDate.value = ''
  selectionMode.value = 'start'
  emit('datesSelected', { startDate: '', endDate: '' })
  showCalendar.value = false
  emit('calendarToggle', false)
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

function isInRange(day) {
  if (!selectedStartDate.value || !selectedEndDate.value) return false

  const date = new Date(year.value, month.value, day)
  const start = new Date(selectedStartDate.value)
  const end = new Date(selectedEndDate.value)

  return date >= start && date <= end
}

function isStartDate(day) {
  if (!selectedStartDate.value) return false
  const date = new Date(selectedStartDate.value)
  return (
    day === date.getDate() &&
    month.value === date.getMonth() &&
    year.value === date.getFullYear()
  )
}

function isEndDate(day) {
  if (!selectedEndDate.value) return false
  const date = new Date(selectedEndDate.value)
  return (
    day === date.getDate() &&
    month.value === date.getMonth() &&
    year.value === date.getFullYear()
  )
}

const calendarRef = ref(null)

function handleClickOutside(event) {
  const calendar = calendarRef.value
  const dateInput = event.target.closest('.date-display-box')
  if (calendar && !calendar.contains(event.target) && !dateInput) {
    showCalendar.value = false
    emit('calendarToggle', false)
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
    <div class="date-display-box" @click="showCalendar = true; emit('calendarToggle', true)" :style="dateDisplayBoxStyle">
      {{ formattedDateRange || '期間を選択' }}
    </div>
    <div v-if="showCalendar" class="calendar" ref="calendarRef">
      <div class="header">
        <button type="button" @click="prevMonth">‹</button>
        <div class="header-title">{{ year }}年{{ month + 1 }}月</div>
        <button type="button" @click="nextMonth">›</button>
      </div>
      <div class="selection-info">
        {{ selectionMode === 'start' ? '開始日を選択してください' : '終了日を選択してください' }}
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
            {
              today: isToday(d),
              'in-range': isInRange(d),
              'start-date': isStartDate(d),
              'end-date': isEndDate(d)
            },
            getDayClass(d)
          ]">
          {{ d }}
        </span>
      </div>
      <div class="calender-buttons">
        <button type="button" @click="resetCalendar">リセット</button>
        <button type="button" @click="applySelectedDates" :disabled="!selectedStartDate || !selectedEndDate">完了</button>
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
  max-width: 420px;
  border: 1px solid #ccc;
  padding: 1rem 1rem 0.5rem;
  background: white;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  box-sizing: border-box;
  font-size: 16px;
  z-index: 1000;
  border-radius: 15px;
  overflow: hidden;
  font-family: Arial;
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
  display: flex;
  background: none;
  border: none;
  color: blue;
  font-size: 30px;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 20px;
}

.selection-info {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 0.5rem;
}

.weekdays, .days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.weekdays span {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0;
  color: rgb(164, 164, 164);
  font-size: 14px;
}

.weekdays .sunday {
  color: red;
}

.weekdays .saturday {
  color: blue;
}

.days span {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 45px;
  box-sizing: border-box;
  font-size: 20px;
  cursor: pointer;
  position: relative;
}

.days span.today {
  color: blue;
  font-weight: bold;
}

.days span.today:not(.start-date):not(.end-date) {
  color: rgb(0, 130, 255);
  font-weight: normal;
}

.days span.in-range:not(.start-date):not(.end-date) {
  background-color: #e6f2ff;
}

.days span.start-date,
.days span.end-date {
  color: white;
  font-weight: bold;
}

.days span.start-date::before,
.days span.end-date::before {
  content: '';
  position: absolute;
  width: 40px;
  height: 40px;
  background-color: rgb(42, 152, 254);
  border-radius: 50%;
  z-index: -1;
}

.days .sunday {
  color: red;
}

.days .saturday {
  color: blue;
}

.days .sunday.start-date,
.days .sunday.end-date,
.days .saturday.start-date,
.days .saturday.end-date {
  color: white;
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

.calender-buttons button:disabled {
  color: #ccc;
  cursor: not-allowed;
}
</style>
