<script setup>
import { ref } from 'vue'

const inputDate = ref()
const emit = defineEmits(['input-Date'])

const emitDate = () => {
  emit('input-Date', inputDate.value)
}
</script>

<template>
  <div class="button-filter">
    <VueDatePicker
      v-model="inputDate"
      format="yyyy/MM/dd"
      model-type="yyyy-MM-dd"
      locale="ja"
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
