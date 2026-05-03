<script setup>
import { ref } from 'vue';
import { useMobileLayout } from '@/composables/useMobileLayout';
import LoginForm from '@/components/login/LoginForm.vue';
import RegisterModal from '@/components/login/RegisterModal.vue';

const titleLogoUrl = new URL('../../assets/footprint-title-logo.svg', import.meta.url).href;

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
      class="d-flex"
      :class="isMobileLogin ? 'bg-white align-start' : 'bg-grey-lighten-5 align-center'"
    >
      <v-container class="px-5 px-sm-8 py-8 py-md-12" max-width="1180">
        <v-row
          class="ga-6 ga-md-0"
          align="center"
          justify="space-between"
        >
          <v-col cols="12" md="7" class="d-flex align-center">
            <!-- ヘッダーエリア -->
            <section>
              <v-img
                :src="titleLogoUrl"
                alt="Footprint"
                :width="isMobileLogin ? 280 : 480"
                class="mb-4 mb-md-6"
              />
              <p class="text-blue-grey-darken-4 text-h6 text-md-h4 font-weight-bold">
                思い出の場所を見つけて、記録して、だれかの次の一歩につなげよう。
              </p>
            </section>
          </v-col>

          <v-col cols="12" md="5" class="ml-md-auto">
            <!-- ログインカード -->
            <v-card
              class="pa-5 pa-sm-6 pa-md-8 border mx-auto mr-md-0"
              max-width="440"
              :rounded="isMobileLogin ? 'lg' : 'xl'"
              :elevation="isMobileLogin ? 0 : 12"
              variant="elevated"
            >
              <v-card-item class="px-0 pt-0 mb-5 mb-md-7">
                <v-card-title
                  class="text-h4 text-md-h3 font-weight-black px-0"
                >
                  ログイン
                </v-card-title>
                <v-card-subtitle class="text-body-2 text-sm-body-1 px-0 mt-1">
                  アカウントにログインして続ける
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
