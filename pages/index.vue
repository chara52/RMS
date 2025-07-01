<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { isValidBirthdayFormat } from '../composables/passwordValidator'

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const { login } = useAuth()
const router = useRouter()

const handleLogin = async () => {
  if (!email.value) {
    errorMessage.value = 'メールアドレスが入力されていません。'
    return
  }

  if (!password.value) {
    errorMessage.value = 'パスワードが入力されていません。'
    return
  }

  if (!isValidBirthdayFormat(password.value)) {
    errorMessage.value = 'パスワードの形式が正しくありません。'
    return
  }

  try {
    await login(email.value, password.value)
    router.push('/HomePage')
  } catch (e) {
    if (e.code === 'auth/invalid-credential') {
      errorMessage.value = 'メールアドレスまたはパスワードが間違っています。'
    } else {
      errorMessage.value = 'ログインに失敗しました。'
    }
  }
}
</script>

<template>
  <div class="container">
    <h1 class="title">居酒屋 壱</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="email" placeholder="メールアドレス" class="input-email" />
      <input v-model="password" type="password" placeholder="パスワード" class="input-password" />
      <span class="error-message" v-if="errorMessage">{{ errorMessage }}</span>
      <button class="login-button">ログイン</button>
    </form>
    <p class="link-text">
      アカウントをお持ちでない方は
      <NuxtLink to="/Signup" class="link">作成</NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  background-color: #ffffff;
  padding: 16px;
}

.container * {
  box-sizing: border-box;
}

.title {
  font-size: 35px;
  font-weight: bold;
  margin-bottom: 60px;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-email {
  width: 270px;
  padding: 14px 12px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  font-size: 16px;
  outline: none;
  display: block;
}

.input-password {
  width: 270px;
  padding: 14px 12px;
  margin-bottom: 25px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  font-size: 16px;
  outline: none;
  display: block;
}

.error-message {
  color: red;
  font-size: 14px;
  margin: 0px;
}

.login-button {
  width: 270px;
  padding: 14px;
  background-color: #f5a623;
  color: #000;
  font-weight: bold;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 25px;
  transition: background-color 0.3s;
  display: block;
}

.link-text {
  margin-top: 40px;
  font-size: 15px;
  color: #444;
  text-align: center;
}

.link {
  color: blue;
  text-decoration: underline;
  margin-left: 4px;
}
</style>
