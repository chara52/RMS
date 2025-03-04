<script setup>
import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import MenuButtonComponent from './MenuButton.vue'
import DeleteReservation from './DeleteReservation.vue'
import EditReservation from './EditReservation.vue'

const formData = reactive({
  name: '',
  people: '',
  time: '',
  info: '',
  phone: '',
  seat: '',
});

onMounted(() => {
  const reservationId = localStorage.getItem('selectedReservation');
  if (reservationId) {
    Object.assign(formData, JSON.parse(reservationId));
  }
  console.log("予約ID:", reservationId);
});

const router = useRouter();

const handleDelete = () => {
  localStorage.removeItem('selectedReservation'); // ローカルストレージから削除
  router.push('/table-compact');
};
</script>

<template>
<div class="reservation-detail-name">
  <h1>予約詳細</h1>
</div>

<DeleteReservation :id="formData.id" @delete="handleDelete" />
<EditReservation :id="formData.id" />
<MenuButtonComponent />

<div class="reservation-table">
  <p><strong>名前 :</strong> {{ formData.name }}</p>
  <p><strong>人数 :</strong> {{ formData.people }}</p>
  <p><strong>時間 :</strong> {{ formData.time ? formData.time.split('T')[1].slice(0, 5) : '時間未設定' }}</p>
  <p><strong>卓番号 :</strong> {{ formData.seat }}</p>
  <p><strong>詳細 :</strong> {{ formData.info }}</p>
  <p><strong>電話番号 :</strong> {{ formData.phone }}</p>
  </div>
  <router-link to="/table-compact">戻る</router-link>
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
}
.reservation-detail-name {
  text-align: center;
}
.reservation-table {
  margin-top: 50px;
  background-color: #fff9e6;
  padding: 0.5em 1em;
  border-left: solid 10px #ffc06e;
}
</style>
