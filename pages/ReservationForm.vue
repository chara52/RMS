<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { generateCourseOptions } from '../utils/generateCourseOptions.js'

const formData = reactive({
  name: '',
  people: '',
  time: '',
  course: '',
  drink: '',
  info: '',
  phone: '',
  seat: '',
  date: '',
})

const errorMessage = ref('')
const showDetailInput = ref(false)
const showCalendar = ref(false)
const selectedDate = ref('')

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth())
const weekdays = ['日', '月', '火', '水', '木', '金', '土']

const courseOptions = computed(() => generateCourseOptions())

const isPhoneNumberValid = computed(() => {
  return formData.phone.length === 11 && /^\d+$/.test(formData.phone)
})

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
    formData.date = selectedDate.value
  }
  showCalendar.value = false
}

function resetCalendar() {
  selectedDate.value = ''
  formData.date = ''
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

const router = useRouter()
const route = useRoute()

const submitReservation = () => {
  const errors = []

  if (!selectedDate.value) {
    errors.push('日付が選択されていません。')
  }

  if (!isPhoneNumberValid.value) {
    errors.push('携帯電話番号は11桁で入力してください!')
  }

  if (errors.length > 0) {
    errorMessage.value = errors.join('\n')
    return
  }

  errorMessage.value = ''
  localStorage.setItem("formData", JSON.stringify(formData))
  router.push('/ConfirmReservation')
}

const goBackWithDate = () => {
  if (formData.date) {
    router.push(`/ReservationTableCompact?date=${formData.date}`)
  } else {
    router.push('/ReservationTableCompact')
  }
}

const calendarRef = ref(null)
const timePickerRef = ref(null)

function handleClickOutside(event) {
  const calendar = calendarRef.value
  const dateInput = event.target.closest('input[readonly]')
  if (calendar && !calendar.contains(event.target) && !dateInput) {
    showCalendar.value = false
  }

  const timePicker = timePickerRef.value
  const timeInput = event.target.closest('#time')
  if (timePicker && !timePicker.contains(event.target) && !timeInput) {
    showTimePicker.value = false
  }
}

const showTimePicker = ref(false)
const selectedHour = ref('')
const selectedMinute = ref('')

const hours = Array.from({ length: 6 }, (_, i) => String(i + 17).padStart(2, '0'))
const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

function openCustomTimePicker() {
  showTimePicker.value = true
  if (formData.time) {
    const [h, m] = formData.time.split(':')
    selectedHour.value = h
    selectedMinute.value = m
  } else {
    selectedHour.value = '17'
    selectedMinute.value = '00'
  }
}

function selectHour(h) {
  selectedHour.value = h
  formData.time = `${h}:${selectedMinute.value}`
}

function selectMinute(m) {
  selectedMinute.value = m
  formData.time = `${selectedHour.value}:${m}`
}

function applySelectedTime() {
  formData.time = `${selectedHour.value}:${selectedMinute.value}`
  showTimePicker.value = false
}

function resetTime() {
  formData.time = ''
  selectedHour.value = '00'
  selectedMinute.value = '00'
  showTimePicker.value = false
}

onMounted(() => {
  if (route.query.reset === 'true') {
    localStorage.removeItem('formData')
    Object.assign(formData, {
      name: '',
      people: '',
      time: '',
      course: '',
      drink: '',
      info: '',
      phone: '',
      seat: '',
      date: '',
    })

    if (route.query.date) {
      formData.date = route.query.date
      selectedDate.value = route.query.date
    }
  } else {
    const saved = localStorage.getItem("formData")
    if (saved) {
      Object.assign(formData, JSON.parse(saved))
    }
    if (formData.info && formData.info.trim() !== "") {
      showDetailInput.value = true;
    }
  }

  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="reservation-form">
    <h1 class="global-h1">新規受付</h1>
    <form @submit.prevent="submitReservation">
      <div class="form-group">
        <label for="date" class="label-flex">
          <span class="label-text">日付</span>
          <span class="required-mark">＊</span>
        </label>
        <input type="text" :value="formattedDate" @focus="showCalendar = true" readonly />
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

      <div class="form-group">
        <label for="name" class="label-flex">
          <span class="label-text">名前</span>
          <span class="required-mark">＊</span>
        </label>
        <input type="text" id="name" v-model="formData.name" required />
      </div>

      <div class="form-group">
        <label for="people" class="label-flex">
          <span class="label-text">人数</span>
          <span class="required-mark">＊</span>
        </label>
        <input type="text" id="people" v-model="formData.people" required />
      </div>

      <div class="form-group">
        <label for="time" class="label-flex">
          <span class="label-text">時間</span>
          <span class="required-mark">＊</span>
        </label>
        <input type="text" id="time" :value="formData.time" readonly @click="openCustomTimePicker" />
        <div v-if="showTimePicker" class="time-picker" ref="timePickerRef">
          <div class="time-highlight"></div>
          <div class="time-columns">
            <div class="time-column">
              <div v-for="h in hours" :key="h" :class="{ selected: h === selectedHour }" @click="() => selectHour(h)">
                {{ h }}
              </div>
            </div>
            <span class="colon">:</span>
            <div class="time-column">
              <div v-for="m in minutes" :key="m" :class="{ selected: m === selectedMinute }" @click="() => selectMinute(m)">
                {{ m }}
              </div>
            </div>
          </div>
          <div class="time-buttons">
            <button type="button" @click="resetTime">リセット</button>
            <button type="button" @click="applySelectedTime">完了</button>
          </div>
        </div>
      </div>

      <div class="form-group row">
        <div class="course">
          <label for="course" class="label-flex">
            <span class="label-text">コース</span>
          </label>
          <select id="course" v-model="formData.course" style="color: black;">
            <option v-for="option in courseOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="drink">
          <label for="drink" class="label-flex">
            <span class="label-text">飲み放題</span>
          </label>
          <select id="drink" v-model="formData.drink" style="color: black;">
            <option value="なし">なし</option>
            <option value="2500円（2h）">2500円（2h）</option>
            <option value="3000円（3h）">3000円（3h）</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <button type="button" class="detail-button" @click="showDetailInput = !showDetailInput">詳細⌄</button>
        <textarea v-if="showDetailInput" id="info" v-model="formData.info"></textarea>
      </div>

      <div class="form-group">
        <label for="phone" class="label-flex">
          <span class="label-text">携帯電話番号</span>
          <span class="required-mark">＊</span>
        </label>
        <input type="tel" id="phone" v-model="formData.phone" required />
      </div>

      <div class="form-group">
        <label for="seat" class="label-flex">
          <span class="label-text">席番号</span>
        </label>
        <input type="text" id="seat" v-model="formData.seat" />
      </div>

      <span class="error-message" v-if="errorMessage">{{ errorMessage }}</span>

      <div class="button-container">
        <button type="button" @click="goBackWithDate" class="backbutton">戻る</button>
        <button type="submit" class="reservebutton">確認</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.reservation-form {
  max-width: 100%;
  height: 125vh;
  margin: -10px -7px;
  padding: 20px;
  background-color: #fff9e6;
}

.global-h1 {
  font-size: 20px;
  text-align: center;
  margin-top: -7px;
}

.form-group {
  margin-bottom: 15px;
  position: relative
}

.calendar {
  width: 100%;
  border: 1px solid #ccc;
  padding: 1rem 1rem 0.5rem;;
  background: white;
  position: absolute;
  box-sizing: border-box;
  z-index: 1000;
  border-radius: 15px;
  font-family: Arial;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
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

.weekdays, .days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.weekdays span {
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

.time-picker {
  width: 100%;
  border: 1px solid #ccc;
  padding: 1rem;
  background: white;
  position: absolute;
  box-sizing: border-box;
  font-size: 16px;
  z-index: 1000;
  border-radius: 15px;
}

.time-columns {
  display: flex;
  justify-content: center;
  align-items: center;
}

.time-column {
  height: 120px;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  font-family: Arial;
}

.time-column::-webkit-scrollbar {
  display: none;
}

.time-column div {
  padding: 8px;
  text-align: center;
  font-size: 20px;
}

.time-column div.selected {
  background-color: #cce5ff;
  font-weight: bold;
  border-radius: 4px;
  width: 15vw;
}

.colon {
  font-size: 20px;
  font-weight: bold;
  padding: 0 10px;
}

.time-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  border-top: 1px solid #ccc;
  padding-top: 8px;
  margin-left: -1rem;
  margin-right: -1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  width: calc(100% + 2rem);
  box-sizing: border-box;
}

.time-buttons button {
  background: transparent;
  color: blue;
  font-size: 16px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}

.row {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.course,
.drink {
  flex: 1;
  min-width: 50px;
}

.detail-button {
  color: #3385f9;
  display: flex;
  flex-direction: column;
  border: none;
  outline: none;
  background-color: transparent;
  gap: 8px;
  margin-bottom: auto;
  text-decoration: none;
  font-size: 15px;
}

.form-group input,
.form-group textarea,
select {
  width: 100%;
  height: 40px;
  padding: 10px;
  border: 2px solid rgb(187, 182, 182);
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  color:black;
}

.form-group textarea {
  height: 80px;
  width: 100%;
  resize: none;
}

input[type="time"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 100%;
  height: 40px;
  padding: 10px;
  border: 2px solid rgb(187, 182, 182);
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  color: black;
  text-align: left;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 37px;
  margin-top: 30px;
}

.label-flex {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 19px;
  margin-top: 10px;
  margin-bottom: 5px;
}

.label-text {
  display: inline-block;
}

.required-mark {
  color: red;
  font-size: 10px;
  margin-left: 4px;
}

.backbutton {
  width: 130px;
  height: 45px;
  color: black;
  background-color: #fbc02d;
  border: 2px solid #fbc02d;
  border-radius: 12px;
  cursor: pointer;
  font-size: 17px;
  font-weight: bold;
}

.reservebutton {
  width: 130px;
  height: 45px;
  color: black;
  background-color: #fbc02d;
  border: 2px solid #fbc02d;
  border-radius: 12px;
  cursor: pointer;
  font-size: 17px;
  font-weight: bold;
}

.error-message {
  color: red;
  font-size: 14px;
  margin: 0px;
}
</style>
