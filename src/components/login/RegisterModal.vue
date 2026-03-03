<script setup>
import { ref, reactive, computed } from 'vue';
import { rules as commonRules } from '@/utils/validationRules';
import { uiLogger } from '@/utils/logger';
import { VALIDATION_MESSAGES } from '@/constants/validationMessages';
import { LOG_EVENTS } from '@/constants/logEvents';
import userService from "@/services/userService.js";

/**
 * @property {boolean} modelValue - モーダルの表示状態（v-model）
 */
const props = defineProps({
  modelValue: { type: Boolean, required: true }
});

/**
 * @event update:modelValue - モーダルの表示状態を更新
 * @event registered - 登録完了時に発火
 */
const emit = defineEmits(['update:modelValue', 'registered']);

/** 登録ステップの定義 */
const STEPS = {
  INPUT: 1,
  CONFIRM: 2,
};

/** 現在の入力ステップ */
const step = ref(STEPS.INPUT);

/**
 * 新規登録フォームの入力データ
 *
 * @type {Object}
 * @property {string} email - メールアドレス（ログインID）
 * @property {string} username - ユーザーの表示名
 * @property {string} password - パスワード
 * @property {string} birthdate - 生年月日
 */
const registerForm = reactive({
  email: '',
  username: '',
  password: '',
  birthdate: ''
});

/** 登録処理の実行中フラグ */
const isRegistering = ref(false);

/** v-formコンポーネントへの参照 */
const form = ref(null);

/** フォーム全体の妥当性フラグ */
const isValid = ref(false);

/** 現在入力ステップ（ステップ1）かどうか */
const isInputStep = computed(() => step.value === STEPS.INPUT);

/**
 * 新規登録フォーム専用のバリデーションルール定義
 * @type {Object.<string, Array<Function>>}
 */
const registerRules = {
  email: [
    commonRules.required(VALIDATION_MESSAGES.REQUIRED('メールアドレス')),
    commonRules.email()
  ],
  username: [
    commonRules.required(VALIDATION_MESSAGES.REQUIRED('表示名')),
    commonRules.min(4),
    commonRules.max(20),
    commonRules.alphanumericUnderscore()
  ],
  password: [
    commonRules.required(VALIDATION_MESSAGES.REQUIRED('パスワード')),
    commonRules.min(8)
  ],
  birthdate: [
    commonRules.required(VALIDATION_MESSAGES.SELECT_REQUIRED('生年月日'))
  ]
};

/**
 * 次のステップ（確認画面）へ進む
 * バリデーションが成功している場合のみ遷移する
 */
const nextStep = async () => {
  // バリデーション実行
  const { valid } = await form.value.validate();
  if (!valid) {
    uiLogger.warn(LOG_EVENTS.AUTH.SIGNUP_VALIDATION_FAIL);
    return;
  }

  // 次のステップに進む
  step.value = STEPS.CONFIRM;
  uiLogger.info(LOG_EVENTS.AUTH.SIGNUP_CONFIRM_OPEN);
};

/**
 * 登録処理を実行する
 * @async
 * @returns {Promise<void>}
 */
const handleRegister = async () => {

  // 二重送信の防止
  if (isRegistering.value) return;
  isRegistering.value = true;

  try {
    await userService.signup(registerForm);
    uiLogger.info(LOG_EVENTS.AUTH.SIGNUP_SUCCESS, { email: registerForm.email });
    emit('registered');
    closeModal();
  } catch (error) {
    uiLogger.error(LOG_EVENTS.AUTH.SIGNUP_FAILURE, { email: registerForm.email, reason: error.message });
    alert('登録に失敗しました。このメールアドレスは既に使用されている可能性があります。');
  } finally {
    isRegistering.value = false;
  }
};

/**
 * モーダルを閉じる
 * ステップを初期化してから親コンポーネントに通知する
 */
const closeModal = () => {
  uiLogger.info(LOG_EVENTS.AUTH.SIGNUP_CLOSE);
  step.value = STEPS.INPUT;
  emit('update:modelValue', false);
};
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="500" persistent @update:model-value="closeModal">
    <v-card rounded="xl">
      <v-card-title class="pa-6 text-h5 font-weight-bold">
        {{ isInputStep ? 'アカウント作成' : '登録内容の確認' }}
      </v-card-title>

      <v-card-text class="pa-6 pt-0">
        <v-form ref="form" v-model="isValid" @submit.prevent="nextStep">
          <v-window v-model="step">
            <!-- ステップ1: 入力 -->
            <v-window-item :value="STEPS.INPUT">
              <v-text-field
                v-model="registerForm.email"
                :rules="registerRules.email"
                label="メールアドレス (ログインID)"
                type="email"
                variant="filled"
                class="mb-2"
                rounded="lg"
              ></v-text-field>
              <v-text-field
                v-model="registerForm.username"
                :rules="registerRules.username"
                label="表示名 (ユーザー名)"
                variant="filled"
                class="mb-2"
                rounded="lg"
              ></v-text-field>
              <v-text-field
                v-model="registerForm.password"
                :rules="registerRules.password"
                label="パスワード"
                type="password"
                variant="filled"
                class="mb-2"
                rounded="lg"
              ></v-text-field>
              <v-text-field
                v-model="registerForm.birthdate"
                :rules="registerRules.birthdate"
                label="生年月日"
                type="date"
                variant="filled"
                rounded="lg"
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
                <v-list-item title="メールアドレス" :subtitle="registerForm.email"></v-list-item>
                <v-list-item title="表示名" :subtitle="registerForm.username"></v-list-item>
                <v-list-item title="生年月日" :subtitle="registerForm.birthdate"></v-list-item>
              </v-list>
            </v-window-item>
          </v-window>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-btn
          variant="text"
          color="grey-darken-1"
          rounded="pill"
          @click="step === STEPS.INPUT ? closeModal() : step = STEPS.INPUT"
        >
          {{ isInputStep ? 'キャンセル' : '戻る' }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          rounded="pill"
          min-width="120"
          :loading="isRegistering"
          :disabled="isInputStep && !isValid"
          @click="isInputStep ? step = STEPS.CONFIRM : handleRegister()"
        >
          {{ isInputStep ? '次へ' : '登録する' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
