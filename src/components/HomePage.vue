<script setup></script>

<template>
  <div class="app-container">
    <header>
      <h1>居酒屋 壱</h1>
    </header>
    <main>
      <div class="button-container">
        <router-link to="/table-compact" class="btn-link">
          <button type="button" class="btn">予約表</button>
        </router-link>
        <router-link to="/form" class="btn-link">
          <button type="button" class="btn">新規入力</button>
        </router-link>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 全体のスタイル */
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

/* ヘッダーのスタイル */
header h1 {
  font-size: 2.5em;
  color: white;
  margin: 20px 0;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7); /* テキストを読みやすくする影 */
  background-color: rgba(0, 0, 0, 0.5); /* 半透明の黒背景 */
  padding: 10px 20px; /* 背景色が文字を囲むように調整 */
  border-radius: 10px; /* 背景の角を丸める */
  display: inline-block; /* 背景色を文字幅に合わせる */
}

/* ボタンコンテナ */
.button-container {
  margin-top: 30px; /* 上部の余白を増やしてボタン間隔を広げる */
  display: flex;
  flex-direction: column;
  gap: 20px; /* ボタンの間に20pxの間隔を追加 */
  align-items: center;
}

/* ボタンのスタイル */
.btn {
  font-size: 1.5em;
  width: 150px;
  height: 80px;
  color: white;
  background-color: #f9ae35; /* オレンジ色に変更 */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.btn:hover {
  background-color: #ff4500; /* ホバー時のオレンジ色を少し濃く */
  transform: scale(1.05);
}

.btn:active {
  background-color: #e03e00; /* クリック時のオレンジ色をさらに濃く */
  transform: scale(1);
}
</style>
