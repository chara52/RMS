<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ inputDate: String })
const emit = defineEmits(['update:inputDate'])

const inputDate = ref(props.inputDate)

const emitDate = () => {
  emit('update:inputDate', inputDate.value)
}

watch(() => props.inputDate, (newVal) => {
  inputDate.value = newVal
})
</script>

<template>
  <div class="button-filter">
    <VueDatePicker
      v-model="inputDate"
      format="yyyy/MM/dd"
      model-type="yyyy-MM-dd"
      locale="ja"
      :enable-time-picker="false"
      @update:model-value="emitDate"
    />
  </div>
</template>

<style scoped>
  .button-filter {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 30px;
  }
</style>
