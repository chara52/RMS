<script setup>
import flatpickr from 'flatpickr';
import { Japanese } from 'flatpickr/dist/l10n/ja.js';
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
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      return response.json();
    })

  if (isPhoneNumberValid.value) {
    errorMessage.value = ''
    alert('予約が更新されました!')
    router.push('/table-compact')
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
    <h2>予約編集</h2>

    <form @submit.prevent="submitForm">
      <div>
        <router-link to="/detail">戻る</router-link>
      </div>


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
        <label for="info">詳細情報</label>
        <textarea id="info" v-model="formData.info"></textarea>
      </div>
      <div class="form-group">
        <label for="phone">携帯電話番号</label>
        <input type="tel" id="phone" v-model="formData.phone" required />
      </div>
      <div class="form-group">
        <label for="seat">席番号</label>
        <input type="text" id="seat" v-model="formData.seat" required />
      </div>
      <div class="form-group">
        <button type="submit" class="submit-button">更新</button>
        <span class="error-message" v-if="errorMessage">{{ errorMessage }}</span>
      </div>
    </form>
  </div>
</template>



<style scoped>
.reservation-form {
  max-width: 100%;
  height: 100vh;
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

/* ボタンにカーソルを合わせた時の動作 */
.home-button a:hover,
.table-button a:hover {
  text-decoration: none;
  /* カーソルを合わせた時、下線をなくす */
  color: #7d7a7a;
  /* カーソルを合わせた時、色を変える */
}

.form-group label {
  display: block;
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 19px;
}

.form-group input,
.form-group textarea .submit-button,
select{
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

.submit-button {
  background-color: #fbc02d;
  border: 2px solid #565655;
  border-radius: 12px;
  padding: 7px 50px;
  cursor: pointer;
  font-size: 17px;
  font-weight: bold;
}

/* ボタンにカーソルを合わせた時の動作 */
.submit-button:hover {
  background-color: #f9a825;
}

.error-message {
  /* 携帯番号が11桁以外の時のエラーメッセージのCSS */
  color: red;
  font-size: 14px;
  margin-left: 16px;
}
</style>
