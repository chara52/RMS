<script setup>
import { reactive, ref, computed } from 'vue'
import { createClient } from 'microcms-js-sdk'
import FilteredComponent from './FilteredReservation.vue'
import MenuButtonComponent from './MenuButton.vue'
import DeleteReservation from './DeleteReservation.vue'

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

const handleDelete = (id) => {
  const index = reservations.findIndex((reservation) => reservation.id === id)
  if (index !== -1) {
    reservations.splice(index, 1)
  }
}
</script>

<template>
  <div class="reservation-table">
    <h1>予約表</h1>
  </div>

  <MenuButtonComponent />

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
            <td class="seat-space">{{ reservation.seat }}</td>
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
      <DeleteReservation :id="reservation.id" @delete="(id) => handleDelete(id)" />
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
</style>
