<script setup>
import { reactive, onMounted } from 'vue';
import { createClient } from 'microcms-js-sdk';
import { useRouter, useRoute } from 'vue-router';
import MenuButtonComponent from '~/components/MenuButton.vue';

const router = useRouter();
const route = useRoute();

const client = createClient({
  serviceDomain: import.meta.env.VITE_SHIFT_DOMAIN,
  apiKey: import.meta.env.VITE_SHIFT_API_KEY,
})

const shiftData = reactive({
  name: '',
  date: '',
});

onMounted( () => {
  const shiftId = route.query.id;

  client
    .get({
      endpoint: 'shiftdata',
      contentId: shiftId,
    })
    .then((res) => {
      Object.assign(shiftData, res);
    })
    .catch((err) => console.error(err));
})

const submitShift = () => {
  const shiftId = route.query.id;

  if(!shiftId) {
    console.error("shiftIdが取得できませんでした。");
    return;
  }

  fetch(`https://${import.meta.env.VITE_SHIFT_DOMAIN}.microcms.io/api/v1/shiftdata/${shiftId}`, {
  method: "PATCH",
  headers: {
      "Content-Type": "application/json",
      "X-MICROCMS-API-KEY": import.meta.env.VITE_SHIFT_API_KEY,
    },
    body: JSON.stringify({
      name: shiftData.name,
      date: shiftData.date,
    }),
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error('HTTPエラー: ${response.status}');
    }
    return response.json();
  })

  alert('シフトが更新されました。')
  router.push('/ReservationTableCompact')
};
</script>

<template>
  <MenuButtonComponent />
  <div class="shift-edit">
    <h1>シフト編集</h1>

    <form @submit.prevent="submitShift">
      <div class="shift">
        <label for="name" class="label-flex">
          <span class="label-text">名前</span>
          <span class="required-mark">＊</span>
        </label>
        <input type="text" id="name" v-model="formData.name" required />
      </div>
      <div class="button-container">
        <button type="button" @click="router.push('/ReservationTableCompact')" class="back-button">戻る</button>
        <button type="submit" class="submit-button">更新</button>
        <span class="error-message" v-if="errorMessage">{{ errorMessage }}</span>
      </div>
    </form>
  </div>
</template>

<style scoped>
</style>
