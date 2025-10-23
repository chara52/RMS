<template>
  <div class="toggle-container" @click="onToggle">
    <span class="toggle-label">{{ isClosed ? '休業日' : '営業中' }}</span>
    <div class="toggle-switch" :class="{ 'is-closed': isClosed }">
      <div class="toggle-slider"></div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isClosed: Boolean,
  date: String
});
const emit = defineEmits(['toggle']);
function onToggle() {
  emit('toggle', props.date);
}

/*function toggleClosed(date) {
  if (!isClosed.value) {
    if (confirm(`${date} を休業日にしますか？`)) {
      closedDays.value[date] = true
    }
  } else {
    if (confirm(`${date} の休業日を解除しますか？`)) {
      closedDays.value[date] = false
    }
  }
  // localStorageに保存
  localStorage.setItem('closedDays', JSON.stringify(closedDays.value))
}*/
</script>

<style scoped>
.toggle-container {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.toggle-label {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  transition: color 0.2s;
}
.toggle-switch {
  position: relative;
  width: 50px;
  height: 28px;
  background: #4caf50;
  border-radius: 14px;
  transition: background 0.3s;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
}
.toggle-switch.is-closed {
  background: #f44336;
}
.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.toggle-switch.is-closed .toggle-slider {
  transform: translateX(22px);
}
</style>
