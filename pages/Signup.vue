<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { isValidBirthdayFormat } from '../composables/passwordValidator'

const email = ref('')
const password = ref('')
const username = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const { signup } = useAuth()
const router = useRouter()

const handleSignup = async () => {
  if (!email.value) {
    errorMessage.value = 'メールアドレスが入力されていません。'
    return
  }

  if (!username.value) {
    errorMessage.value = 'ユーザーネームが入力されていません。'
    return
  }

  if (!password.value) {
    errorMessage.value = 'パスワードが入力されていません。'
    return
  }

  if (!confirmPassword.value) {
    errorMessage.value = 'パスワード(確認用)が入力されていません。'
    return
  }

  if (!isValidBirthdayFormat(password.value)) {
    errorMessage.value = 'パスワードの形式が正しくありません。'
    return
  }

  if(password.value !== confirmPassword.value){
    errorMessage.value = 'パスワードが一致しません。'
    return
  }

  try {
    await signup(email.value, password.value, username.value)
    alert('アカウント作成に成功しました。')
    router.push('/')
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      errorMessage.value = 'このメールアドレスはすでに使用されています。'
    } else {
      errorMessage.value = 'アカウント作成に失敗しました。'
    }
  }
}
</script>

<template>
  <div class="container">
    <h1 class="title">居酒屋 壱</h1>
    <form @submit.prevent="handleSignup">
      <input v-model="email" placeholder="メールアドレス" class="input-email" />
      <input v-model="username" placeholder="ユーザーネーム" class="input-username" />
      <input v-model="password" type="password" placeholder="パスワード" class="input-password" />
      <input v-model="confirmPassword" type="password" placeholder="パスワード（確認用）" class="input-password-confirmation" />
      <span class="error-message" v-if="errorMessage">{{ errorMessage }}</span>
      <button class="signup-button">アカウント作成</button>
    </form>
    <p class="link-text">
      すでにアカウントをお持ちの方は
      <NuxtLink to="/" class="link">ログイン</NuxtLink>
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

.input-email,
.input-password,
.input-username {
  width: 270px;
  padding: 14px 12px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  font-size: 16px;
  outline: none;
}

.input-password-confirmation {
  width: 270px;
  padding: 14px 12px;
  margin-bottom: 25px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  font-size: 16px;
  outline: none;
}

.error-message {
  color: red;
  font-size: 14px;
  margin: 0px;
}

.signup-button {
  width: 270px;
  padding: 14px;
  background-color: #f5a623;
  color: black;
  font-weight: bold;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 25px;
  transition: background-color 0.3s;
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
