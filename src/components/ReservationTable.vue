<script setup>
import { reactive, onMounted } from 'vue';

const reservations = reactive([]);

// コンポーネントがマウントされたとき、一度だけ実行される関数
onMounted(() => {
  // ローカルストレージからデータを取得
  const storedReservations = JSON.parse(localStorage.getItem('reservations')) || [];

  console.log(storedReservations)

  // 現在の配列の内容を置き換える
  reservations.push(...storedReservations);
});
</script>

<template>
  <div class="reservation-table">
    <h1>予約表</h1>
    <!-- Homeや新規予約へのリンク -->
    <div>
      <router-link to="/home">Homeに戻る</router-link>
    </div>
    <div>
      <router-link to="/form">新規予約に戻る</router-link>
    </div>

    <!-- 予約データがある場合 -->
    <div v-if="reservations.length > 0">
      <div v-for="(reservation, index) in reservations" :key="index" class="reservation-entry">

        <!-- 予約情報をテーブル形式で表示 -->
        <table border="1" width="100%">
          <thead>
            <tr>
              <th colspan="8">予約 {{ index + 1 }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>名前</th>
              <td class="name-space">{{ reservation.name || "未指定" }}</td>
              <th>人数</th>
              <td class="number-space">{{ reservation.people || "未指定" }}</td>
              <th>時間</th>
              <td class="time-space">{{ reservation.time || "未指定" }}</td>
              <th>卓番号</th>
              <td class="table-space">{{ reservation.seat || "未指定" }}</td>
            </tr>
            <tr>
              <th>詳細</th>
              <td colspan="7">{{ reservation.info || "なし" }}</td>
            </tr>
            <tr>
              <th>電話番号</th>
              <td colspan="7">{{ reservation.phone || "未指定" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- データがない場合 -->
    <div v-else>
      <p>現在、予約はありません。</p>
    </div>
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
  p {
    color: black;
  }
</style>
