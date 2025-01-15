<script setup>
import flatpickr from 'flatpickr' //日付選択コンポーネント
import { Japanese } from 'flatpickr/dist/l10n/ja.js' // 日本語ローカリゼーション
import 'flatpickr/dist/flatpickr.min.css' // flatpickr のスタイルシート
import { reactive, ref, computed, onMounted } from 'vue' // Vue の機能
import { useRouter } from 'vue-router' // ルート制御用

// フォームデータの初期値をリアクティブなオブジェクトとして定義
const formData = reactive({
  name: '', // ユーザー名
  people: '', // 予約人数
  time: '', // 予約時間
  info: '', // 詳細情報
  phone: '', // 電話番号
  seat: '', // 卓番号（未使用）
});

// エラーメッセージを保持するリアクティブ変数
const errorMessage = ref('');

// プロパティ, 電話番号が11桁かつ数字のみかをチェック
const isPhoneNumberValid = computed(() => {
   return formData.phone.length === 11 && /^\d+$/.test(formData.phone)
})

// Vue Router を利用
const router = useRouter()

// 関数（アロー関数）
// 予約データをローカルストレージに保存してページを遷移
const submitReservation = () => {
  const reservations = JSON.parse(localStorage.getItem('reservations')) || []; // 既存データ取得
  reservations.push(formData); // 新しい予約を追加
  localStorage.setItem('reservations', JSON.stringify(reservations)); // 更新後のデータを保存

  if (isPhoneNumberValid.value) {
    errorMessage.value = ''; // エラーをクリア
    alert('予約が送信されました!'); // 確認メッセージ
    router.push('/table'); // 予約表ページへ遷移
  } else {
    errorMessage.value = '携帯電話番号は11桁で入力してください!'; // エラーメッセージ
  }
};

const datepickerRef = ref(null); // flatpickr の参照

// 関数（ユーティリティ関数）
// 日付ピッカーを初期化
onMounted(() => {
  flatpickr(datepickerRef.value, {
    enableTime: true, // 時間選択を有効化
    dateFormat: 'Y-m-d H:i', // 日付フォーマット
    locale: Japanese, // 日本語ロケール
  });
});
</script>

<template>
  <div class="reservation-form">
  <h1>新規受付</h1>
  <form @submit.prevent="submitReservation"> <!-- フォーム送信時に submitReservation を呼び出し -->
    <!-- ヘッダー部分 -->
    <div class="header">
      <div class="buttons">
        <!-- Homeページへのリンク -->
        <button type="button" class="home-button">
          <router-link to="/home">HOME</router-link>
        </button>
        <!-- 予約表ページへのリンク -->
        <button type="button" class="table-button">
          <router-link to="/table">予約表</router-link>
        </button>
      </div>
    </div>

    <!-- 各フォームフィールド -->
    <div class="form-group">
      <label for="name">名前</label>
      <input type="text" id="name" v-model="formData.name" required />
    </div>
    <div class="form-group">
      <label for="people">人数</label>
      <input type="text" id="people" v-model="formData.people" required />
    </div>
    <div class="form-group">
      <label for="time">時間</label>
      <input type="text" id="time" ref="datepickerRef" v-model="formData.time" required />
    </div>
    <div class="form-group">
      <label for="info">詳細情報</label>
      <textarea id="info" v-model="formData.info"></textarea>
    </div>
    <div class="form-group">
      <label for="phone">携帯電話番号</label>
      <input type="tel" id="phone" v-model="formData.phone" required />
    </div>

    <!-- サブミットボタンとエラーメッセージ -->
    <div class="form-group">
      <button type="submit" class="submit-button">予約</button>
      <span class="error-message" v-if="errorMessage">{{ errorMessage }}</span>
    </div>
  </form>
</div>
</template>

<style scoped>
.reservation-form {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fff9e6;
}

h1 {
  font-size: 30px;
  text-align: center;
  margin-top: 0px;
}

.form-group {
  margin-bottom: 15px;
}

.header {
  display: flex;
  justify-content: flex-start;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: -60px;
  margin-bottom: auto;
}

.home-button,
.table-button {
  background-color: #f9ae35;
}

.home-button a,
.table-button a {
  text-decoration: none; /* 下線を無くす */
  color: #000000;
}

/* ボタンにカーソルを合わせた時の動作 */
.home-button a:hover,
.table-button a:hover {
  text-decoration: none; /* カーソルを合わせた時、下線をなくす */
  color: #7d7a7a; /* カーソルを合わせた時、色を変える */
}

.form-group label {
  display: block;
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 19px;
}

.form-group input,
.form-group textarea .submit-button {
  width: 100%;
  padding: 10px;
  border: 2px solid rgb(187, 182, 182);
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group textarea {
  height: 80px;
  width: 100%;
  resize: none;
}

.submit-button {
  background-color: #fbc02d;
  border: 2px solid #565655;
  border-radius: 12px;
  padding: 7px 50px;
  cursor: pointer;
  font-size: 17px;
  font-weight: bold;
}

/* ボタンにカーソルを合わせた時の動作 */
.submit-button:hover {
  background-color: #f9a825;
}

.error-message {
  /* 携帯番号が11桁以外の時のエラーメッセージのCSS */
  color: red;
  font-size: 14px;
  margin-left: 16px;
}
</style>
