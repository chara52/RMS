<script setup>
</script>

<template>
  <h1>居酒屋  壱</h1>
<body>
 <table border="1" width="100%">
  <tbody>
    <tr>
      <th>名前</th>
      <th>人数</th>
      <th>時間</th>
      <th>詳細</th>
      <th>電話番号</th>
    </tr>
    <tr v-for="i in 14" :key="i">
      <td v-for="j in 5" :key="j">
        &nbsp;
      </td>
    </tr>
   </tbody>
 </table>
</body>
</template>

<style scoped>
</style>
