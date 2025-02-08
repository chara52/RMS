<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

// 編集画面に遷移し、idをURLに付与
const editReservation = () => {
  router.push({ path: '/editform', query: { id: props.id } })
}
</script>

<template>
  <button @click="editReservation">編集</button>
</template>
