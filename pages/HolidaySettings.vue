<script setup>
import { ref } from 'vue'
import { createClient } from 'microcms-js-sdk'
import { useRouter } from 'vue-router'
import DateRangePicker from '../components/DateRangePicker.vue'
import BottomNavigation from '../components/BottomNavigation.vue'

const router = useRouter()

const client = createClient({
  serviceDomain: import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.VITE_API_KEY,
})

const startDate = ref('')
const endDate = ref('')
const isSubmitting = ref(false)

function handleDatesSelected(dates) {
  startDate.value = dates.startDate
  endDate.value = dates.endDate
}

async function saveHolidaySettings() {
  if (!startDate.value || !endDate.value) {
    alert('開始日と終了日を選択してください')
    return
  }

  isSubmitting.value = true

  try {
    const start = new Date(startDate.value)
    const end = new Date(endDate.value)

    // 開始日から終了日までの各日付に対してデータを作成
    const currentDate = new Date(start)
    const promises = []

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const timeStr = `${dateStr}T00:00:00`

      const holidayData = {
        name: '-',
        people: '-',
        time: timeStr,
        seat: '-',
        course: ['-'],
        drink: ['-'],
        phone: '-',
        info: '休み'
      }

      promises.push(
        client.create({
          endpoint: 'data',
          content: holidayData
        })
      )

      currentDate.setDate(currentDate.getDate() + 1)
    }

    await Promise.all(promises)

    alert('休み設定を保存しました')

    // 保存後、最初の日付を選択した状態でReservationTableCompactに戻る
    router.push({
      path: '/ReservationTableCompact',
      query: { date: startDate.value }
    })
  } catch (error) {
    console.error('休み設定の保存に失敗しました:', error)
    alert('休み設定の保存に失敗しました')
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.push('/ReservationTableCompact')
}

// eslint-disable-next-line no-unused-vars
function setTodayDate(todayStr) {
  // BottomNavigationからの日付設定は不要なので空実装
}
</script>

<template>
  <div class="holiday-settings">
    <h1 class="global-h1">休み設定</h1>

    <div class="content">
      <div class="description">
        休みにする期間を選択してください
      </div>

      <div class="date-picker-container">
        <DateRangePicker
          :startDate="startDate"
          :endDate="endDate"
          @datesSelected="handleDatesSelected"
        />
      </div>

      <div class="button-group">
        <button
          type="button"
          class="cancel-button"
          @click="goBack"
        >
          キャンセル
        </button>
        <button
          type="button"
          class="save-button"
          @click="saveHolidaySettings"
          :disabled="isSubmitting || !startDate || !endDate"
        >
          {{ isSubmitting ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
  </div>

  <BottomNavigation :selectedDate="startDate" @setTodayDate="setTodayDate" />
</template>

<style scoped>
.holiday-settings {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.content {
  margin-top: 30px;
}

.description {
  text-align: center;
  font-size: 16px;
  margin-bottom: 20px;
  color: #666;
}

.date-picker-container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto 30px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 40px;
}

.cancel-button,
.save-button {
  width: 140px;
  height: 45px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.cancel-button {
  background-color: #ececec;
  color: black;
}

.cancel-button:hover {
  background-color: #d8d8d8;
}

.save-button {
  background-color: #f9a825;
  color: white;
}

.save-button:hover:not(:disabled) {
  background-color: #f57c00;
}

.save-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
