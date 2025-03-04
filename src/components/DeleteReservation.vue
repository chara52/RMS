<script setup>
import { createClient } from 'microcms-js-sdk'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['delete'])

const confirmDelete = () => {
  if (confirm('本当に削除しますか？')) {
    deleteReservation()
  }
}

const client = createClient({
  serviceDomain: import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.VITE_API_KEY,
})

const deleteReservation = () => {
  client
    .delete({ endpoint: 'data', contentId: props.id })
    .then(() => {
      console.log(`${props.id}削除成功`)
      emit('delete', props.id)
    })
    .catch((error) => {
      console.error(`${props.id}削除失敗`, error)
    })
}
</script>

<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <button @click="confirmDelete" class="delete-button">
    <i class="fa-regular fa-trash-can"></i>
  </button>
</template>


<style scoped>
.delete-button {
  margin-left: 300px;
  background: none;
  border: none;
  cursor: pointer;
  color: grey;
  font-size: 1.5rem; /* アイコンサイズ */
}
</style>
