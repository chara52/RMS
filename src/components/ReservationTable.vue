<script setup>
import { reactive, onMounted } from 'vue';

const reservations = reactive([]);

onMounted(() => {
  const storedReservations = JSON.parse(localStorage.getItem('reservations')) || [];
  reservations.push(...storedReservations)
  //reservations.value = JSON.parse(localStorage.getItem('reservations')) || [];
});
</script>

<template>
  <div class="reservation-table">
    <h1>予約表</h1>
  </div>
  <div>
    <router-link to="/">Homeに戻る</router-link>
  </div>
  <div>
    <router-link to="/form">新規予約に戻る</router-link>
  </div>

  <body v-for="(reservation, index) in reservations" :key="index">
    <table border="1" width="100%">
      <tbody>
        <tr>
         <th>名前</th>
         <td class="name-space">{{ reservation.name }}</td>
         <th>人数</th>
         <td class="number-space">{{ reservation.people }}</td>
         <th>時間</th>
         <td class="time-space">{{ reservation.time }}</td>
         <th>卓番号</th>
         <td class="table-space">{{ reservation.table }}</td>
        </tr>
        <tr>
          <th>詳細</th>
          <td colspan="7">{{ reservation.info }}</td>
        </tr>
        <tr>
          <th>電話番号</th>
          <td colspan="7">{{ reservation.phone }}</td>
        </tr>
      </tbody>
    </table>
  </body>
</template>

<style>
  table {
    border-collapse: collapse;
  }
  .name-space {
    padding-left: 48px;
  }
  .number-space {
    padding-left: 24px;
  }
  .time-space {
    padding-left: 40px;
  }
  .table-space {
    padding-left: 16px;
  }
  body {
    margin-bottom: 40px;
  }
</style>
