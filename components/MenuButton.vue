<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isActive = ref(false)
const toggleMenu = (event) => {
  event.stopPropagation();
  isActive.value = !isActive.value;
};

const menuRef = ref(null);
const onClickOutside = (event) => {
  if (isActive.value && menuRef.value && !menuRef.value.contains(event.target)) {
    isActive.value = false;
  }
};
onMounted(() => {
  document.addEventListener('click', onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
});
</script>

<template>
  <button type="button" class="menu-btn" v-on:click="toggleMenu">
    <span class="icon">&#9776;</span>
  </button>
  <div ref="menuRef" class="menu" v-bind:class="{ 'is-active': isActive }">
    <router-link to="/HomePage" class="btn-link">
      <div class="menu__item">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <i class="fa-solid fa-house"></i>
        <span class="menu__text">ホーム</span>
      </div>
    </router-link>
    <router-link to="/BeforeForm" class="btn-link">
      <div class="menu__item">
        <i class="fa-solid fa-pen"></i>
        <span class="menu__text">新規入力</span>
      </div>
    </router-link>
    <router-link to="/ReservationTableCompact" class="btn-link">
      <div class="menu__item">
        <i class="fa-solid fa-table"></i>
        <span class="menu__text">予約表</span>
      </div>
    </router-link>
    <router-link to="/Shift" class="btn-link">
      <div class="menu__item">
        <i class="fa-solid fa-user-pen"></i>
        <span class="menu__text">シフト作成</span>
      </div>
    </router-link>
  </div>
</template>

<style scoped>
.menu-btn{
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  color: black;
  border: 1px solid black;
}

.menu{
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1;
  width: 70vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgb(223, 220, 220);
  transform: translateX(100vw);
  transition: all .3s linear;
  gap: 1em;
    /* ボタン同士の間隔 */
    padding: 3em 1em;
    /* 全体の余白 */
    box-sizing: border-box;
    /* paddingを含めてサイズを計算 */
}

.menu__item{

  width: 70vw;
  height: auto;
  font-size: 20px;
  /*padding: .5em 1em;*/
  text-align: left;
  color: black;
  box-sizing: border-box;
  position: relative;
  padding: .5em 1em .5em 3.5em;
    /* 左にアイコン分のスペースを追加 */
  display: flex;

  /*
  display: block;
    width: 70vw;
    max-width: 200px;
    padding: 1em;
    font-size: 20px;
    text-align: center;
    color: black;
    border-radius: 8px;
    text-decoration: none;
    transition: background-color 0.2s ease;
  */
}

.menu__item i.fa-solid {
  position: relative;
  width: 0.5em;
  left: -40px; /* アイコンの移動 */
  top: 5px; /* アイコンとテキストの上下を合わせる */
}

.menu__text {
  display: inline-block;
  flex: 100;
}

.menu.is-active{
  transform: translateX(0);
}
</style>
