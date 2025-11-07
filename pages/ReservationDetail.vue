<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
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

const formattedPhone = computed(() => {
  const raw = formData.phone.replace(/\D/g, '')
  if (raw.length === 11) {
    return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`
  }
  return formData.phone
})

const formattedDisplayDate = computed(() => {
  if (!formData.date) return ''
  const date = new Date(formData.date)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
  return `${month}月${day}日(${weekday})`
})

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
  <div class="reservation-form">
    <div class="header-row">
      <button type="button" @click="goBackWithDate" class="backbutton">＜</button>
      <h1 class="global-h1">予約詳細</h1>
    </div>

    <DeleteReservation :id="reservationId" @delete="handleDelete" />
    <EditReservation :id="reservationId" />

    <div class="reservation-table">
      <p><strong>日付 :</strong> {{ formattedDisplayDate }}</p>
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
      <p><strong>電話番号 :</strong> {{ formattedPhone }}</p>
      <p><strong>席番号 :</strong> {{ formData.seat }}</p>
    </div>
  </div>
</template>

<style scoped>
.reservation-form {
  max-width: 100%;
  height: 125vh;
  margin: -10px -7px;
  padding: 20px;
}

.header-row {
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F5F5F5;
  border-bottom: 1px solid #ddd;
  margin: -18px -18px 0 -20px;
}

.global-h1 {
  font-size: 20px;
  text-align: center;
  margin-top: 0px;
}

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

.backbutton {
  position: absolute;
  left: 0;
  width: 60px;
  height: 40px;
  color: #fbc02d;
  background-color: #F5F5F5;
  border: 2px solid #F5F5F5;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  margin-top: -7px;
}
</style>
