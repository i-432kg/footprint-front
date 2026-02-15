<script setup>
import { ref, reactive } from 'vue';
import userService from '@/services/userService';

/**
 * ログインフォーム
 */
const loginForm = reactive({
  loginId: '',
  password: ''
});

const isLoggingIn = ref(false);

const handleLogin = async () => {
  if (isLoggingIn.value) return;
  isLoggingIn.value = true;
  try {
    await userService.login(loginForm.loginId, loginForm.password);

    // ログイン成功時はタイムラインへ
    window.location.href = '/timeline';
  } catch (error) {
    alert('ログインに失敗しました。IDまたはパスワードを確認してください。');
  } finally {
    isLoggingIn.value = false;
  }
};
</script>

<template>
  <v-form @submit.prevent="handleLogin">
    <v-text-field
      v-model="loginForm.loginId"
      label="ログインID"
      prepend-inner-icon="mdi-account"
      variant="outlined"
      class="mb-2"
      rounded="lg"
      hide-details="auto"
    ></v-text-field>

    <v-text-field
      v-model="loginForm.password"
      label="パスワード"
      prepend-inner-icon="mdi-lock"
      type="password"
      variant="outlined"
      class="mb-4"
      rounded="lg"
      hide-details="auto"
    ></v-text-field>

    <v-btn
      type="submit"
      color="primary"
      block
      size="large"
      rounded="pill"
      :loading="isLoggingIn"
    >
      ログイン
    </v-btn>
  </v-form>
</template>
