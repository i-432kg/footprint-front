<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { rules as commonRules } from '@/utils/validationRules';
import { VALIDATION_MESSAGES } from '@/constants/validationMessages';
import postService from '@/services/postService';

/**
 * サイドバー：ユーザーアクションコンポーネント
 *
 * 役割:
 * - ログインユーザー情報の表示
 * - 新規投稿モーダルの提供（画像選択・コメント入力）
 * - 投稿データの送信制御
 */

/** @event submitted - 投稿成功時に発火（親コンポーネントでのリスト更新用） */
const emit = defineEmits(['submitted']);

const userStore = useUserStore();

/** ログイン中のユーザー名 */
const username = computed(() => userStore.username);

/** 新規投稿モーダルの表示フラグ */
const showModal = ref(false);

/** 投稿コメントの入力値 */
const postContent = ref('');

/** 選択された画像ファイル */
const selectedFile = ref(null);

/** 選択された画像のプレビュー用URL */
const previewUrl = ref(null);

/** 投稿処理の実行中フラグ */
const isSubmitting = ref(false);

/** 投稿ボタンの無効化判定 */
const isPostDisabled = computed(() => !selectedFile.value || isSubmitting.value);

/** v-formコンポーネントへの参照 */
const form = ref(null);

/** フォーム全体の妥当性フラグ */
const isValid = ref(false);

/**
 * 新規投稿フォーム専用のバリデーションルール定義
 * @type {Object.<string, Array<Function>>}
 */
const postRules = {
  image: [
    commonRules.required(VALIDATION_MESSAGES.SELECT_REQUIRED('画像')),
    commonRules.fileSize(5),
    commonRules.imageType
  ],
  content: [
    commonRules.max(100)
  ]
};

/**
 * ファイル選択時のハンドリング
 * プレビューURLの生成と古いURLの破棄を行う
 *
 * @param {Event} event - input[type="file"] の change イベント
 */
const onFileChange = (event) => {

  // 古いプレビュー情報を破棄
  clearPreview();

  const files = event.target.files;
  if (files && files.length > 0) {
    selectedFile.value = files[0];

    // 画像プレビューを作成
    previewUrl.value = URL.createObjectURL(files[0]);
  } else {
    selectedFile.value = null;
  }
};

/** プレビューURLの解放 */
const clearPreview = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
};

/**
 * 新規投稿を送信する
 * 成功時はモーダルを閉じ、入力をリセットする
 *
 * @async
 * @returns {Promise<void>}
 */
const submitPost = async () => {
  if (!selectedFile.value) return;

  // Vuetify のバリデーション実行
  const { valid } = await form.value.validate();
  if (!valid) return;

  isSubmitting.value = true;
  try {
    await postService.createPost({
      comment: postContent.value,
      imageFile: selectedFile.value
    });

    closeModal();
    emit('submitted'); // 投稿成功を親に通知
  } catch (error) {
    console.error('投稿失敗:', error);
    alert('投稿に失敗しました。');
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * モーダルを閉じ、入力フォームとプレビューの状態をリセットする
 */
const closeModal = () => {
  showModal.value = false;
  postContent.value = '';
  selectedFile.value = null;
  clearPreview();
};
</script>

<template>
  <!-- プロフィールカード -->
  <v-card class="pa-4 rounded-xl mb-4" border flat>
    <v-list-item class="px-0">
      <template v-slot:prepend>
        <v-avatar color="primary" class="text-white">{{ username.charAt(0) }}</v-avatar>
      </template>
      <v-list-item-title class="font-weight-bold">こんにちは {{ username }} さん</v-list-item-title>
    </v-list-item>
    <v-btn
      block
      color="primary"
      class="mt-4 rounded-pill"
      size="large"
      @click="showModal = true"
    >
      今どうしてる？
    </v-btn>
  </v-card>

  <!-- 新規投稿モーダル -->
  <v-dialog v-model="showModal" max-width="500">
    <v-card rounded="xl">
      <v-card-title class="font-weight-bold pa-4">新規投稿</v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-4">
        <v-form ref="form" v-model="isValid">
          <!-- 画像選択エリア -->
          <v-file-input
            v-model="selectedFile"
            :rules="postRules.image"
            label="画像を選択（必須）"
            accept="image/*"
            prepend-icon="mdi-camera"
            variant="filled"
            rounded="lg"
            @change="onFileChange"
            @click:clear="onFileChange({ target: { files: [] } })"
            class="mb-4"
          ></v-file-input>

          <!-- 画像プレビュー表示エリア -->
          <v-expand-transition>
            <div v-if="previewUrl" class="mb-4">
              <v-img
                :src="previewUrl"
                class="rounded-lg bg-grey-lighten-2"
                max-height="300"
                cover
              ></v-img>
            </div>
          </v-expand-transition>

          <!-- コメント入力エリア -->
          <v-textarea
            v-model="postContent"
            :rules="postRules.content"
            :counter="100"
            maxlength="100"
            placeholder="コメントを入力（任意）"
            variant="filled"
            rounded="lg"
            rows="4"
          ></v-textarea>
        </v-form>
      </v-card-text>

      <!-- フッター -->
      <v-card-actions class="pa-4">
        <v-btn variant="text" rounded="pill" @click="showModal = false">キャンセル</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          rounded="pill"
          :loading="isSubmitting"
          :disabled="isPostDisabled"
          @click="submitPost"
        >
          投稿する
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
