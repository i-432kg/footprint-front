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

/**
 * 登録ステップの定義（定数）
 */
const REGISTER_STEPS = {
  INPUT: 'input',
  CONFIRM: 'confirm',
};

/**
 * 登録ステップの初期値
 */
const registerStep = ref(REGISTER_STEPS.INPUT);

const isInputStep = computed(() => registerStep.value === REGISTER_STEPS.INPUT);
const isConfirmStep = computed(() => registerStep.value === REGISTER_STEPS.CONFIRM);

const goToConfirm = () => { registerStep.value = REGISTER_STEPS.CONFIRM; };
const goToInput = () => { registerStep.value = REGISTER_STEPS.INPUT; };

/**
 * ログイン処理
 */
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
  registerStep.value = REGISTER_STEPS.INPUT;
};
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <h1 class="logo">Footprint</h1>
      <p class="subtitle">思い出の場所を共有しよう</p>

      <!-- ログインフォーム -->
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <input v-model="loginForm.userId" type="text" placeholder="ユーザーID" required />
        </div>
        <div class="form-group">
          <input v-model="loginForm.password" type="password" placeholder="パスワード" required />
        </div>
        <button type="submit" class="btn-primary full-width" :disabled="isLoggingIn">
          {{ isLoggingIn ? 'ログイン中...' : 'ログイン' }}
        </button>
      </form>

      <div class="divider">
        <span>または</span>
      </div>

      <button class="btn-text" @click="showRegisterModal = true">
        新しくアカウントを作成する
      </button>
    </div>

    <!-- 新規登録モーダル -->
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="closeRegisterModal">
      <div class="modal-window">
        <div class="modal-header">
          <h3>{{ isInputStep ? 'アカウント作成' : '登録内容の確認' }}</h3>
        </div>

        <!-- ステップ1: 入力 -->
        <div v-if="isInputStep" class="register-body">
          <div class="form-group">
            <label>ユーザーID</label>
            <input v-model="registerForm.userId" type="text" />
          </div>
          <div class="form-group">
            <label>パスワード</label>
            <input v-model="registerForm.password" type="password" />
          </div>
          <div class="form-group">
            <label>生年月日</label>
            <input v-model="registerForm.birthDate" type="date" />
          </div>
        </div>

        <!-- ステップ2: 確認 -->
        <div v-else-if="isConfirmStep" class="register-body confirm-view">
          <p>以下の内容で登録しますか？</p>
          <dl>
            <dt>ユーザーID</dt><dd>{{ registerForm.userId }}</dd>
            <dt>生年月日</dt><dd>{{ registerForm.birthDate }}</dd>
          </dl>
        </div>

        <div class="modal-footer">
          <button class="btn-text" @click="isInputStep ? closeRegisterModal() : goToInput()">
            {{ registerStep === 1 ? 'キャンセル' : '戻る' }}
          </button>
          <button
            class="btn-primary"
            @click="isInputStep ? goToConfirm() : handleRegister()"
            :disabled="isRegistering"
          >
            {{ isInputStep ? '次へ' : (isRegistering ? '登録中...' : '登録する') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-container {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.logo {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-muted);
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 16px;
  text-align: left;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 4px;
  color: var(--text-main);
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
}

.divider {
  margin: 24px 0;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.divider span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 0 10px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.full-width {
  width: 100%;
}

.confirm-view dl {
  text-align: left;
  background: var(--bg-color);
  padding: 16px;
  border-radius: 8px;
}
.confirm-view dt {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.confirm-view dd {
  margin: 0 0 12px 0;
  font-weight: bold;
}
</style>
