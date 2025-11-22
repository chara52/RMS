<script setup>
import { ref, nextTick, onMounted } from 'vue'

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
const hourColumn = ref(null)
const minuteColumn = ref(null)

function playClickSound() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10)
  }
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.05)
  } catch {
    // オーディオが使用できない場合は無視
  }
}

function getValueFromScroll(container, values) {
  const itemHeight = 40
  const scrollTop = container.scrollTop
  const index = Math.round(scrollTop / itemHeight)
  return values[Math.max(0, Math.min(index, values.length - 1))]
}

function scrollToValue(container, values, value, instant = false) {
  const itemHeight = 40
  const index = values.indexOf(value)
  if (index !== -1) {
    const scrollTop = index * itemHeight
    container.scrollTo({
      top: scrollTop,
      behavior: instant ? 'auto' : 'smooth'
    })
  }
}

function handleHourScroll() {
  if (!hourColumn.value) return
  const newHour = getValueFromScroll(hourColumn.value, props.hours)
  if (newHour !== selectedHour.value) {
    selectedHour.value = newHour
    emits('update:modelValue', `${newHour}:${selectedMinute.value}`)
    playClickSound()
  }
}

function handleMinuteScroll() {
  if (!minuteColumn.value) return
  const newMinute = getValueFromScroll(minuteColumn.value, props.minutes)
  if (newMinute !== selectedMinute.value) {
    selectedMinute.value = newMinute
    emits('update:modelValue', `${selectedHour.value}:${newMinute}`)
    playClickSound()
  }
}

const initializeTime = async () => {
  if (props.modelValue) {
    const [h, m] = props.modelValue.split(':')
    selectedHour.value = h
    selectedMinute.value = m
  } else {
    selectedHour.value = '17'
    selectedMinute.value = '00'
  }

  await nextTick()
  if (hourColumn.value && minuteColumn.value) {
    scrollToValue(hourColumn.value, props.hours, selectedHour.value, true)
    scrollToValue(minuteColumn.value, props.minutes, selectedMinute.value, true)
  }
}

function selectHour(h) {
  selectedHour.value = h
  emits('update:modelValue', `${h}:${selectedMinute.value}`)
  if (hourColumn.value) {
    scrollToValue(hourColumn.value, props.hours, h)
  }
}

function selectMinute(m) {
  selectedMinute.value = m
  emits('update:modelValue', `${selectedHour.value}:${m}`)
  if (minuteColumn.value) {
    scrollToValue(minuteColumn.value, props.minutes, m)
  }
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

onMounted(() => {
  initializeTime()
})
</script>

<template>
  <div class="time-picker">
    <div class="time-columns">
      <div class="unified-selection-indicator"></div>
      <div class="time-column-wrapper">
        <div
          ref="hourColumn"
          class="time-column"
          @scroll="handleHourScroll"
        >
          <div class="spacer"></div>
          <div
            v-for="h in hours"
            :key="h"
            :class="['time-item', 'hour-item', { selected: h === selectedHour }]"
            @click="() => selectHour(h)"
          >
            {{ h }}
          </div>
          <div class="spacer"></div>
        </div>
      </div>
      <span class="colon">：</span>
      <div class="time-column-wrapper">
        <div
          ref="minuteColumn"
          class="time-column"
          @scroll="handleMinuteScroll"
        >
          <div class="spacer"></div>
          <div
            v-for="m in minutes"
            :key="m"
            :class="['time-item', { selected: m === selectedMinute }]"
            @click="() => selectMinute(m)"
          >
            {{ m }}
          </div>
          <div class="spacer"></div>
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
  position: relative;
}

.unified-selection-indicator {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 40px;
  transform: translateY(-50%);
  background-color: rgba(230, 230, 230, 0.5);
  border: 2px solid rgba(230, 230, 230, 0.5);
  border-radius: 8px;
  pointer-events: none;
  z-index: 1;
}

.time-column-wrapper {
  position: relative;
  height: 120px;
}


.time-column {
  height: 120px;
  width: 40vw;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  font-family: Arial;
  scroll-behavior: smooth;
}

.time-column::-webkit-scrollbar {
  display: none;
}

.spacer {
  height: 40px;
  flex-shrink: 0;
}

.time-item {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 20px;
  line-height: 40px;
  scroll-snap-align: center;
  cursor: pointer;
  transition: all 0.1s ease;
  width: 15vw;
  color: #ccc;
  position: relative;
}

.time-item.selected {
  color: #000;
  font-weight: bold;
}

.hour-item {
  justify-content: flex-end !important;
  padding-right: 20px;
  padding-left: 80px;
  text-align: right !important;
  align-items: center;
  display: flex !important;
}

.colon {
  font-size: 20px;
  font-weight: bold;
  padding: 0 10px;
  align-self: center;
  line-height: 40px;
  height: 40px;
  display: flex;
  align-items: center;
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
