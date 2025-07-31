<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
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
const courseOptions = computed(() => generateCourseOptions())

const isPhoneNumberValid = computed(() => {
  return formData.phone.length === 11 && /^\d+$/.test(formData.phone)
})

const router = useRouter()

const submitReservation = () => {
  if (isPhoneNumberValid.value) {
    errorMessage.value = ''
    localStorage.setItem("formData", JSON.stringify(formData))
    router.push('/ConfirmReservation')
  } else {
    errorMessage.value = '携帯電話番号は11桁で入力してください!'
  }
}

const route = useRoute()

/*
const openDatePicker = (event) => {
  event.target.focus()

  if (event.target.showPicker) {
    event.target.showPicker()
  }
}
*/

const openTimePicker = (event) => {
  event.target.focus()

  if (event.target.showPicker) {
    event.target.showPicker()
  }
}

const goBackWithDate = () => {
  // 日付が入力されている場合は、その日付をクエリとして渡す
  if (formData.date) {
    router.push(`/ReservationTableCompact?date=${formData.date}`)
  } else {
    router.push('/ReservationTableCompact')
  }
}

const showCalendar = ref(false)
const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth())
const selectedDate = ref('')

const weekdays = ['日', '月', '火', '水', '木', '金', '土']

const firstDay = computed(() => {
  return new Date(year.value, month.value, 1).getDay()
})

const daysInMonth = computed(() => {
  return new Date(year.value, month.value + 1, 0).getDate()
})

function selectDate(day) {
  selectedDate.value = `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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

const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
  return `${month}月${day}日(${weekday})`
})

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
        <!--input type="date" id="date" v-model="formData.date" required @click="openDatePicker" /-->
        <input type="text" :value="formattedDate" @focus="showCalendar = true" readonly />
        <div v-if="showCalendar" class="calendar">
          <div class="header">
            <button @click="prevMonth">‹</button>
            {{ year }}年{{ month + 1 }}月
            <button @click="nextMonth">›</button>
          </div>
          <div class="weekdays">
            <span v-for="w in weekdays" :key="w">{{ w }}</span>
          </div>
          <div class="days">
            <span v-for="n in firstDay" :key="'blank' + n"></span>
            <span
              v-for="d in daysInMonth"
              :key="d"
              @click="selectDate(d)"
            >
              {{ d }}
            </span>
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
        <input type="time"  id="time" v-model="formData.time" required @click="openTimePicker" />
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
.calendar {
  border: 1px solid #ccc;
  padding: 1rem;
  background: white;
  position: absolute;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.weekdays, .days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}
.days span {
  cursor: pointer;
  padding: 0.25rem;
}

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

input[type="date"],
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
  /* 携帯番号が11桁以外の時のエラーメッセージのCSS */
  color: red;
  font-size: 14px;
  margin-left: 40px;
}
</style>
