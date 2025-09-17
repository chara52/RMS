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
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)

const { signup } = useAuth()
const router = useRouter()

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const handleSignup = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  if (!email.value) {
    errorMessage.value = 'メールアドレスが入力されていません。'
    isSubmitting.value = false
    return
  }

  if (!username.value) {
    errorMessage.value = 'ユーザーネームが入力されていません。'
    isSubmitting.value = false
    return
  }

  if (!password.value) {
    errorMessage.value = 'パスワードが入力されていません。'
    isSubmitting.value = false
    return
  }

  if (!confirmPassword.value) {
    errorMessage.value = 'パスワード(確認用)が入力されていません。'
    isSubmitting.value = false
    return
  }

  if (!isValidBirthdayFormat(password.value)) {
    errorMessage.value = 'パスワードの形式が正しくありません。'
    isSubmitting.value = false
    return
  }

  if(password.value !== confirmPassword.value){
    errorMessage.value = 'パスワードが一致しません。'
    isSubmitting.value = false
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
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="container">
    <h1 class="title">居酒屋 壱</h1>
    <form @submit.prevent="handleSignup">
      <input v-model="email" placeholder="メールアドレス" class="input-email" />
      <input v-model="username" placeholder="ユーザーネーム" class="input-username" />
      <div class="password-input-container">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="パスワード"
          class="input-password"
        />
        <button
          type="button"
          class="password-toggle-button"
          @click="togglePasswordVisibility"
        >
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
          <i v-if="!showPassword" class="fa-solid fa-eye-slash"></i>
          <i v-else class="fa-solid fa-eye"></i>
        </button>
      </div>
      <div class="password-input-container">
        <input
          v-model="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="パスワード（確認用）"
          class="input-password-confirmation"
        />
        <button
          type="button"
          class="password-toggle-button"
          @click="toggleConfirmPasswordVisibility"
        >
          <i v-if="!showConfirmPassword" class="fa-solid fa-eye-slash"></i>
          <i v-else class="fa-solid fa-eye"></i>
        </button>
      </div>
      <span class="error-message" v-if="errorMessage">{{ errorMessage }}</span>
      <button :disabled="isSubmitting" class="signup-button">
        {{ isSubmitting ? 'アカウント作成中...' : 'アカウント作成' }}
      </button>
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

.password-input-container {
  position: relative;
  width: 270px;
  margin-bottom: 16px;
}

.password-input-container:last-of-type {
  margin-bottom: 25px;
}

.input-password {
  width: 100%;
  padding: 14px 48px 14px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  font-size: 16px;
  outline: none;
  display: block;
}

.input-password-confirmation {
  width: 100%;
  padding: 14px 48px 14px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  font-size: 16px;
  outline: none;
  display: block;
}

.password-toggle-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 20px;
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

.signup-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #ccc;
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
