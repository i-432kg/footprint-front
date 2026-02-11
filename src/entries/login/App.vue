<script setup>
import { ref } from 'vue';
import LoginForm from '@/components/login/LoginForm.vue';
import RegisterModal from '@/components/login/RegisterModal.vue';

/**
 * ログイン・新規登録画面
 *
 * 役割:
 * - 既存ユーザーのログイン処理
 * - 新規ユーザー登録モーダルの制御（入力・確認・送信）
 */

/** 新規登録モーダル表示フラグ */
const showRegisterModal = ref(false);

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

            <!-- ヘッダーエリア -->
            <v-card rounded="xl" elevation="12" class="pa-6">
              <v-card-item class="text-center mb-6">
                <v-card-title class="text-h3 font-weight-black text-primary mb-2">
                  Footprint
                </v-card-title>
                <v-card-subtitle class="text-body-1">
                  思い出の場所を共有しよう
                </v-card-subtitle>
              </v-card-item>

              <!-- ログインフォーム -->
              <LoginForm />

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
