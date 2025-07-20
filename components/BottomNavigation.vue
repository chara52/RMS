<script setup>
import { useRoute } from 'vue-router'

const route = useRoute();

// 日付を受け取るpropsを定義
defineProps({
  selectedDate: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <nav class="bottom-nav">
    <router-link to="/ReservationTableCompact" class="nav-item" :class="{ active: route.path === '/ReservationTableCompact' }">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <i class="fa-solid fa-house"></i>
      <span>ホーム</span>
    </router-link>
    <router-link :to="`/ReservationForm?reset=true&date=${selectedDate}`" class="nav-item" :class="{ active: route.path === '/ReservationForm' }">
      <i class="fa-solid fa-pen"></i>
      <span>入力</span>
    </router-link>
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
</style>
