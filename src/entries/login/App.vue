<script setup>
import { ref } from 'vue';
import { useMobileLayout } from '@/composables/useMobileLayout';
import LoginForm from '@/components/login/LoginForm.vue';
import RegisterModal from '@/components/login/RegisterModal.vue';

/**
 * ログイン・新規登録画面
 *
 * 役割:
 * - 既存ユーザーのログイン処理
 * - 新規ユーザー登録モーダルの制御（入力・確認・送信）
 */

/**
 * モバイル向けログイン画面レイアウトかどうか。
 * @type {import('vue').ComputedRef<boolean>}
 */
const { isMobile: isMobileLogin } = useMobileLayout();

/**
 * 新規登録モーダル表示フラグ。
 * @type {import('vue').Ref<boolean>}
 */
const showRegisterModal = ref(false);

/**
 * 登録完了時にタイムライン画面へ遷移する。
 */
const onRegistered = () => {
  window.location.href = '/timeline';
};
</script>

<template>
  <v-app>
    <v-main
      class="d-flex justify-center"
      :class="isMobileLogin ? 'bg-white align-start pt-8' : 'bg-grey-lighten-4 align-center'"
    >
      <v-container class="px-4 py-6">
        <v-row justify="center">
          <v-col cols="12" sm="8" md="4">

            <!-- ヘッダーエリア -->
            <v-card
              :rounded="isMobileLogin ? false : 'xl'"
              :elevation="isMobileLogin ? 0 : 12"
              :variant="isMobileLogin ? 'flat' : 'elevated'"
              :color="isMobileLogin ? 'transparent' : undefined"
              :class="isMobileLogin ? 'pa-0' : 'pa-4 pa-sm-6'"
            >
              <v-card-item
                :class="isMobileLogin ? 'text-left px-0 mb-8' : 'text-center mb-4 mb-sm-6'"
              >
                <v-card-title
                  class="font-weight-black text-primary mb-2"
                  :class="isMobileLogin ? 'text-h3 px-0' : 'text-h3'"
                >
                  Footprint
                </v-card-title>
                <v-card-subtitle
                  :class="isMobileLogin ? 'text-body-1 px-0' : 'text-body-1'"
                >
                  思い出の場所を共有しよう
                </v-card-subtitle>
              </v-card-item>

              <!-- ログインフォーム -->
              <LoginForm />

              <v-divider class="my-6 my-sm-8">
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
