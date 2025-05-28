<script setup>
import { ref, reactive, onMounted } from 'vue'
import MenuButtonComponent from '../components/MenuButton.vue'
import { useRouter } from 'vue-router'

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

onMounted(() => {
  const now = new Date()
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const day = jst.getDay() // JSTの曜日（0:日曜, ..., 6:土曜）

  const daysToAdd = (8 - day) % 7 || 7
  jst.setDate(jst.getDate() + daysToAdd)

  startDate.value = jst.toISOString().split('T')[0]
  shiftData.days = Array.from({ length: 7 }, () => [{ name: '' }])
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

function goToConfirm() {
  localStorage.setItem('startDate', startDate.value)
  localStorage.setItem('shiftData', JSON.stringify(shiftData.days))
  router.push('/ConfirmShift')
}
</script>

<template>
  <MenuButtonComponent />
  <div class="shift-page">
    <h1>シフト作成</h1>
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
    <button class="go-btn" @click="goToConfirm">確認</button>
  </div>
</template>

<style scoped>
.shift-page {
  padding: 20px;
  max-width: 600px;
  margin: auto;
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
  margin-top: 6px;
  padding: 4px 10px;
  border: none;
  background-color: #fbc02d;
  color: black;
  border-radius: 4px;
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

button.go-btn {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  justify-content: center;
}

button:hover {
  background-color: #f29c1f;
}
</style>
