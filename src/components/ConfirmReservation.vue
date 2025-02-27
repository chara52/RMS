<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createClient } from 'microcms-js-sdk'
import MenuButtonComponent from './MenuButton.vue'

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
  serviceDomain: 'rms',
  apiKey: import.meta.env.VITE_API_KEY,
})

onMounted(() => {
  const saveData = localStorage.getItem("formData")
  if (saveData) {
    Object.assign(formData, JSON.parse(saveData));
  }
})

const submitReservation = () => {
  client
    .create({
      endpoint: 'data',
      content: {
        name: formData.name,
        people: formData.people,
        time: new Date(formData.time).toISOString(),
        course: Array.isArray(formData.course) ? formData.course : [formData.course],
        drink: Array.isArray(formData.drink) ? formData.drink : [formData.drink],
        info: formData.info,
        phone: formData.phone,
        seat: formData.seat,
      },
    })
    .then((res) => {
      console.log('予約送信完了', res);
      if (confirm('予約を確定しますか？')) {
        router.push('/table');
      }
    })
    .catch((error) => {
      console.error('送信エラー:', error);
    });
};

</script>

<template>
  <MenuButtonComponent />

  <h1>新規受付</h1>

  <div class="reservation-table">
    <p><strong>名前 :</strong> {{ formData.name }}</p>
    <p><strong>人数 :</strong> {{ formData.people }}</p>
    <p><strong>時間 :</strong> {{ formData.time }}</p>
    <p><strong>コース :</strong> {{ formData.course }}円</p>
    <p><strong>飲み放題 :</strong> {{ formData.drink }}</p>
    <p><strong>詳細 :</strong> {{ formData.info }}</p>
    <p><strong>電話番号 :</strong> {{ formData.phone }}</p>
    <p><strong>席番号 :</strong> {{ formData.seat }}</p>
  </div>
  <div class="button-container">
    <button @click="router.push('/form')">戻る</button>
    <button @click="submitReservation">確定</button>
  </div>

</template>

<style scoped>
/* スマホ向けのスタイル */
@media (max-width: 768px) {
  table {
    border-collapse: collapse;
    background-color: #fff9e6;
  }

  th {
    writing-mode: vertical-rl;
    /* 縦書きに設定 */
  }

  .name-space {
    font-size: 12px;
    white-space: nowrap;
    /* 自動改行を防ぐ */
  }

  .number-space {
    font-size: 12px;
  }

  .time-space {
    font-size: 12px;
    /* 卓番号が見えるように文字の大きさを調整 */
  }

  .seat-space {
    font-size: 12px;
  }

  .phone-space {
    font-size: 12px;
  }

  .button-container {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 13px;
  }

  button {
    background-color: #fbc02d;
    border: 2px solid #565655;
    border-radius: 12px;
    padding: 7px 50px;
    cursor: pointer;
    font-size: 17px;
    font-weight: bold;
  }

  button:hover {
    background-color: #f9a825;
  }
}

.reservation-table {
  background-color: #fff9e6;
  padding: 0.5em 1em;
  border-left: solid 10px #ffc06e;
}
</style>
