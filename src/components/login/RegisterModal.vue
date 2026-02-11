<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';

/**
 * 新規登録モーダル
 */
const props = defineProps({
  modelValue: { type: Boolean, required: true }
});

const emit = defineEmits(['update:modelValue', 'registered']);

/** 登録ステップの定義 */
const STEPS = {
  INPUT: 1,
  CONFIRM: 2,
};

const step = ref(STEPS.INPUT);
const isRegistering = ref(false);

const registerForm = reactive({
  loginId: '',
  password: '',
  birthDate: ''
});

/** 登録処理 */
const handleRegister = async () => {
  if (isRegistering.value) return;
  isRegistering.value = true;
  try {
    await axios.post('/api/signup', registerForm);
    emit('registered');
    closeModal();
  } catch (error) {
    alert('登録に失敗しました。このIDは既に使用されている可能性があります。');
  } finally {
    isRegistering.value = false;
  }
};

const closeModal = () => {
  step.value = STEPS.INPUT;
  emit('update:modelValue', false);
};
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="500" persistent @update:model-value="closeModal">
    <v-card rounded="xl">
      <v-card-title class="pa-6 text-h5 font-weight-bold">
        {{ step === STEPS.INPUT ? 'アカウント作成' : '登録内容の確認' }}
      </v-card-title>

      <v-card-text class="pa-6 pt-0">
        <v-window v-model="step">
          <!-- ステップ1: 入力 -->
          <v-window-item :value="STEPS.INPUT">
            <v-text-field
              v-model="registerForm.loginId"
              label="ログインID"
              variant="filled"
              class="mb-2"
              rounded="lg"
            ></v-text-field>
            <v-text-field
              v-model="registerForm.password"
              label="パスワード"
              type="password"
              variant="filled"
              class="mb-2"
              rounded="lg"
            ></v-text-field>
            <v-text-field
              v-model="registerForm.birthDate"
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
              <v-list-item title="ログインID" :subtitle="registerForm.loginId"></v-list-item>
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
          @click="step === STEPS.INPUT ? closeModal() : step = STEPS.INPUT"
        >
          {{ step === STEPS.INPUT ? 'キャンセル' : '戻る' }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          rounded="pill"
          min-width="120"
          :loading="isRegistering"
          @click="step === STEPS.INPUT ? step = STEPS.CONFIRM : handleRegister()"
        >
          {{ step === STEPS.INPUT ? '次へ' : '登録する' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
