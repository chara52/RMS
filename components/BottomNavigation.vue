<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute();
const router = useRouter();
const isSpinning = ref(false);

const props = defineProps({
  selectedDate: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['setTodayDate']);

const handleHomeClick = () => {
  if (route.path === '/ReservationTableCompact') {
    isSpinning.value = true;
    const today = new Date();
    const todayStr = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');

    emit('setTodayDate', todayStr);
    setTimeout(() => {
      isSpinning.value = false;
    }, 500);
  } else {
    router.push('/ReservationTableCompact');
  }
};

const handleInputClick = async (event) => {
  event.preventDefault();

  if (!props.selectedDate) {
    alert('日付が選択されていません。');
    return;
  }

  try {
    // holiday API から休み期間取得
    const response = await fetch('/api/holidays');
    const data = await response.json();
    const holidays = data.holidays || [];

    // 選択日付が休み期間に含まれるか確認
    const selectedDate = new Date(props.selectedDate);
    const isHoliday = holidays.some((holiday) => {
      const startDate = new Date(holiday.startDate);
      const endDate = new Date(holiday.endDate);
      return selectedDate >= startDate && selectedDate <= endDate;
    });

    // 休み日の場合、アラート表示して終了
    if (isHoliday) {
      alert('選択された日付は休業日のため、予約ができません。別の日付を選択してください。');
      return;
    }

    router.push(`/ReservationForm?reset=true&date=${props.selectedDate}`);
  } catch (err) {
    alert('休業日チェックに失敗しました: ' + err);
    router.push(`/ReservationForm?reset=true&date=${props.selectedDate}`);
  }
};
</script>

<template>
  <nav class="bottom-nav">
    <div class="nav-item" :class="{ active: route.path === '/ReservationTableCompact' }" @click="handleHomeClick">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <i v-if="!isSpinning" class="fa-solid fa-house"></i>
      <i v-else class="fa-solid fa-rotate-left spinning"></i>
      <span>ホーム</span>
    </div>
    <div class="nav-item" :class="{ active: route.path === '/ReservationForm' }" @click="handleInputClick">
      <i class="fa-solid fa-pen"></i>
      <span>入力</span>
    </div>
    <router-link :to="`/Shift?reset=true&date=${selectedDate}`" class="nav-item" :class="{ active: route.path.startsWith('/Shift') }">
      <i class="fa-solid fa-user-pen"></i>
      <span>シフト</span>
    </router-link>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: #F5F5F5;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #ddd;
  z-index: 10;
}

.nav-item {
  flex: 1;
  text-align: center;
  color: #555;
  text-decoration: none;
  font-size: 10px;
  margin-bottom: 25px;
}

.nav-item i {
  display: block;
  font-size: 18px;
  margin-bottom: 3px;
}

.nav-item.active {
  color: #f9a825;
}

.nav-item {
  cursor: pointer;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

.spinning {
  animation: spin 1s linear infinite;
}
</style>
