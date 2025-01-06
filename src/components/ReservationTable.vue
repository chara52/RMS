<template>
  <div class="reservation-table">
    <h1>予約表</h1>
  </div>
  <div>
    <router-link to="/home">Homeに戻る</router-link>
  </div>
  <div>
    <router-link to="/form">新規予約に戻る</router-link>
  </div>

  <body v-for="i in 13" :key="i">
    <table border="1" width="100%">
      <tbody>
        <tr>
         <th>名前</th>
         <td class="name-space">&nbsp;</td>
         <th>人数</th>
         <td class="number-space">&nbsp;</td>
         <th>時間</th>
         <td class="time-space">&nbsp;</td>
         <th>卓番号</th>
         <td class="table-space">&nbsp;</td>
        </tr>
        <tr>
          <th>詳細</th>
          <td colspan="7">&nbsp;</td>
        </tr>
        <tr>
          <th>電話番号</th>
          <td colspan="7">&nbsp;</td>
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
