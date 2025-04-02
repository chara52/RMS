<script setup>
import flatpickr from 'flatpickr'
import { Japanese } from 'flatpickr/dist/l10n/ja.js'
import 'flatpickr/dist/flatpickr.min.css'
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MenuButtonComponent from '../components/MenuButton.vue'
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
})

const errorMessage = ref('')
const showDetailInput = ref(false)
const courseOptions = computed(() => generateCourseOptions())

const isPhoneNumberValid = computed(() => {
  return formData.phone.length === 11 && /^\d+$/.test(formData.phone)
})

const router = useRouter()

// 関数（アロー関数）
const submitReservation = () => {
  if (isPhoneNumberValid.value) {
    errorMessage.value = ''
    localStorage.setItem("formData", JSON.stringify(formData))
    router.push('/ConfirmReservation')
  } else {
    errorMessage.value = '携帯電話番号は11桁で入力してください!' // エラーメッセージ
  }
}

const datepickerRef = ref(null)

// 関数（ユーティリティ関数）
onMounted(() => {
  flatpickr(datepickerRef.value, {
    enableTime: true, // 時間選択を有効化
    dateFormat: 'Y-m-d H:i',
    locale: Japanese, // 日本語ロケール
  })
})
</script>

<template>
  <MenuButtonComponent />
  <div class="reservation-form">
    <h1>新規受付</h1>
    <form @submit.prevent="submitReservation">
      <div class="form-group">
        <label for="name">名前</label>
        <input type="text" id="name" v-model="formData.name" required />
      </div>

      <div class="form-group">
        <label for="people">人数</label>
        <input type="text" id="people" v-model="formData.people" required />
      </div>

      <div class="form-group">
        <label for="time">時間</label>
        <input type="text" id="time" ref="datepickerRef" v-model="formData.time" required />
      </div>

      <div class="form-group row">
        <div class="course">
          <label for="course">コース</label>
          <select id="course" v-model="formData.course">
            <option v-for="price in courseOptions" :key="price" :value="price.toString()">
              {{ price }}円
            </option>
          </select>
        </div>

        <div class="drink">
          <label for="drink">飲み放題</label>
          <select id="drink" v-model="formData.drink">
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
        <label for="phone">携帯電話番号</label>
        <input type="tel" id="phone" v-model="formData.phone" required />
      </div>

      <div class="form-group">
        <label for="seat">席番号</label>
        <input type="text" id="seat" v-model="formData.seat" />
      </div>

      <span class="error-message" v-if="errorMessage">{{ errorMessage }}</span>

      <div class="button-container">
        <button type="button" @click="router.push('/BeforeForm')" class="backbutton">戻る</button>
        <button type="submit" class="reservebutton">確認</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.reservation-form {
  max-width: 100%;
  height: 95vh;
  margin: -10px -7px;
  padding: 20px;
  background-color: #fff9e6;
}

h1 {
  font-size: 30px;
  text-align: center;
  margin-top: 0px;
}

.form-group {
  margin-bottom: 15px;
}

.header {
  display: flex;
  justify-content: flex-start;
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

.form-group label {
  display: block;
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 19px;
}

.form-group input,
.form-group textarea,
select {
  width: 100%;
  padding: 10px;
  border: 2px solid rgb(187, 182, 182);
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group textarea {
  height: 80px;
  width: 100%;
  resize: none;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 37px;
  margin-top: 40px;
}

.backbutton {
  background-color: #fbc02d;
  border: 2px solid #565655;
  border-radius: 12px;
  padding: 7px 50px;
  cursor: pointer;
  font-size: 17px;
  font-weight: bold;
}

.reservebutton {
  background-color: #fbc02d;
  border: 2px solid #565655;
  border-radius: 12px;
  padding: 7px 50px;
  cursor: pointer;
  font-size: 17px;
  font-weight: bold;
}

.backbutton:hover {
  background-color: #f9a825;
}

.reservebutton:hover {
  background-color: #f9a825;
}

.error-message {
  /* 携帯番号が11桁以外の時のエラーメッセージのCSS */
  color: red;
  font-size: 14px;
  margin-left: 40px;
}
</style>
