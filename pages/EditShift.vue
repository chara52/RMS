<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createClient } from 'microcms-js-sdk';
import MenuButtonComponent from '~/components/MenuButton.vue';

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
  const [, month, day] = inputDate.split('-');
  return `${Number(month)}月${Number(day)}日`;
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
  <MenuButtonComponent />
  <div class="shift-edit">
    <h1>シフト編集</h1>

    <div v-if="editableNames.length > 0">
      <h2>{{ formattedDate }}</h2>

      <div v-for="(name, index) in editableNames" :key="index">
        <input v-model="editableNames[index]" type="text" />
        <button @click="removeRow(index)">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>

      <button class="add-btn" @click="addRow">＋ 行を追加</button>
      <div class="button-container">
        <button @click="router.push('/ReservationTableCompact')">戻る</button>
        <button @click="submitShift">更新</button>
      </div>
    </div>

    <div v-else>
      この日に該当するシフトはありません。
      <button class="add-btn" @click="addRow">＋ 行を追加</button>
      <div class="button-container">
        <button @click="router.push('/ReservationTableCompact')">戻る</button>
        <button @click="submitShift">更新</button>
      </div>
    </div>
  </div>
</template>
