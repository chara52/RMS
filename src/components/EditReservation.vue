<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const editReservation = () => {
  router.push('/editform')
}
</script>

<template>
  <button @click="editReservation">編集</button>
</template>
