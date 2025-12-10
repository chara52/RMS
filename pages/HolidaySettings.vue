<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DateRangePicker from '../components/DateRangePicker.vue'
import BottomNavigation from '../components/BottomNavigation.vue'

const router = useRouter()

const startDate = ref('')
const endDate = ref('')
const isSubmitting = ref(false)
const holidays = ref([])
const isEditMode = ref(false)
const editingPeriod = ref(null)
const editStartDate = ref('')
const editEndDate = ref('')
const isEditCalendarOpen = ref(false)
const deletingPeriodId = ref(null)
const showEditButtons = ref(false)

async function fetchHolidays() {
  try {
    const response = await fetch('/api/holidays')
    if (!response.ok) {
      throw new Error('休みデータの取得に失敗しました')
    }

    const data = await response.json()
    holidays.value = data.holidays

    console.log('取得した休みデータ:', holidays.value)
  } catch (error) {
    console.error('休みデータ取得エラー:', error)
    alert('休みデータの取得に失敗しました: ' + error.message)
  }
}

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

async function saveHolidaySettings() {
  if (!startDate.value || !endDate.value) {
    alert('開始日と終了日を選択してください')
    return
  }

  isSubmitting.value = true

  try {
    const response = await fetch('/api/holidays', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: startDate.value,
        endDate: endDate.value,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '休み設定の保存に失敗しました')
    }

    alert('休み設定を保存しました')

    // 保存後、最初の日付を選択した状態でReservationTableCompactに戻る
    router.push({
      path: '/ReservationTableCompact',
      query: { date: startDate.value }
    })
  } catch (error) {
    console.error('休み設定保存エラー:', error)
    alert(error.message || '休み設定の保存に失敗しました')
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
    const response = await fetch(`/api/holidays/${editingPeriod.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: editStartDate.value,
        endDate: editEndDate.value,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '休み設定の更新に失敗しました')
    }

    alert('休み設定を更新しました')

    // データを再取得
    await fetchHolidays()

    // 編集モードを終了
    cancelEdit()
  } catch (error) {
    console.error('休み設定更新エラー:', error)
    alert(error.message || '休み設定の更新に失敗しました')
  } finally {
    isSubmitting.value = false
  }
}

// 期間を削除
async function deletePeriod(period) {
  if (!confirm(`${formatPeriod(period)} の休み設定を削除しますか？`)) {
    return
  }

  deletingPeriodId.value = period.id

  try {
    const response = await fetch(`/api/holidays/${period.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '休み設定の削除に失敗しました')
    }

    alert('休み設定を削除しました')

    // データを再取得
    await fetchHolidays()
  } catch (error) {
    console.error('休み設定削除エラー:', error)
    alert(error.message || '休み設定の削除に失敗しました')
  } finally {
    deletingPeriodId.value = null
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

      <div v-if="holidays.length === 0" class="no-data">
        登録されている休み設定はありません
      </div>

      <div v-else class="holiday-list">
        <div
          v-for="period in holidays"
          :key="period.id"
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
              :disabled="deletingPeriodId !== null"
            >
              編集
            </button>
            <button
              type="button"
              class="delete-btn"
              @click="deletePeriod(period)"
              :disabled="deletingPeriodId !== null"
            >
              {{ deletingPeriodId === period.id ? '削除中...' : '削除' }}
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
