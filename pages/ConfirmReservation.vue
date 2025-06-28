<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createClient } from 'microcms-js-sdk'
import MenuButtonComponent from '../components/MenuButton.vue'

const router = useRouter()
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

const client = createClient({
  serviceDomain: import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.VITE_API_KEY,
})

onMounted(() => {
  const saveData = localStorage.getItem("formData")
  if (saveData) {
    Object.assign(formData, JSON.parse(saveData));
  }
})

const submitReservation = () => {
  if (confirm('予約を確定しますか？')) {
    client
      .create({
        endpoint: 'data',
        content: {
          name: formData.name,
          people: formData.people,
          time: formData.time,
          course: Array.isArray(formData.course) ? formData.course : [formData.course],
          drink: Array.isArray(formData.drink) ? formData.drink : [formData.drink],
          info: formData.info,
          phone: formData.phone,
          seat: formData.seat,
        },
      })
      .then((res) => {
        console.log('予約送信完了', res);
        router.push('/ReservationTableCompact');
      })
      .catch((error) => {
        console.error('送信エラー:', error);
      });
  };
}
</script>

<template>
  <MenuButtonComponent />

  <h1>新規受付</h1>

  <div class="reservation-table">
    <p><strong>名前 :</strong> {{ formData.name }}</p>
    <p><strong>人数 :</strong> {{ formData.people }}</p>
    <p><strong>時間 :</strong> {{ formData.time }}</p>
    <p><strong>コース :</strong>
      <span v-if="formData.course === 'なし'">
        なし
      </span>
      <span v-else-if="formData.course">
        {{ formData.course }}円
      </span>
    </p>
    <p><strong>飲み放題 :</strong>
      <span v-if="formData.drink === 'なし'">
        なし
      </span>
      <span v-else-if="formData.drink && formData.drink.length > 0">
        {{ formData.drink }}
      </span>
    </p>
    <p><strong>詳細 :</strong> {{ formData.info }}</p>
    <p><strong>電話番号 :</strong> {{ formData.phone }}</p>
    <p><strong>席番号 :</strong> {{ formData.seat }}</p>
  </div>
  <div class="button-container">
    <button @click="router.push('/ReservationForm')">戻る</button>
    <button @click="submitReservation">予約</button>
  </div>
</template>

<style scoped>
.button-container {
  display: flex;
  justify-content: center;
  gap: 37px;
  margin-top: 20px;
}

button {
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

button:hover {
  background-color: #f9a825;
}

.reservation-table {
  background-color: #fff9e6;
  padding: 0.5em 1em;
  border-left: solid 10px #ffc06e;
}
</style>
