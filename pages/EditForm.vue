<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createClient } from 'microcms-js-sdk';
import { generateCourseOptions } from '../utils/generateCourseOptions.js'
import TimePicker from '../components/TimePicker.vue'
import CalendarPicker from '../components/CalendarPicker.vue'

const router = useRouter()
const route = useRoute()

const client = createClient({
  serviceDomain: import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.VITE_API_KEY,
});

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
const showTimePicker = ref(false)

const courseOptions = computed(() => generateCourseOptions())

const isPhoneNumberValid = computed(() => {
  return formData.phone.length === 11 && /^\d+$/.test(formData.phone)
})

function handleDateSelected(date) {
  formData.date = date
}

function openCustomTimePicker() {
  showTimePicker.value = true
}

function handleTimePickerApply() {
  showTimePicker.value = false
}

const handleClickOutside = (event) => {
  const timeInput = event.target.closest('#time')
  if (showTimePicker.value && !event.target.closest('.time-picker') && !timeInput) {
    showTimePicker.value = false
  }
}

onMounted(() => {
  const reservationId = route.query.id;

  client
    .get({
      endpoint: 'data',
      contentId: reservationId,
    })
    .then((res) => {
      Object.assign(formData, res);

       if (res.time) {
        const timeParts = res.time.split('T');
        formData.date = timeParts[0];
        formData.time = timeParts[1].slice(0, 5);
      }

      formData.course = String(res.course || '');
      formData.drink = String(res.drink || '');
    })
    .catch((err) => console.error(err));

  document.addEventListener('click', handleClickOutside)
})

const submitForm = () => {
  const reservationId = route.query.id;

  if (!reservationId) {
    console.error("予約IDが取得できませんでした");
    return;
  }

  const combinedTime = formData.date && formData.time
    ? `${formData.date}T${formData.time}:00.000Z`
    : formData.time;

  fetch(`https://${import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/data/${reservationId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-MICROCMS-API-KEY": import.meta.env.VITE_API_KEY,
    },
    body: JSON.stringify({
      name: formData.name,
      people: formData.people,
      time: combinedTime,
      course: Array.isArray(formData.course) ? formData.course : [formData.course],
      drink: Array.isArray(formData.drink) ? formData.drink : [formData.drink],
      info: formData.info,
      phone: formData.phone,
      seat: formData.seat,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('HTTPエラー: ${response.status}');
      }
      return response.json();
    })

  if (isPhoneNumberValid.value) {
    errorMessage.value = ''
    alert('予約が更新されました!')
    if (formData.date) {
      router.push(`/ReservationTableCompact?date=${formData.date}`);
    } else {
      router.push('/ReservationTableCompact');
    }
  } else {
    errorMessage.value = '携帯電話番号は11桁で入力してください!' // エラーメッセージ
  }
};
</script>

<template>
  <div class="reservation-form">
    <h1 class="global-h1">予約編集</h1>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="date" class="label-flex">
          <span class="label-text">日付</span>
          <span class="required-mark">＊</span>
        </label>
        <CalendarPicker
          :selectedDate="formData.date"
          :rounded="false"
          :alignLeft="true"
          @dateSelected="handleDateSelected"
        />
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
        <input type="text" id="time" v-model="formData.time" readonly @click="openCustomTimePicker" />
        <TimePicker
          v-if="showTimePicker"
          v-model="formData.time"
          @apply="handleTimePickerApply"
        />
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
        <label for="info" class="label-flex">
          <span class="label-text">詳細情報</span>
        </label>
        <textarea id="info" v-model="formData.info"></textarea>
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
        <button type="button" @click="router.push('/ReservationDetail')" class="back-button">戻る</button>
        <button type="submit" class="submit-button">更新</button>
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

.back-button {
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

.submit-button {
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
  margin-left: 16px;
}
</style>
