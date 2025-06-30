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
const editShiftData = () => {
  router.push({ path: '/EditShift', query: { id: props.id } })
}
</script>

<template>
  <button @click="editShiftData" class="edit-button">
    <i class="fa-solid fa-user-pen user-icon"></i>
  </button>
</template>

<style scoped>
.edit-button {
  background: none;
  border: none;
}

.user-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  float: left;
  cursor: pointer;
  color: grey;
  font-size: 1.5rem;
  width: 30px;
  height: 30px;
}
</style>
