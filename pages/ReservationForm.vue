<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createClient } from 'microcms-js-sdk'
import { generateCourseOptions } from '../utils/generateCourseOptions.js'
import TimePicker from '../components/TimePicker.vue'
import CalendarPicker from '../components/CalendarPicker.vue'

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

const errors = ref([])
const showDetailInput = ref(false)

const courseOptions = computed(() => generateCourseOptions())

const isPhoneNumberValid = computed(() => {
  return formData.phone.length === 11 && /^\d+$/.test(formData.phone)
})

function handleDateSelected(date) {
  formData.date = date
}

const router = useRouter()
const route = useRoute()

const client = createClient({
  serviceDomain: import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.VITE_API_KEY,
});

const submitReservation = async () => {
  errors.value = []

  if (!formData.date) {
    errors.value.push({ field: 'date', message: '日付を入力してください!' })
  }

  if (!formData.name || formData.name.trim() === '') {
    errors.value.push({ field: 'name', message: '名前を入力してください!' })
  }

  if (!formData.people || formData.people.trim() === '') {
    errors.value.push({ field: 'people', message: '人数を入力してください!' })
  }

  if (!formData.time || formData.time.trim() === '') {
    errors.value.push({ field: 'time', message: '時間を入力してください!' })
  }

  if (!isPhoneNumberValid.value) {
    errors.value.push({ field: 'phone', message: '携帯電話番号は11桁で入力してください!' })
  }

  try {
    if (formData.date) {
      const startTime = `${formData.date}T00:00:00`
      const endTime = `${formData.date}T23:59:59`

      const res = await client.getList({
        endpoint: 'data',
        queries: {
          filters: `time[greater_than]${startTime}[and]time[less_than]${endTime}[and]info[equals]休み`,
          limit: 1
        }
      })

      if (res && res.contents && res.contents.length > 0) {
        errors.value.push({ field: 'date', message: '選択した日は休業日のため予約できません。別の日を選んでください。' })
      }
    }
  } catch (err) {
    console.error('休業日チェックに失敗しました', err)
  }

  if (errors.value.length === 0) {
    localStorage.setItem("formData", JSON.stringify(formData))
    router.push('/ConfirmReservation')
  }
}

const getError = (field) => {
  const err = errors.value.find(err => err.field === field)
  return err ? err.message : ''
}

const goBackWithDate = () => {
  if (formData.date) {
    router.push(`/ReservationTableCompact?date=${formData.date}`)
  } else {
    router.push('/ReservationTableCompact')
  }
}

const timePickerRef = ref(null)

function handleClickOutside(event) {
  const timePicker = timePickerRef.value
  const timeInput = event.target.closest('#time')
  if (timePicker && !timePicker.contains(event.target) && !timeInput) {
    showTimePicker.value = false
  }
}

const showTimePicker = ref(false)

function openCustomTimePicker() {
  showTimePicker.value = true
}

function handleTimePickerApply() {
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
    <div class="header-row">
      <button type="button" @click="goBackWithDate" class="backbutton">＜</button>
      <h1 class="global-h1">新規受付</h1>
    </div>
    <form @submit.prevent="submitReservation">
      <div class="form-group">
        <label for="date" class="label-flex">
          <span class="label-text">日付</span>
          <span class="required-mark">＊</span>
        </label>
        <CalendarPicker :selectedDate="formData.date" :rounded="false" :alignLeft="true"
          @dateSelected="handleDateSelected" :class="{ 'input-error': getError('date') }" />
        <p v-if="getError('date')" class="error">{{ getError('date') }}</p>
      </div>

      <div class="form-group">
        <label for="name" class="label-flex">
          <span class="label-text">名前</span>
          <span class="required-mark">＊</span>
        </label>
        <input type="text" id="name" v-model="formData.name" :class="{ 'input-error': getError('name') }" />
        <p v-if="getError('name')" class="error">{{ getError('name') }}</p>
      </div>

      <div class="form-group">
        <label for="people" class="label-flex">
          <span class="label-text">人数</span>
          <span class="required-mark">＊</span>
        </label>
        <input type="text" id="people" v-model="formData.people" :class="{ 'input-error': getError('people') }" />
        <p v-if="getError('people')" class="error">{{ getError('people') }}</p>
      </div>

      <div class="form-group">
        <label for="time" class="label-flex">
          <span class="label-text">時間</span>
          <span class="required-mark">＊</span>
        </label>
        <input type="text" id="time" :value="formData.time" readonly @click="openCustomTimePicker"
          :class="{ 'input-error': getError('time') }" />
        <TimePicker v-if="showTimePicker" v-model="formData.time" @apply="handleTimePickerApply" />
        <p v-if="getError('time')" class="error">{{ getError('time') }}</p>
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
            <option value="2500円(2h)">2500円(2h)</option>
            <option value="3000円(3h)">3000円(3h)</option>
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
        <input type="tel" id="phone" v-model="formData.phone" :class="{ 'input-error': getError('phone') }" />
        <p v-if="getError('phone')" class="error">{{ getError('phone') }}</p>
      </div>

      <div class="form-group">
        <label for="seat" class="label-flex">
          <span class="label-text">席番号</span>
        </label>
        <input type="text" id="seat" v-model="formData.seat" />
      </div>

      <div class="button-container">
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

.header-row {
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F5F5F5;
  border-bottom: 1px solid #ddd;
  margin: -18px -18px 0 -20px;
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
  padding: 1rem 1rem 0.5rem;
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

.weekdays,
.days {
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
  color: black;
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
  position: absolute;
  left: 0;
  width: 60px;
  height: 40px;
  color: #fbc02d;
  background-color: #F5F5F5;
  border: 2px solid #F5F5F5;
  border-radius: 12px;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  margin-top: -7px;
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

.error {
  white-space: pre-line;
  color: red;
  font-size: 14px;
  margin: 0px;
}

.input-error {
  border: 2px solid red !important;
}
</style>
