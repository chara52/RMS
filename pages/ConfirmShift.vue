<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createClient } from 'microcms-js-sdk'
import MenuButtonComponent from '../components/MenuButton.vue'

const router = useRouter()
const shiftData = ref([])
const startDate = ref('')

const client = createClient({
  serviceDomain: import.meta.env.VITE_SHIFT_DOMAIN,
  apiKey: import.meta.env.VITE_SHIFT_API_KEY,
})

const getWeekdayLabel = (index) => {
  const weekdays = ['月', '火', '水', '木', '金', '土', '日']
  return weekdays[index]
}

onMounted(() => {
  const savedShiftData = localStorage.getItem('shiftData')
  const savedStartDate = localStorage.getItem('startDate')
  if (savedShiftData) {
    shiftData.value = JSON.parse(savedShiftData)
  }
  if (savedStartDate) {
    startDate.value = savedStartDate
  }
})

const getDateWithOffset = (offset) => {
  const base = new Date(startDate.value)
  base.setDate(base.getDate() + offset)
  return base.toISOString().split('T')[0]
}

const submitShift = async () => {
  if (!confirm('シフトを確定しますか？')) return

  try {
    for (let i = 0; i < shiftData.value.length; i++) {
      const date = getDateWithOffset(i)
      for (const entry of shiftData.value[i]) {
        if (!entry.name) continue
        await client.create({
          endpoint: 'shiftdata',
          content: {
            name: entry.name,
            date: new Date(date).toISOString(),
          },
        })
      }
    }
    alert('シフトデータを送信しました！')
    router.push('/ReservationTableCompact')
  } catch (error) {
    console.error(error)
    alert('送信に失敗しました')
  }
}
</script>

<template>
  <MenuButtonComponent />
  <div class="confirm-page">
    <h1>シフト確認</h1>
    <div v-if="shiftData.length">
      <div v-for="(day, dayIndex) in shiftData" :key="dayIndex" class="day-section">
        <h2>{{ getDateWithOffset(dayIndex) }} ({{ getWeekdayLabel(dayIndex) }})</h2>
        <ul>
          <li v-for="(row, rowIndex) in day" :key="rowIndex">
            {{ row.name }}
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <p>シフトデータがありません。</p>
    </div>
    <div class="button-container">
      <button @click="router.push('/Shift')" class="go-back-btn">戻る</button>
      <button @click="submitShift" class="go-back-btn">送信</button>
    </div>
  </div>
</template>

<style scoped>
.confirm-page {
  padding: 20px;
  max-width: 600px;
  margin: auto;
}

.day-section {
  margin-bottom: 30px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background: #f5f5f5;
  margin: 6px 0;
  padding: 6px;
  border-radius: 5px;
}

.button-container {
  display: flex;
  gap: 37px;
  margin-top: 20px;
  justify-content: center;
}

.go-back-btn {
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
