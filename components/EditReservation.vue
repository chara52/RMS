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
  router.push({ path: '/EditForm', query: { id: props.id } })
}
</script>

<template>
  <button @click="editReservation" class="edit-button">
    <i class="fa-solid fa-pen"></i>
  </button>
</template>

<style scoped>
.edit-button {
  display: flex;
  justify-content: center; /* 横方向の中央ぞろえ */
  align-items: center; /* 縦方向の中央ぞろえ */
  float: right;
  background: none;
  border: none;
  cursor: pointer;
  color: grey;
  font-size: 1.5rem; /* アイコンサイズ */
  width: 30px;
  height: 30px;
  margin-right: 15px;
}
</style>
