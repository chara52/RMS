<script setup>
import { reactive, ref, computed } from 'vue'
import { createClient } from 'microcms-js-sdk'
import FilteredComponent from './FilteredReservation.vue'
import MenuButtonComponent from './MenuButton.vue'
import DeleteReservation from './DeleteReservation.vue'
import EditReservation from './EditReservation.vue'

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
  <div class="reservation-table-name">
    <h1>予約表</h1>
  </div>

  <MenuButtonComponent />

  <FilteredComponent v-on:input-Date="recordDate" />

  <div v-if="reservations.length > 0">
    <table border="1" width="100%">
      <tbody>
        <tr>
          <th class="name">名前</th>
          <th class="people">人数</th>
          <th class="time">時間</th>
          <th class="seat">卓</th>
          <th class="info">詳細</th>
          <th class="phone">電話番号</th>
        </tr>
      </tbody>
      <tbody>
        <tr v-for="reservation in filteredReservations" :key="reservation.id">
          <td class="name-space">{{ reservation.name }}</td>
          <td class="number-space">{{ reservation.people }}</td>
          <td class="time-space">{{ reservation.time.split('T')[1].slice(0, 5) }}</td>
          <td class="seat-space">{{ reservation.seat }}</td>
          <td class="info-space">{{ reservation.info }}</td>
          <td class="phone-space">{{ reservation.phone }}</td>
          <DeleteReservation :id="reservation.id" @delete="(id) => handleDelete(id)" />
            <EditReservation :id="reservation.id" />
        </tr>
      </tbody>
    </table>
  </div>

  <div v-else>
    <p>現在、予約はありません。</p>
  </div>
</template>

<style scoped>
.reservation-table-name {
  text-align: center;
}

@media (max-width: 768px) {
  table {
    border-collapse: collapse;
    table-layout: fixed; /* 幅を決める */
  }

  table th.name {
    width: 15%;
    writing-mode: horizontal-tb;  /* 横書きに変換 */
  }

  table th.people {
    width: 10%;
    writing-mode: horizontal-tb;
  }

  table th.time {
    width: 15%;
    writing-mode: horizontal-tb;
  }

  table th.seat {
    width: 10%;
    writing-mode: horizontal-tb;
  }

  table th.info {
    width: 25%;
    writing-mode: horizontal-tb;
  }

  table th.phone {
    width: 25%;
    writing-mode: horizontal-tb;
  }

  table tr {
    height: 70px;  /* 枠の縦幅を調整 */
    background-color: #fff9e6;
  }

  .name-space,
  .number-space,
  .time-space,
  .seat-space,
  .inf-space,
  .phone-space {
    font-size: 13px;
    text-align: center;
    white-space: normal; /* 枠の中に入らなかった場合自動で改行 */
  }
}
</style>
