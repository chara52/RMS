<script setup>
import { useRoute } from 'vue-router'

const route = useRoute();
</script>

<template>
  <nav class="bottom-nav">
    <router-link to="/HomePage" class="nav-item" :class="{ active: route.path === '/HomePage' }">
      <i class="fa-solid fa-house"></i>
      <span>ホーム</span>
    </router-link>
    <router-link to="/BeforeForm" class="nav-item" :class="{ active: route.path === '/BeforeForm' }">
      <i class="fa-solid fa-pen"></i>
      <span>入力</span>
    </router-link>
    <router-link to="/ReservationTableCompact" class="nav-item" :class="{ active: route.path === '/ReservationTableCompact' }">
      <i class="fa-solid fa-table"></i>
      <span>予約表</span>
    </router-link>
    <router-link to="/Shift?reset=true" class="nav-item" :class="{ active: route.path.startsWith('/Shift') }">
      <i class="fa-solid fa-user-pen"></i>
      <span>シフト</span>
    </router-link>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 70px;
  background: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #ccc;
  z-index: 10;
}

.nav-item {
  flex: 1;
  text-align: center;
  color: #555;
  text-decoration: none;
  font-size: 12px;
}

.nav-item i {
  display: block;
  font-size: 18px;
  margin-bottom: 4px;
}

.nav-item.active {
  color: #f9a825;
}
</style>
