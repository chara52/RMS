<script setup>
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

const deleteReservation = async () => {
  try {
    const response = await fetch(`/api/reservations/${props.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`)
    }

    emit('delete', props.id)
  } catch (error) {
    alert(`${props.id}削除失敗: ` + error)
  }
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
}
</style>
