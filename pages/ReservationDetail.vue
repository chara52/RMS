<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
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
  date: '',
});

const reservationId = ref("");

onMounted(() => {
  const storedReservation = localStorage.getItem('selectedReservation');
  if (storedReservation) {
    const parsedReservation = JSON.parse(storedReservation)
    Object.assign(formData, parsedReservation);

    if (parsedReservation.time) {
      const timeParts = parsedReservation.time.split('T');
      formData.date = timeParts[0];
      formData.time = timeParts[1].slice(0, 5);
    }
    reservationId.value = parsedReservation.id;
  }
});

const router = useRouter();

const handleDelete = () => {
  localStorage.removeItem('selectedReservation'); // ローカルストレージから削除
  if (formData.date) {
    router.push(`/ReservationTableCompact?date=${formData.date}`);
  } else {
    router.push('/ReservationTableCompact');
  }
};

const goBackWithDate = () => {
  // 日付が入力されている場合は、その日付をクエリとして渡す
  if (formData.date) {
    router.push(`/ReservationTableCompact?date=${formData.date}`)
  } else {
    router.push('/ReservationTableCompact')
  }
}
</script>

<template>
  <div class="reservation-detail-name">
    <h1 class="global-h1">予約詳細</h1>
  </div>

  <DeleteReservation :id="reservationId" @delete="handleDelete" />
  <EditReservation :id="reservationId" />

  <div class="reservation-table">
    <p><strong>日付 :</strong> {{ formData.date }}</p>
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
  <div class="button-container">
    <button @click="goBackWithDate" class="go-back-btn">戻る</button>
  </div>
</template>

<style scoped>
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

.reservation-detail-name {
  text-align: center;
}

.reservation-table {
  margin-top: 50px;
  background-color: #fff9e6;
  padding: 0.5em 1em;
  border-left: solid 10px #ffc06e;
}

.button-container {
  display: flex;
  gap: 37px;
  margin-top: 20px;
  justify-content: center;
}

.go-back-btn {
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
</style>
