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
    <button class="filtered-button" v-on:click="emitDate">検索</button>
    <VueDatePicker
      v-model="inputDate"
      format="yyyy/MM/dd"
      model-type="yyyy-MM-dd"
      locale="ja"
    />
  </div>
</template>

<style>
  .button-filter {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }

  .filtered-button {
    width: 90px;
    height: 40px;
  }
</style>
