<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createClient } from 'microcms-js-sdk';

const router = useRouter();
const route = useRoute();

const client = createClient({
  serviceDomain: import.meta.env.VITE_SHIFT_DOMAIN,
  apiKey: import.meta.env.VITE_SHIFT_API_KEY,
});

const allShiftsForDay = ref([]);

const editableNames = ref([]);

onMounted(() => {
  const inputDate = route.query.id;
  if (!inputDate) return;

  client
    .get({ endpoint: 'shiftdata', queries: { limit: 100 } })
    .then((res) => {
      const matches = res.contents.filter(
        (shift) => shift.date?.split('T')[0] === inputDate
      );
      allShiftsForDay.value = matches;

      editableNames.value = matches.flatMap((shift) =>
        Array.isArray(shift.name) ? shift.name : [shift.name]
      );
    })
    .catch((err) => console.error(err));
});

const formattedDate = computed(() => {
  const inputDate = route.query.id;
  if (!inputDate) return '';
  const [year, month, day] = inputDate.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const youbi = weekdays[dateObj.getDay()];
  return `${Number(month)}月${Number(day)}日（${youbi}）`;
});

const addRow = () => {
  editableNames.value.push('');
};

const removeRow = (index) => {
  editableNames.value.splice(index, 1);
};

const submitShift = async () => {
  const inputDate = route.query.id;
  if (!inputDate) return;

  const originalNames = allShiftsForDay.value.map(shift => ({
    id: shift.id,
    name: shift.name.trim(),
  }));

  const cleanedNames = editableNames.value
    .map(name => name.trim())
    .filter(name => name !== '');

  const toDelete = originalNames.filter(
    original => !cleanedNames.includes(original.name)
  );

  const toAdd = cleanedNames.filter(
    name => !originalNames.some(original => original.name === name)
  );

  for (const shift of toDelete) {
    await fetch(`https://${import.meta.env.VITE_SHIFT_DOMAIN}.microcms.io/api/v1/shiftdata/${shift.id}`, {
      method: 'DELETE',
      headers: {
        'X-MICROCMS-API-KEY': import.meta.env.VITE_SHIFT_API_KEY,
      },
    });
  }

  for (const name of toAdd) {
    await fetch(`https://${import.meta.env.VITE_SHIFT_DOMAIN}.microcms.io/api/v1/shiftdata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MICROCMS-API-KEY': import.meta.env.VITE_SHIFT_API_KEY,
      },
      body: JSON.stringify({
        name,
        date: inputDate,
      }),
    });
  }

  alert('シフトを更新しました');
  router.push('/ReservationTableCompact');
};
</script>

<template>
  <div class="shift-edit">
    <h1 class="global-h1">シフト編集</h1>

    <div v-if="editableNames.length > 0">
      <h2>{{ formattedDate }}</h2>

      <div class="shift-list-item" v-for="(name, index) in editableNames" :key="index">
        <input v-model="editableNames[index]" type="text" />
        <button class="remove-btn" @click="removeRow(index)">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>

      <button class="add-btn" @click="addRow">＋ 行を追加</button>
      <div class="button-container">
        <button class="back-button" @click="router.push('/ReservationTableCompact')">戻る</button>
        <button class="submit-button" @click="submitShift">更新</button>
      </div>
    </div>

    <div v-else>
      <h2>{{ formattedDate }}</h2>
      この日に該当するシフトはありません。
      <button class="add-btn" @click="addRow">＋ 行を追加</button>
      <div class="button-container">
        <button class="back-button" @click="router.push('/ReservationTableCompact')">戻る</button>
        <button class="submit-button" @click="submitShift">更新</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: start;
}

.shift-list {
  width: 90%;
  max-width: 500px;
  margin: 0 auto;
  background-color: #fffef8;
  padding: 16px;
  margin-top: 30px;
}

.shift-list-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
}

input[type="text"] {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.remove-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.add-btn {
  margin: 0 auto;
  margin-top: 16px;
  font-size: 16px;
  color: black;
  background-color: #e0e0e0;
  border: 2px dashed #333;
  border-radius: 6px;
  padding: 6px 16px;
  cursor: pointer;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 37px;
  margin-top: 30px;
}

.submit-button,
.back-button {
  width: 130px;
  height: 45px;
  color: black;
  background-color: #fbc02d;
  border: 2px solid #fbc02d;
  border-radius: 12px;
  cursor: pointer;
  font-size: 17px;
  font-weight: bold;
}
</style>
