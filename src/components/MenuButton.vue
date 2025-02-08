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
    <router-link to="/" class="btn-link">
      <div class="menu__item">ホーム</div>
    </router-link>
    <router-link to="/form" class="btn-link">
      <div class="menu__item">新規入力</div>
    </router-link>
    <router-link to="/table" class="btn-link">
      <div class="menu__item">予約表</div>
    </router-link>
  </div>
</template>

<style>
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
}

.menu__item{
  width: 100%;
  height: auto;
  padding: .5em 1em;
  text-align: center;
  color: black;
  box-sizing: border-box;
}

.menu.is-active{
  transform: translateX(0);
}
</style>
