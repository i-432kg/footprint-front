<script setup>
import { ref, reactive, computed } from 'vue';
import axios from 'axios';

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
const registerForm = reactive({
  userId: '',
  password: '',
  birthDate: ''
});
const isRegistering = ref(false);

/** 登録ステップ */
const step = ref(1);

/** 登録ステップ */
const STEPS = {
  INPUT: 'input',
  CONFIRM: 'confirm',
};

/** 現在の登録ステップ */
const currentStep = ref(STEPS.INPUT);


const handleLogin = async () => {
  if (isLoggingIn.value) return;
  isLoggingIn.value = true;
  try {
    const params = new URLSearchParams();
    params.append('username', loginForm.userId);
    params.append('password', loginForm.password);
    await axios.post('/api/login', params);
    window.location.href = '/timeline'; // 成功したらタイムラインへ
  } catch (error) {
    alert('ログインに失敗しました。IDまたはパスワードを確認してください。');
  } finally {
    isLoggingIn.value = false;
  }
};

/**
 * ユーザ登録処理
 * ユーザ登録完了後、自動でログインする
 */
const handleRegister = async () => {
  if (isRegistering.value) return;
  isRegistering.value = true;
  try {
    await axios.post('/api/signup', registerForm);
    alert('登録が完了しました。ログインします。');
    window.location.href = '/timeline';
  } catch (error) {
    alert('登録に失敗しました。このIDは既に使用されている可能性があります。');
  } finally {
    isRegistering.value = false;
  }
};

/**
 * モーダルを閉じるときのリセット処理
 */
const closeRegisterModal = () => {
  showRegisterModal.value = false;
  step.value = 1;
  currentStep.value = STEPS.INPUT;
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
    <v-dialog v-model="showRegisterModal" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 text-h5 font-weight-bold">
          {{ currentStep === STEPS.INPUT ? 'アカウント作成' : '登録内容の確認' }}
        </v-card-title>

        <v-card-text class="pa-6 pt-0">
          <v-window v-model="currentStep">
            <!-- ステップ1: 入力 -->
            <v-window-item :value="STEPS.INPUT">
              <v-text-field
                v-model="registerForm.userId"
                label="ユーザーID"
                variant="filled"
                class="mb-2"
              ></v-text-field>
              <v-text-field
                v-model="registerForm.password"
                label="パスワード"
                type="password"
                variant="filled"
                class="mb-2"
              ></v-text-field>
              <v-text-field
                v-model="registerForm.birthDate"
                label="生年月日"
                type="date"
                variant="filled"
              ></v-text-field>
            </v-window-item>

            <!-- ステップ2: 確認 -->
            <v-window-item :value="STEPS.CONFIRM">
              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
                text="以下の内容で登録しますか？"
              ></v-alert>
              <v-list class="bg-grey-lighten-4 rounded-lg">
                <v-list-item title="ユーザーID" :subtitle="registerForm.userId"></v-list-item>
                <v-list-item title="生年月日" :subtitle="registerForm.birthDate"></v-list-item>
              </v-list>
            </v-window-item>
          </v-window>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn
            variant="text"
            color="grey-darken-1"
            rounded="pill"
            @click="currentStep === STEPS.INPUT ? closeRegisterModal() : currentStep = STEPS.INPUT"
          >
            {{ step === 1 ? 'キャンセル' : '戻る' }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            rounded="pill"
            min-width="120"
            :loading="isRegistering"
            @click="currentStep === STEPS.INPUT ? currentStep = STEPS.CONFIRM : handleRegister()"
          >
            {{ step === 1 ? '次へ' : '登録する' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style scoped>

</style>
