<script setup>
import { ref, computed, onMounted } from 'vue'
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
const holidays = ref([])
const isEditMode = ref(false)
const editingPeriod = ref(null)
const editStartDate = ref('')
const editEndDate = ref('')
const isEditCalendarOpen = ref(false)
const deletingPeriodIndex = ref(null)
const showEditButtons = ref(false)

async function fetchHolidays() {
  try {
    const res = await client.getList({
      endpoint: 'data',
      queries: {
        limit: 100,
        filters: 'info[equals]休み'
      }
    })

    console.log('取得した休みデータ:', res.contents)

    const holidayData = res.contents
      .filter(item => item.info === '休み')
      .map(item => ({
        id: item.id,
        date: item.time.split('T')[0]
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    console.log('グループ化前のデータ:', holidayData)
    holidays.value = holidayData
  } catch (error) {
    alert('休みデータの取得に失敗しました:' + error)
  }
}

const holidayPeriods = computed(() => {
  if (holidays.value.length === 0) return []

  const uniqueDates = {}
  holidays.value.forEach(item => {
    if (!uniqueDates[item.date]) {
      uniqueDates[item.date] = item.id
    }
  })

  const uniqueHolidays = Object.keys(uniqueDates)
    .map(date => ({
      date: date,
      id: uniqueDates[date]
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (uniqueHolidays.length === 0) return []

  const periods = []
  let currentPeriod = {
    startDate: uniqueHolidays[0].date,
    endDate: uniqueHolidays[0].date,
    ids: [uniqueHolidays[0].id]
  }

  for (let i = 1; i < uniqueHolidays.length; i++) {
    const prevDate = new Date(uniqueHolidays[i - 1].date)
    const currDate = new Date(uniqueHolidays[i].date)
    const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      // 連続している
      currentPeriod.endDate = uniqueHolidays[i].date
      currentPeriod.ids.push(uniqueHolidays[i].id)
    } else {
      // 連続していない
      periods.push(currentPeriod)
      currentPeriod = {
        startDate: uniqueHolidays[i].date,
        endDate: uniqueHolidays[i].date,
        ids: [uniqueHolidays[i].id]
      }
    }
  }

  periods.push(currentPeriod)
  console.log('グループ化後の期間:', periods)
  return periods
})

// 日付フォーマット
function formatDate(dateStr) {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

function formatPeriod(period) {
  if (period.startDate === period.endDate) {
    return formatDate(period.startDate)
  }
  return `${formatDate(period.startDate)} 〜 ${formatDate(period.endDate)}`
}

function handleDatesSelected(dates) {
  startDate.value = dates.startDate
  endDate.value = dates.endDate
}

function handleEditDatesSelected(dates) {
  editStartDate.value = dates.startDate
  editEndDate.value = dates.endDate
  showEditButtons.value = true
}

function handleEditCalendarToggle(isOpen) {
  isEditCalendarOpen.value = isOpen
}

// 日付の重複チェック
function checkDateOverlap(newStartDate, newEndDate) {
  const newStart = new Date(newStartDate)
  const newEnd = new Date(newEndDate)

  // 既存の休みデータと重複チェック
  for (const holiday of holidays.value) {
    const existingDate = new Date(holiday.date)

    // 新規期間に既存の日付が含まれているかチェック
    if (existingDate >= newStart && existingDate <= newEnd) {
      return true
    }
  }

  return false
}

async function saveHolidaySettings() {
  if (!startDate.value || !endDate.value) {
    alert('開始日と終了日を選択してください')
    return
  }

  // 重複チェック
  if (checkDateOverlap(startDate.value, endDate.value)) {
    alert('選択した期間は既に休み設定されています')
    return
  }

  isSubmitting.value = true

  try {
    const start = new Date(startDate.value)
    const end = new Date(endDate.value)

    // 開始日から終了日までの各日付に対してデータを作成（順次実行で遅延を入れる）
    const currentDate = new Date(start)

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

      await client.create({
        endpoint: 'data',
        content: holidayData
      })

      // レート制限回避のため100ms待機
      await new Promise(resolve => setTimeout(resolve, 100))

      currentDate.setDate(currentDate.getDate() + 1)
    }

    alert('休み設定を保存しました')

    // 保存後、最初の日付を選択した状態でReservationTableCompactに戻る
    router.push({
      path: '/ReservationTableCompact',
      query: { date: startDate.value }
    })
  } catch (error) {
    alert('休み設定の保存に失敗しました:' + error)
    alert('休み設定の保存に失敗しました')
  } finally {
    isSubmitting.value = false
  }
}

// 編集モードを開始
function startEdit(period) {
  editingPeriod.value = period
  editStartDate.value = period.startDate
  editEndDate.value = period.endDate
  isEditMode.value = true
  showEditButtons.value = false
}

// 編集をキャンセル
function cancelEdit() {
  isEditMode.value = false
  editingPeriod.value = null
  editStartDate.value = ''
  editEndDate.value = ''
  isEditCalendarOpen.value = false
  showEditButtons.value = false
}

// 期間を更新
async function updatePeriod() {
  if (!editStartDate.value || !editEndDate.value) {
    alert('開始日と終了日を選択してください')
    return
  }

  if (!confirm('この期間を更新しますか？')) {
    return
  }

  isSubmitting.value = true

  try {
    // 既存の期間を削除（順次実行で遅延を入れる）
    for (const id of editingPeriod.value.ids) {
      await client.delete({
        endpoint: 'data',
        contentId: id
      })
      // レート制限回避のため100ms待機
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // 新しい期間を作成（順次実行で遅延を入れる）
    const start = new Date(editStartDate.value)
    const end = new Date(editEndDate.value)
    const currentDate = new Date(start)

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

      await client.create({
        endpoint: 'data',
        content: holidayData
      })

      // レート制限回避のため100ms待機
      await new Promise(resolve => setTimeout(resolve, 100))

      currentDate.setDate(currentDate.getDate() + 1)
    }

    alert('休み設定を更新しました')

    // データを再取得
    await fetchHolidays()

    // 編集モードを終了
    cancelEdit()
  } catch (error) {
    alert('休み設定の更新に失敗しました:' + error)
    alert('休み設定の更新に失敗しました')
  } finally {
    isSubmitting.value = false
  }
}

// 期間を削除
async function deletePeriod(period, index) {
  if (!confirm(`${formatPeriod(period)} の休み設定を削除しますか？`)) {
    return
  }

  deletingPeriodIndex.value = index

  try {
    // 順次実行で遅延を入れる
    for (const id of period.ids) {
      await client.delete({
        endpoint: 'data',
        contentId: id
      })
      // レート制限回避のため100ms待機
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    alert('休み設定を削除しました')

    // データを再取得
    await fetchHolidays()
  } catch (error) {
    alert('休み設定の削除に失敗しました:' + error)
    alert('休み設定の削除に失敗しました')
  } finally {
    deletingPeriodIndex.value = null
  }
}

function goBack() {
  router.push('/ReservationTableCompact')
}

// eslint-disable-next-line no-unused-vars
function setTodayDate(todayStr) {
  // BottomNavigationからの日付設定は不要なので空実装
}

onMounted(() => {
  fetchHolidays()
})
</script>

<template>
  <div class="holiday-settings">
    <h1 class="global-h1">休み設定</h1>

    <!-- 編集モーダル -->
    <div v-if="isEditMode" class="modal-overlay" @click="cancelEdit">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">休み期間を編集</h2>
        <div class="modal-body" :class="{ 'calendar-open': isEditCalendarOpen }">
          <p class="current-period">現在: {{ formatPeriod(editingPeriod) }}</p>
          <DateRangePicker
            :startDate="editStartDate"
            :endDate="editEndDate"
            @datesSelected="handleEditDatesSelected"
            @calendarToggle="handleEditCalendarToggle"
          />
        </div>
        <div v-if="showEditButtons" class="modal-buttons">
          <button type="button" class="cancel-button" @click="cancelEdit">
            キャンセル
          </button>
          <button
            type="button"
            class="save-button"
            @click="updatePeriod"
            :disabled="isSubmitting || !editStartDate || !editEndDate"
          >
            {{ isSubmitting ? '更新中...' : '更新' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 新規追加エリア -->
    <div class="content section new-section">
      <h2 class="section-title">新規追加</h2>
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
          戻る
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

    <!-- 既存の休み設定一覧 -->
    <div class="content section existing-section">
      <h2 class="section-title">既存の休み設定</h2>

      <div v-if="holidayPeriods.length === 0" class="no-data">
        登録されている休み設定はありません
      </div>

      <div v-else class="holiday-list">
        <div
          v-for="(period, index) in holidayPeriods"
          :key="index"
          class="holiday-item"
        >
          <div class="period-info">
            {{ formatPeriod(period) }}
          </div>
          <div class="period-actions">
            <button
              type="button"
              class="edit-btn"
              @click="startEdit(period)"
              :disabled="deletingPeriodIndex !== null"
            >
              編集
            </button>
            <button
              type="button"
              class="delete-btn"
              @click="deletePeriod(period, index)"
              :disabled="deletingPeriodIndex !== null"
            >
              {{ deletingPeriodIndex === index ? '削除中...' : '削除' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <BottomNavigation :selectedDate="startDate" @setTodayDate="setTodayDate" />
</template>

<style scoped>
.holiday-settings {
  max-width: 100%;
  margin: -10px -7px;
  margin-bottom: 100px;
  padding: 20px;
}

.global-h1 {
  text-align: center;
  font-size: 20px;
  margin-top: -7px;
  margin-bottom: 20px;
}

.section {
  margin-bottom: 50px;
  padding: 25px;
  border-radius: 12px;
  border: 2px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.new-section {
  background: #fffbea;
  border-color: #f9a825;
}

.existing-section {
  background: #e3f2fd;
  border-color: #42a5f5;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 2px solid #ddd;
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
  max-width: 100%;
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

.no-data {
  text-align: center;
  color: #999;
  padding: 30px;
  font-size: 15px;
}

.holiday-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.holiday-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
  gap: 15px;
}

.period-info {
  font-size: 18px;
  font-weight: 500;
  text-align: center;
}

.period-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
}

.edit-btn,
.delete-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.edit-btn {
  background-color: #4CAF50;
  color: white;
}

.edit-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background-color: #da190b;
}

.edit-btn:disabled,
.delete-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 90%;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.modal-body {
  margin-bottom: 30px;
  position: relative;
  min-height: 100px;
  transition: min-height 0.3s ease;
}

.modal-body.calendar-open {
  min-height: 500px;
}

.current-period {
  text-align: center;
  font-size: 15px;
  color: #666;
  margin-bottom: 20px;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}
</style>
