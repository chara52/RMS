<script setup>
import flatpickr from 'flatpickr'
import { Japanese } from 'flatpickr/dist/l10n/ja.js'
import { reactive, ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { createClient } from 'microcms-js-sdk';

const router = useRouter();
const route = useRoute();
const datepickerRef = ref(null)
let datepickerInstance = null;

const client = createClient({
  serviceDomain: 'rms',
  apiKey: 'utks82BKbpBzo3RxwDPLTbuj93Qj4J2T1sTU',
});

const formData = reactive({
  name: '',
  people: '',
  time: '',
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
  fetch(`https://rms.microcms.io/api/v1/data/${reservationId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-MICROCMS-API-KEY": "utks82BKbpBzo3RxwDPLTbuj93Qj4J2T1sTU",
    },
    body: JSON.stringify({
      name: formData.name,
      people: formData.people,
      time: formData.time,
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
  .then((data) => {
    console.log("更新成功:", data);
    alert("予約が更新されました！");
    router.push("/table");
  })
  .catch((err) => {
    console.error("更新失敗", err);
  });
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
    <h2>予約表</h2>

    <form @submit.prevent="submitForm">
      <div>
        <router-link to="/table">戻る</router-link>
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
      </div>
    </form>
  </div>
</template>



<style scoped>
.reservation-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.reservation-form div {
  margin-bottom: 10px;
}
.reservation-form label {
  display: block;
  margin-bottom: 5px;
}
.reservation-form input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.reservation-form button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.reservation-form button:hover {
  background-color: #0056b3;
}
</style>
