<script setup lang="ts">
import { onMounted } from 'vue'
import { useState, useNuxtApp, navigateTo } from '#app'

const user = useState('user')

onMounted(() => {
  const { $fetch } = useNuxtApp()

  const checkSession = async () => {
    if (!user.value) return

    try {
      const res = await $fetch('/api/verifySession')
      user.value = res.user
    } catch {
      user.value = null
      alert('セッションの有効期限が切れました。再ログインしてください。')
      navigateTo('/')
    }
  }

  // 24時間ごとに確認
  setInterval(checkSession, 24 * 60 * 60 * 1000)
})
</script>

<template>
  <div>
    <VitePwaManifest />
    <NuxtPage />
  </div>
</template>

<style>
.global-h1 {
  font-size: 20px;
  text-align: center;
  margin-top: 10px;
}
</style>
