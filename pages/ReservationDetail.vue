<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import MenuButtonComponent from '../components/MenuButton.vue'
import DeleteReservation from '../components/DeleteReservation.vue'
import EditReservation from '../components/EditReservation.vue'

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

const reservationId = ref("");

onMounted(() => {
  const storedReservation = localStorage.getItem('selectedReservation');
  if (storedReservation) {
    const parsedReservation = JSON.parse(storedReservation)
    Object.assign(formData, parsedReservation);
    formData.time = new Date(formData.time).toISOString().slice(0, 16).replace('T', ' ');
    reservationId.value = parsedReservation.id;
  }
  console.log("予約ID:", reservationId.value);
});

const router = useRouter();

const handleDelete = () => {
  localStorage.removeItem('selectedReservation'); // ローカルストレージから削除
  router.push('/ReservationTableCompact');
};
</script>

<template>
<div class="reservation-detail-name">
  <h1>予約詳細</h1>
</div>

<DeleteReservation :id="reservationId" @delete="handleDelete" />
<EditReservation :id="reservationId" />
<MenuButtonComponent />

<div class="reservation-table">
    <p><strong>名前 :</strong> {{ formData.name }}</p>
    <p><strong>人数 :</strong> {{ formData.people }}</p>
    <p><strong>時間 :</strong> {{ formData.time }}</p>
    <p><strong>コース :</strong>
      <span v-if="formData.course[0] === 'なし'">

      </span>
      <span v-else-if="formData.course && formData.course.length > 0">
        {{ formData.course.join(", ") }}円
      </span>
    </p>
    <p><strong>飲み放題 :</strong>
      <span v-if="formData.drink[0] === 'なし'">

      </span>
      <span v-else-if="formData.drink && formData.drink.length > 0">
        {{ formData.drink.join(", ") }}
      </span>

    </p>
    <p><strong>詳細 :</strong> {{ formData.info }}</p>
    <p><strong>電話番号 :</strong> {{ formData.phone }}</p>
    <p><strong>席番号 :</strong> {{ formData.seat }}</p>
  </div>
  <router-link to="/ReservationTableCompact">戻る</router-link>
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
