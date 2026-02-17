<script setup>
import { ref, reactive } from 'vue';
import { rules as commonRules } from '@/utils/validationRules';
import { VALIDATION_MESSAGES } from '@/constants/validationMessages';
import userService from '@/services/userService';
/**
 * ログインフォームの入力データ
 * @type {Object}
 * @property {string} loginId - ログインID
 * @property {string} password - パスワード
 */
const loginForm = reactive({
  loginId: '',
  password: ''
});

/** ログイン処理の実行中フラグ */
const isLoggingIn = ref(false);

/** v-formコンポーネントへの参照 */
const form = ref(null);

/**
 * ログインフォーム専用のバリデーションルール定義
 * @type {Object.<string, Array<Function>>}
 */
const loginRules = {
  loginId: [
    commonRules.required(VALIDATION_MESSAGES.REQUIRED('ログインID')),
    commonRules.alphanumericUnderscore(VALIDATION_MESSAGES.INVALID_FORMAT)
  ],
  password: [
    commonRules.required(VALIDATION_MESSAGES.REQUIRED('パスワード'))
  ]
};

/**
 * ログインフォームの送信処理を行う
 *
 * 1. フォームのバリデーションを実行
 * 2. 認証APIを呼び出す
 * 3. 成功時はタイムライン画面へ、失敗時はエラーメッセージを表示
 *
 * @async
 * @returns {Promise<void>}
 */
const handleLogin = async () => {

  // Vuetifyのバリデーション実行
  const { valid } = await form.value.validate();
  if (!valid) return;

  // 二重送信の防止
  if (isLoggingIn.value) return;
  isLoggingIn.value = true;

  try {
    // ログイン成功時はタイムライン画面へリダイレクトする
    await userService.login(loginForm.loginId, loginForm.password);
    window.location.href = '/timeline';
  } catch (error) {
    alert('ログインに失敗しました。IDまたはパスワードを確認してください。');
  } finally {
    isLoggingIn.value = false;
  }
};
</script>

<template>
  <v-form ref="form" @submit.prevent="handleLogin">
    <v-text-field
      v-model="loginForm.loginId"
      :rules="loginRules.loginId"
      label="ログインID"
      prepend-inner-icon="mdi-account"
      variant="outlined"
      class="mb-2"
      rounded="lg"
      hide-details="auto"
    ></v-text-field>

    <v-text-field
      v-model="loginForm.password"
      :rules="loginRules.password"
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
