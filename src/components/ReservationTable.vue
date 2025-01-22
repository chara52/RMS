<script setup>
import { reactive, ref, computed } from 'vue'
import { createClient } from 'microcms-js-sdk'
import FilteredComponent from './FilteredReservation.vue'

const client = createClient({
  serviceDomain: 'rms',
  apiKey: 'utks82BKbpBzo3RxwDPLTbuj93Qj4J2T1sTU',
})

const reservations = reactive([])

client
  .getList({
    endpoint: 'data',
  })
  .then((res) => {
    console.log(res)
    reservations.push(...res.contents)
  })
  .catch((err) => console.error(err))

const inputDate = ref(null)
const recordDate = (date) => {
  inputDate.value = date
  console.log('これは設定した日付です\n', inputDate.value)
  console.log('これはCMSから持ってきた日付です\n', reservations[0].time)
}

const filteredReservations = computed(() => {
  if (!inputDate.value) {
    return reservations
  }
  return reservations.filter((reservation) => {
    const reservationDate = reservation.time.split('T')[0]
    console.log(reservationDate)
    return inputDate.value === reservationDate
  })
})

const deleteReservation = (id) => {
  client
    .delete({
      endpoint: 'data',
      contentId: id,
    })
    .then(() => {
      console.log(`${id}を削除`)
      const index = reservations.findIndex((reservation) => reservation.id === id)
      if (index !== -1) {
        reservations.splice(index, 1)
      }
    })
    .catch((err) => {
      console.error('削除失敗: ', err)
    })
}
</script>

<template>
  <div class="reservation-table">
    <h1>予約表</h1>
  </div>
  <div class="button-container">
    <router-link to="/" class="btn-link">
      <button type="button" class="btn">Home</button>
    </router-link>
    <router-link to="/form" class="btn-link">
      <button type="button" class="btn">新規入力</button>
    </router-link>
  </div>

  <FilteredComponent v-on:input-Date="recordDate" />

  <div v-if="reservations.length > 0">
    <body v-for="reservation in filteredReservations" :key="reservation.id">
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
      <button @click="deleteReservation(reservation.id)">削除</button>
    </body>
  </div>

  <div v-else>
    <p>現在、予約はありません。</p>
  </div>
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

/* ボタンコンテナ */
.button-container {
  margin-top: 10px; /* 上部の余白を増やしてボタン間隔を広げる */
  display: flex;
  flex-direction: column;
  gap: 10px; /* ボタンの間に20pxの間隔を追加 */
  align-items: left;
  width: 120px;
  height: 100px;
}

/* ボタンのスタイル */
.btn {
  padding: 10px 12px;
  font-size: 1.2em;
  color: white;
  background-color: #ac7806b1;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.btn:hover {
  background-color: #ac7806f9; /* ホバー時のオレンジ色を少し濃く */
  transform: scale(1.05);
}

.btn:active {
  background-color: #e03e00; /* クリック時のオレンジ色をさらに濃く */
  transform: scale(1);
}
</style>
