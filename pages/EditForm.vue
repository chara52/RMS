<script setup>
import flatpickr from 'flatpickr';
import { Japanese } from 'flatpickr/dist/l10n/ja.js';
import 'flatpickr/dist/flatpickr.min.css'
import { reactive, ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { createClient } from 'microcms-js-sdk';
import { generateCourseOptions } from '../utils/generateCourseOptions.js'

const router = useRouter();
const route = useRoute();
const datepickerRef = ref(null);
let datepickerInstance = null;
const errorMessage = ref('');
const courseOptions = computed(() => generateCourseOptions());

const isPhoneNumberValid = computed(() => {
  return formData.phone.length === 11 && /^\d+$/.test(formData.phone)
})

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
});

onMounted(() => {
  // route.query.idで予約IDを取得
  const reservationId = route.query.id;

  client
    .get({
      endpoint: 'data',
      contentId: reservationId,
    })
    .then((res) => {
      Object.assign(formData, res);
      // 日付のフォーマット調整
      formData.time = new Date(res.time).toISOString().slice(0, 16).replace('T', ' ');

      formData.course = String(res.course || '');
      formData.drink = String(res.drink || '');
      initFlatpicker();
    })
    .catch((err) => console.error(err));
})

const submitForm = () => {
  // route.query.idで予約IDを取得
  const reservationId = route.query.id;

  if (!reservationId) {
    console.error("予約IDが取得できませんでした");
    return;
  }

  // fetchはHTTPリクエストを送信するための関数
  fetch(`https://${import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/data/${reservationId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-MICROCMS-API-KEY": import.meta.env.VITE_API_KEY,
    },
    body: JSON.stringify({
      name: formData.name,
      people: formData.people,
      time: formData.time,
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
    router.push('/ReservationTableCompact')
  } else {
    errorMessage.value = '携帯電話番号は11桁で入力してください!' // エラーメッセージ
  }
};

function initFlatpicker() {
  datepickerInstance = flatpickr(datepickerRef.value, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    locale: Japanese,
    defaultDate: formData.time,
    disableMobile: true,
  })
}

watch(() => formData.time, (newTime) => {
  if (datepickerInstance) {
    datepickerInstance.setDate(newTime, false);
  }
});

</script>

<template>
  <div class="reservation-form">
    <h1>予約編集</h1>

    <form @submit.prevent="submitForm">
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
        <input type="text" id="time" ref="datepickerRef" v-model="formData.time" required />
      </div>

      <div class="form-group row">
        <div class="course">
          <label for="course" class="label-flex">
            <span class="label-text">コース</span>
          </label>
          <select id="course" v-model="formData.course">
            <option v-for="option in courseOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="drink">
          <label for="drink" class="label-flex">
            <span class="label-text">飲み放題</span>
          </label>
          <select id="drink" v-model="formData.drink">
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
      <div class="button-container">
        <button type="button" @click="router.push('/ReservationDetail')" class="back-button">戻る</button>
        <button type="submit" class="submit-button">更新</button>
        <span class="error-message" v-if="errorMessage">{{ errorMessage }}</span>
      </div>
    </form>
  </div>
</template>



<style scoped>
.reservation-form {
  max-width: 100%;
  height: 123vh;
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

.buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: -60px;
  margin-bottom: auto;
}

.home-button,
.table-button {
  background-color: #f9ae35;
}

.home-button a,
.table-button a {
  text-decoration: none;
  /* 下線を無くす */
  color: #000000;
}

.form-group input,
.form-group textarea,
select {
  width: 100%;
  padding: 10px;
  border: 2px solid rgb(187, 182, 182);
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
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

.submit-button,
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

.error-message {
  color: red;
  font-size: 14px;
  margin-left: 16px;
}
</style>
