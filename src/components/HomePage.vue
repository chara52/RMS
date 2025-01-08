<script setup></script>

<template>
 <div class="app-container">
    <header>
      <h1>居酒屋 壱</h1>
    </header>
    <main>
      <div class="button-container">
        <router-link to="/table" class="btn-link">
          <button type="button" class="btn">予約表</button>
        </router-link>
        <router-link to="/new-entry" class="btn-link">
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
  margin: 0;
  padding: 0;
  min-height: 100vh; /* ページ全体を覆う */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: url('https://tblg.k-img.com/restaurant/images/Rvw/154487/640x640_rect_154487046.jpg')
    no-repeat center center; /* 背景画像 */
  background-size: cover; /* 画像をページ全体にフィット */
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
  padding: 12px 24px;
  font-size: 1.2em;
  color: white;
  background-color: #ff5733; /* オレンジ色に変更 */
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
