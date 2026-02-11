<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';
import RegisterModal from '@/components/login/RegisterModal.vue';

/**
 * ログイン・新規登録画面
 *
 * 役割:
 * - 既存ユーザーのログイン処理
 * - 新規ユーザー登録モーダルの制御（入力・確認・送信）
 */
const loginForm = reactive({
  userId: '',
  password: ''
});
const isLoggingIn = ref(false);

const showRegisterModal = ref(false);

const handleLogin = async () => {
  if (isLoggingIn.value) return;
  isLoggingIn.value = true;
  try {
    const params = new URLSearchParams();
    params.append('loginId', loginForm.userId);
    params.append('password', loginForm.password);
    await axios.post('/api/login', params);
    window.location.href = '/timeline'; // 成功したらタイムラインへ
  } catch (error) {
    alert('ログインに失敗しました。IDまたはパスワードを確認してください。');
  } finally {
    isLoggingIn.value = false;
  }
};

/** 登録完了時の処理 */
const onRegistered = () => {
  window.location.href = '/timeline';
};
</script>

<template>
  <v-app>
    <v-main class="bg-grey-lighten-4 d-flex align-center justify-center">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="4">
            <!-- ログインモーダル -->
            <v-card rounded="xl" elevation="12" class="pa-6">
              <v-card-item class="text-center mb-6">
                <v-card-title class="text-h3 font-weight-black text-primary mb-2">
                  Footprint
                </v-card-title>
                <v-card-subtitle class="text-body-1">
                  思い出の場所を共有しよう
                </v-card-subtitle>
              </v-card-item>

              <v-form @submit.prevent="handleLogin">
                <v-text-field
                  v-model="loginForm.userId"
                  label="ユーザーID"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  class="mb-2"
                  rounded="lg"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="loginForm.password"
                  label="パスワード"
                  prepend-inner-icon="mdi-lock"
                  type="password"
                  variant="outlined"
                  class="mb-4"
                  rounded="lg"
                  required
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

              <v-divider class="my-8">
                <span class="text-caption text-grey mx-2">または</span>
              </v-divider>

              <v-btn
                variant="text"
                block
                class="text-none"
                @click="showRegisterModal = true"
              >
                新しくアカウントを作成する
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- 新規登録モーダル -->
    <RegisterModal
      v-model="showRegisterModal"
      @registered="onRegistered"
    />
  </v-app>
</template>

<style scoped>

</style>
