<script setup>
import { reactive, onMounted, ref, computed } from 'vue';
import { createClient } from 'microcms-js-sdk';
import { useRouter, useRoute } from 'vue-router';

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

const shiftList = ref([])

onMounted( () => {
  //const shiftId = route.query.id;

  client
    .get({
      endpoint: 'shiftdata',
      //contentId: inputDate,
      queries: { limit: 100 }
    })
    .then((res) => {
      //Object.assign(shiftData, res);
      shiftList.value = res.contents;
    })
    .catch((err) => console.error(err));
})

// ここを追加
const formattedDate = computed(() => {
  const inputDate = route.query.id;
  if (!inputDate) return '';
  const [, month, day] = inputDate.split('-');
  return `${Number(month)}月${Number(day)}日`;
});

// ここを追加
const filteredShifts = computed(() => {
  const inputDate = route.query.id;
  return shiftList.value.filter((shift) => {
    return shift.date?.split('T')[0] === inputDate;
  });
});

const deleteShift = (shiftId) => {
  const confirmed = confirm("本当に削除しますか？")
  if(!confirmed) return;
  client
    .delete({ endpoint: 'shiftdata', contentId: shiftId })
    .then(() => {
      //console.log(`${shiftId} の削除に成功しました`);
      shiftList.value = shiftList.value.filter(shift => shift.id !== shiftId);
    })
    .catch((error) => {
      console.error(`${shiftId} の削除に失敗しました`, error);
    });
};

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
  <div class="shift-edit">
    <h1>シフト編集</h1>

    <form @submit.prevent="submitShift">
      <div class="shift">
        <label for="name" class="label-flex">
          <span class="label-text">名前</span>
          <span class="required-mark">＊</span>
        </label>
        <!--formDataからshiftDataに変更-->>
        <input type="text" id="name" v-model="shiftData.name" required />
      </div>
      <div class="button-container">
        <button type="button" @click="router.push('/ReservationTableCompact')" class="back-button">戻る</button>
        <button type="submit" class="submit-button">更新</button>
        <span class="error-message" v-if="errorMessage">{{ errorMessage }}</span>
      </div>
    </form>
  </div>

  <!--日付からフィルタリング-->>
  <div v-if="filteredShifts.length > 0">
    <h2>{{ formattedDate }}</h2>
    <div v-for="shift in filteredShifts" :key="shift.id">
      <input type="text" id="name" v-model="shift.name" required />
      <button class="remove-btn" @click="deleteShift(shift.id)">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    </div>
    <button class="add-btn">＋ 行を追加</button>
  </div>
  <p v-else>この日に該当するシフトはありません。</p>
  <div class="button-container">
    <button type="button" @click="router.push('/ReservationTableCompact')" class="back-button">戻る</button>
    <button type="submit" class="submit-button">更新</button>
    <span class="error-message" v-if="errorMessage">{{ errorMessage }}</span>
  </div>
</template>

<style scoped>
</style>
