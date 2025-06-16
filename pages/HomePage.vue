<script setup></script>

<template>
  <div class="app-container">
    <header>
      <h1>居酒屋 壱</h1>
    </header>
    <main>
      <div class="button-container">
        <router-link to="/ReservationTableCompact" class="btn-link">
          <button type="button" class="btn">予約表</button>
        </router-link>
        <router-link to="/BeforeForm" class="btn-link">
          <button type="button" class="btn">新規入力</button>
        </router-link>
        <router-link to="/Shift" class="btn-link">
          <button type="button" class="btn">シフト作成</button>
        </router-link>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  font-family: Arial, sans-serif;
  text-align: center;
  max-width: 100%;
  height: 95vh;
  margin: -10px -7px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff9e6;
}

header h1 {
  font-size: 2.5em;
  color: white;
  margin: 20px 0;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7); /* テキストを読みやすくする影 */
  background-color: rgba(0, 0, 0, 0.5); /* 半透明の黒背景 */
  padding: 10px 20px; /* 背景色が文字を囲むように調整 */
  border-radius: 10px;
  display: inline-block; /* 背景色を文字幅に合わせる */
}

.button-container {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.btn {
  font-size: 1.5em;
  width: 150px;
  height: 80px;
  color: white;
  background-color: #f9ae35;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.btn:hover {
  background-color: #ff4500;
  transform: scale(1.05);
}

.btn:active {
  background-color: #e03e00;
  transform: scale(1);
}
</style>
