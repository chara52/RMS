<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  hours: {
    type: Array,
    default: () => Array.from({ length: 6 }, (_, i) => String(i + 17).padStart(2, '0'))
  },
  minutes: {
    type: Array,
    default: () => Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))
  }
})

const emits = defineEmits(['update:modelValue', 'apply', 'reset'])

const selectedHour = ref('')
const selectedMinute = ref('')

const initializeTime = () => {
  if (props.modelValue) {
    const [h, m] = props.modelValue.split(':')
    selectedHour.value = h
    selectedMinute.value = m
  } else {
    selectedHour.value = '17'
    selectedMinute.value = '00'
  }
}

function selectHour(h) {
  selectedHour.value = h
  emits('update:modelValue', `${h}:${selectedMinute.value}`)
}

function selectMinute(m) {
  selectedMinute.value = m
  emits('update:modelValue', `${selectedHour.value}:${m}`)
}

function applySelectedTime() {
  emits('update:modelValue', `${selectedHour.value}:${selectedMinute.value}`)
  emits('apply')
}

function resetTime() {
  selectedHour.value = '17'
  selectedMinute.value = '00'
  emits('update:modelValue', '')
  emits('reset')
}

initializeTime()
</script>

<template>
  <div class="time-picker">
    <div class="time-columns">
      <div class="time-column">
        <div
          v-for="h in hours"
          :key="h"
          :class="{ selected: h === selectedHour }"
          @click="() => selectHour(h)"
        >
          {{ h }}
        </div>
      </div>
      <span class="colon">:</span>
      <div class="time-column">
        <div
          v-for="m in minutes"
          :key="m"
          :class="{ selected: m === selectedMinute }"
          @click="() => selectMinute(m)"
        >
          {{ m }}
        </div>
      </div>
    </div>
    <div class="time-buttons">
      <button type="button" @click="resetTime">リセット</button>
      <button type="button" @click="applySelectedTime">完了</button>
    </div>
  </div>
</template>

<style scoped>
.time-picker {
  width: 100%;
  border: 1px solid #ccc;
  padding: 1rem;
  background: white;
  position: absolute;
  box-sizing: border-box;
  font-size: 16px;
  z-index: 1000;
  border-radius: 15px;
}

.time-columns {
  display: flex;
  justify-content: center;
  align-items: center;
}

.time-column {
  height: 120px;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  font-family: Arial;
}

.time-column::-webkit-scrollbar {
  display: none;
}

.time-column div {
  padding: 8px;
  text-align: center;
  font-size: 20px;
}

.time-column div.selected {
  background-color: #cce5ff;
  font-weight: bold;
  border-radius: 4px;
  width: 15vw;
}

.colon {
  font-size: 20px;
  font-weight: bold;
  padding: 0 10px;
}

.time-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  border-top: 1px solid #ccc;
  padding-top: 8px;
  margin-left: -1rem;
  margin-right: -1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  width: calc(100% + 2rem);
  box-sizing: border-box;
}

.time-buttons button {
  background: transparent;
  color: blue;
  font-size: 16px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}
</style>
