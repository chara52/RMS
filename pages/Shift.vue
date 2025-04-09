<script setup>
import { ref, onMounted } from 'vue'

const startDate = ref('')
const shiftData = ref([])

const formatDate = (date) => {
  return date.toISOString().split('T')[0]
}

const getWeekdayLabel = (index) => {
  const weekdays = ['月', '火', '水', '木', '金', '土', '日']
  return weekdays[index]
}

onMounted(() => {
  const now = new Date()
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const dayOfWeek = jstNow.getDay()
  const daysUntilMonday = (8 - dayOfWeek) % 7 || 7

  const nextMonday = new Date(jstNow)
  nextMonday.setDate(jstNow.getDate() + daysUntilMonday)

  startDate.value = formatDate(nextMonday)

  shiftData.value = Array.from({ length: 7 }, () => [{ name: '', group: '' }])
})

const getDateWithOffset = (offset) => {
  const base = new Date(startDate.value)
  base.setDate(base.getDate() + offset)
  return formatDate(base)
}

const addRow = (dayIndex) => {
  shiftData.value[dayIndex].push({ name: '', group: '' })
}

const removeRow = (dayIndex, rowIndex) => {
  // 最低1行は残す
  if (shiftData.value[dayIndex].length > 1) {
    shiftData.value[dayIndex].splice(rowIndex, 1)
  }
}
</script>

<template>
  <div class="shift-page">
    <h1>シフト作成</h1>
    <p>週の開始日（次の月曜）: {{ startDate }}</p>

    <div v-for="(day, index) in shiftData" :key="index" class="day-section">
      <h2>{{ getWeekdayLabel(index) }}曜（{{ getDateWithOffset(index) }}）</h2>

      <div
        v-for="(row, rowIndex) in day"
        :key="rowIndex"
        class="shift-row"
      >
        <input v-model="row.name" placeholder="名前" />
        <button class="remove-btn" @click="removeRow(index, rowIndex)" :disabled="day.length === 1">
          🗑
        </button>
      </div>

      <button class="add-btn" @click="addRow(index)">＋ 行を追加</button>
    </div>
    <button>確認</button>
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

button.add-btn {
  margin-top: 6px;
  padding: 4px 10px;
  border: none;
  background-color: #4caf50;
  color: white;
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
</style>
