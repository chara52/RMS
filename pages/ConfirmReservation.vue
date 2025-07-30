<script setup>
import { reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createClient } from 'microcms-js-sdk'

const router = useRouter()
const formData = reactive({
  name: '',
  people: '',
  time: '',
  course: '',
  drink: '',
  info: '',
  phone: '',
  seat: '',
})

const client = createClient({
  serviceDomain: import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.VITE_API_KEY,
})

const formattedPhone = computed(() => {
  const raw = formData.phone.replace(/\D/g, '')
  if (raw.length === 11) {
    return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`
  }
  return formData.phone
})

onMounted(() => {
  const saveData = localStorage.getItem("formData")
  if (saveData) {
    Object.assign(formData, JSON.parse(saveData));
  }
})

const submitReservation = () => {
  if (confirm('予約を確定しますか？')) {
    const combinedTime = formData.date && formData.time
      ? `${formData.date} ${formData.time}`
      : formData.time || '';

    client
      .create({
        endpoint: 'data',
        content: {
          name: formData.name,
          people: formData.people,
          time: combinedTime,
          course: Array.isArray(formData.course) ? formData.course : [formData.course],
          drink: Array.isArray(formData.drink) ? formData.drink : [formData.drink],
          info: formData.info,
          phone: formData.phone,
          seat: formData.seat,
        },
      })
      .then((res) => {
        console.log('予約送信完了', res);
        // 日付をクエリとして渡して予約表に遷移
        if (formData.date) {
          router.push(`/ReservationTableCompact?date=${formData.date}`);
        } else {
          router.push('/ReservationTableCompact');
        }
      })
      .catch((error) => {
        console.error('送信エラー:', error);
      });
  };
}
</script>

<template>
  <div class="reservation-form">
    <h1 class="global-h1">予約確認</h1>
    <form @submit.prevent="submitReservation">
      <div class="form-group">
        <label for="date" class="label-flex">
          <span class="label-text">日付</span>
          <span class="required-mark">＊</span>
        </label>
        <p class="readonly-text">{{ formData.date }}</p>
      </div>

      <div class="form-group">
        <label for="name" class="label-flex">
          <span class="label-text">名前</span>
          <span class="required-mark">＊</span>
        </label>
        <p class="readonly-text">{{ formData.name }}</p>
      </div>

      <div class="form-group">
        <label for="people" class="label-flex">
          <span class="label-text">人数</span>
          <span class="required-mark">＊</span>
        </label>
        <p class="readonly-text">{{ formData.people }}</p>
      </div>

      <div class="form-group">
        <label for="time" class="label-flex">
          <span class="label-text">時間</span>
          <span class="required-mark">＊</span>
        </label>
        <p class="readonly-text">{{ formData.time }}</p>
      </div>

      <div class="form-group row">
        <div class="course">
          <label for="course" class="label-flex">
            <span class="label-text">コース</span>
          </label>
          <p class="readonly-text">
            <template v-if="formData.course === 'なし'">なし</template>
            <template v-else-if="formData.course">{{ formData.course }} 円</template>
          </p>
        </div>

        <div class="drink">
          <label for="drink" class="label-flex">
            <span class="label-text">飲み放題</span>
          </label>
          <p class="readonly-text">{{ formData.drink }}</p>
        </div>
      </div>

      <div class="form-group">
        <label for="info" class="label-flex">
          <span class="label-text">詳細</span>
        </label>
        <p class="readonly-text">{{ formData.info }}</p>
      </div>

      <div class="form-group">
        <label for="phone" class="label-flex">
          <span class="label-text">携帯電話番号</span>
          <span class="required-mark">＊</span>
        </label>
        <p class="readonly-text">{{ formattedPhone }}</p>
      </div>

      <div class="form-group">
        <label for="seat" class="label-flex">
          <span class="label-text">席番号</span>
        </label>
        <p class="readonly-text">{{ formData.seat }}</p>
      </div>

      <div class="button-container">
        <button type="button" @click="router.push('/ReservationForm')" class="backbutton">戻る</button>
        <button type="submit" class="reservebutton">予約</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.button-container {
  display: flex;
  justify-content: center;
  gap: 37px;
  margin-top: 30px;
}

.reservation-form {
  max-width: 100%;
  height: 125vh;
  margin: -10px -7px;
  padding: 20px;
  background-color: #fff9e6;
}

.global-h1 {
  font-size: 20px;
  text-align: center;
  margin-top: -7px;
}

.form-group {
  margin-bottom: 15px;
}

.row {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.course,
.drink {
  flex: 1;
  min-width: 50px;
}

.label-flex {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 19px;
  margin-top: 10px;
  margin-bottom: 5px;
}

.label-text {
  display: inline-block;
}

.required-mark {
  color: red;
  font-size: 10px;
  margin-left: 4px;
}

.readonly-text {
  background-color: #e9e9e9;
  padding: 10px;
  border-radius: 4px;
  font-size: 16px;
  color: black;
  margin-top: 0px;
}

.backbutton {
  width: 130px;
  height: 45px;
  color: black;
  background-color: #fbc02d;
  border: 2px solid #fbc02d;
  border-radius: 12px;
  cursor: pointer;
  font-size: 17px;
  font-weight: bold;
}

.reservebutton {
  width: 130px;
  height: 45px;
  color: black;
  background-color: #fbc02d;
  border: 2px solid #fbc02d;
  border-radius: 12px;
  cursor: pointer;
  font-size: 17px;
  font-weight: bold;
}
</style>
