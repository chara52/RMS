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

  // 5分ごとに確認（必要に応じて調整）
  setInterval(checkSession, 5 * 60 * 1000)
})
</script>

<template>
  <div>
    <VitePwaManifest />
    <NuxtPage />
  </div>
</template>
