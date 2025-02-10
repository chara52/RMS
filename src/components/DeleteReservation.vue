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
  serviceDomain: 'rms',
  apiKey: 'utks82BKbpBzo3RxwDPLTbuj93Qj4J2T1sTU',
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
  <button @click="confirmDelete">削除</button>
</template>
