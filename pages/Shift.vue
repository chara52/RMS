<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()

const startDate = ref('')
const shiftData = reactive({
  name: '',
  date: '',
  days: [],
})

const getWeekdayLabel = (index) => {
  const weekdays = ['月', '火', '水', '木', '金', '土', '日']
  return weekdays[index]
}

const route = useRoute()

onMounted(() => {
  if (route.query.reset === 'true'){
    const now = new Date()
    const currentDay = now.getDay() // JSTの曜日（0:日曜, ..., 6:土曜）

    const daysToAdd = (8 - currentDay) % 7 || 7

    const nextMonday = new Date(now)
    nextMonday.setDate(now.getDate() + daysToAdd)

    const yyyy = String(nextMonday.getFullYear())
    const mm = String(nextMonday.getMonth() + 1).padStart(2, '0')
    const dd = String(nextMonday.getDate()).padStart(2, '0')
    startDate.value = `${yyyy}-${mm}-${dd}`
    shiftData.days = Array.from({ length: 7 }, () => [{ name: '' }])
  } else {
    const savedStartDate = localStorage.getItem('startDate')
    const savedShiftData = localStorage.getItem('shiftData')

    if (savedStartDate && savedShiftData) {
      startDate.value = savedStartDate
      shiftData.days = JSON.parse(savedShiftData)
    }
  }
})

const getDateWithOffset = (offset) => {
  const base = new Date(startDate.value)
  base.setDate(base.getDate() + offset)
  const month = base.getMonth() + 1
  const day = base.getDate()
  return `${month}月${day}日`
}

const addRow = (dayIndex) => {
  shiftData.days[dayIndex].push({ name: '' })
}

const removeRow = (dayIndex, rowIndex) => {
  if (shiftData.days[dayIndex].length > 1) {
    shiftData.days[dayIndex].splice(rowIndex, 1)
  }
}

const goBackWithDate = () => {
  // URLクエリから日付を取得して予約表に戻る
  const dateFromQuery = route.query.date;
  if (dateFromQuery) {
    router.push(`/ReservationTableCompact?date=${dateFromQuery}`);
  } else {
    router.push('/ReservationTableCompact');
  }
}

function goToConfirm() {
  localStorage.setItem('startDate', startDate.value)
  localStorage.setItem('shiftData', JSON.stringify(shiftData.days))
  //router.push('/ConfirmShift')
  const dateFromQuery = route.query.date;
  if (dateFromQuery) {
    router.push(`/ConfirmShift?date=${dateFromQuery}`);
  } else {
    router.push('/ConfirmShift');
  }
}
</script>

<template>
  <div class="shift-page-wrapper">
    <div class="shift-page">
      <div class="header-row">
        <button type="button" @click="goBackWithDate" class="backbutton">＜</button>
        <h1 class="global-h1">シフト作成</h1>
      </div>
      <div v-for="(day, index) in shiftData.days" :key="index" class="day-section">
        <h2>{{ getDateWithOffset(index) }} ({{ getWeekdayLabel(index) }})</h2>
        <div v-for="(row, rowIndex) in day" :key="rowIndex" class="shift-row">
          <input v-model="row.name" placeholder="名前" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
          <button class="remove-btn" @click="removeRow(index, rowIndex)" :disabled="day.length === 1">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
        <button class="add-btn" @click="addRow(index)">＋ 行を追加</button>
      </div>
      <div class="button-container">
        <button class="confirm-button" @click="goToConfirm">確認</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shift-page-wrapper {
  margin-bottom: 100px;
}
.shift-page {
  padding: 20px;
  max-width: 600px;
  margin: auto;
}

.header-row {
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F5F5F5;
  border-bottom: 1px solid #ddd;
  margin: -30px -30px 0 -30px;
}

.global-h1 {
  font-size: 20px;
  text-align: center;
  margin-top: 0px;
}

.day-section {
  margin-bottom: 30px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

.shift-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 6px 0;
}

input {
  padding: 6px;
  border-radius: 5px;
  border: 1px solid #ddd;
  flex: 1;
  font-size: 16px;
}

button {
  padding: 10px 20px;
  border: none;
  background-color: #fbc02d;
  color: black;
  border-radius: 5px;
  cursor: pointer;
}

button.add-btn {
  margin: 0 auto;
  margin-top: 6px;
  color: black;
  background-color: #e0e0e0;
  border: 2px dashed #333;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
}

button.remove-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

button.remove-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 37px;
  margin-top: 30px;
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
}

.backbutton {
  position: absolute;
  left: 0;
  width: 60px;
  height: 40px;
  color: #fbc02d;
  background-color: #F5F5F5;
  border: 2px solid #F5F5F5;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  margin-top: -20px;
}

.confirm-button {
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
