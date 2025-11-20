<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createClient } from 'microcms-js-sdk'

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

const client = createClient({
  serviceDomain: import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.VITE_API_KEY,
});

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
    const startTime = `${props.selectedDate}T00:00:00`;
    const endTime = `${props.selectedDate}T23:59:59`;

    const res = await client.getList({
      endpoint: 'data',
      queries: {
        filters: `time[greater_than]${startTime}[and]time[less_than]${endTime}[and]info[equals]休み`,
        limit: 1
      }
    });

    if (res && res.contents && res.contents.length > 0) {
      alert('この日は休業日のため予約を作成できません。');
      return;
    }

    router.push(`/ReservationForm?reset=true&date=${props.selectedDate}`);
  } catch (err) {
    console.error('休業日チェックに失敗しました', err);
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
