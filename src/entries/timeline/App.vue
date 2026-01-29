<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

import TheHeader from '@/components/layout/Header.vue';
import PostDetailModal from '@/components/post/PostDetailModal.vue';
import { useDateFormatter } from "@/composables/useDateFormatter.js";

/**
 * タイムライン画面（メインエントリーポイント）
 *
 * 役割:
 * - 投稿一覧の表示（リスト/グリッド切り替え）
 * - ユーザー情報の表示と新規投稿への導線（右サイドバー）
 * - 各種モーダル（新規投稿・投稿詳細）の制御
 */
const { formatDate } = useDateFormatter();

/** サーバーから取得した投稿データの配列 */
const posts = ref([]);

/** ログイン中のユーザー名（右サイドバー表示用） */
const username = ref('ゲスト');

/** 投稿詳細モーダルで表示するために選択された投稿オブジェクト */
const selectedPost = ref(null);

/** 新規投稿モーダルの表示フラグ */
const showModal = ref(false);

/** 新規投稿時のテキストコメント（任意） */
const postContent = ref('');

/** 新規投稿用にユーザーが選択した画像ファイル（必須） */
const selectedFile = ref(null);

/**
 * タイムラインの表示形式
 * 'list': 1枚ずつ大きく表示（SNS風）
 * 'grid': 画像をタイル状に並べて表示（ギャラリー風）
 */
const viewMode = ref('list');

// --- コンピューテッド (Computed) ---

/** 画像が選択されていない場合は投稿ボタンを無効化する */
const isPostDisabled = computed(() => !selectedFile.value);

// --- 関数 (Methods) ---

/** 投稿詳細モーダルを開く */
const openDetail = (post) => { selectedPost.value = post; };

/** 投稿詳細モーダルを閉じる */
const closeDetail = () => { selectedPost.value = null; };

/** ファイル選択時に実行され、選択されたファイルを state に保存する */
const onFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

/** 新規投稿をサーバーに送信する */
const submitPost = async () => {
  if (!selectedFile.value) return;
  try {
    const formData = new FormData();
    // コメントは任意なので空文字を許容する
    formData.append('comment', postContent.value || '');
    formData.append('imageFile', selectedFile.value);

    await axios.post('/api/post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // フォームリセット
    showModal.value = false;
    postContent.value = '';
    selectedFile.value = null;

    // 最新の投稿一覧を再取得
    const res = await axios.get('/api/posts');
    posts.value = res.data;
  } catch (error) {
    console.error('投稿に失敗しました:', error);
  }
};

/** 初期表示時 */
onMounted(async () => {
  try {
    const [userRes, postsRes] = await Promise.all([
      axios.get('/api/me'),
      axios.get('/api/posts')
    ]);
    username.value = userRes.data.name;
    posts.value = postsRes.data;
  } catch (error) {
    console.error('データの取得に失敗しました:', error);
  }
});
</script>

<template>
  <div class="app-wrapper">
    <!-- 共通ヘッダー（ナビゲーション） -->
    <TheHeader />

    <div class="main-layout">
      <!-- 左カラム: メインコンテンツ（タイムライン） -->
      <main class="timeline-column">
        <div class="timeline-header">
          <h2>タイムライン</h2>
          <!-- 表示形式の切り替えボタン -->
          <div class="view-switcher">
            <button :class="['switcher-btn', { active: viewMode === 'list' }]" @click="viewMode = 'list'">リスト</button>
            <button :class="['switcher-btn', { active: viewMode === 'grid' }]" @click="viewMode = 'grid'">グリッド</button>
          </div>
        </div>

        <!-- 投稿がない場合の待機表示 -->
        <div v-if="posts.length === 0" class="loading">投稿を読み込み中...</div>

        <!-- 投稿一覧: viewMode に応じて表示切り替え -->
        <div v-else :class="['post-container', `view-${viewMode}`]">
          <article
            v-for="post in posts"
            :key="post.id"
            class="post-card"
            @click="openDetail(post)"
          >
            <!-- 投稿画像エリア -->
            <div class="post-body">
              <img v-if="post.imageUrl" :src="post.imageUrl" alt="投稿画像" class="post-image"/>
            </div>

            <!-- リストモード時のみ表示する付加情報 -->
            <div v-if="viewMode === 'list'" class="post-footer">
              <span class="location" v-if="post.latitude">
                📍 {{ post.latitude.toFixed(4) }}, {{ post.longitude.toFixed(4) }}
              </span>
              <span class="post-date">{{ formatDate(post.createdAt) }}</span>
            </div>
          </article>
        </div>
      </main>

      <!-- 右カラム: ユーザープロフィール & アクション -->
      <aside class="side-column">
        <!-- ユーザー挨拶と投稿ボタン -->
        <section class="user-card">
          <p class="welcome-msg">こんにちは <strong>{{ username }}</strong> さん</p>
          <button class="primary-btn" @click="showModal = true">今どうしてる？</button>
        </section>

        <!-- 拡張セクション -->
        <section class="side-section">
          <h3>未定コンテンツ</h3>
          <div class="placeholder-text">おすすめとか</div>
        </section>
      </aside>
    </div>

    <!-- 投稿詳細モーダル: selectedPost に値があるときのみ描画 -->
    <PostDetailModal v-if="selectedPost" :post="selectedPost" @close="closeDetail" />

    <!-- 新規投稿モーダル: overlay クリックで閉じるために .self 修飾子を使用 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-window">
        <h3>新規投稿</h3>
        <div class="modal-file-input">
          <label>画像を選択（必須）: </label>
          <input type="file" accept="image/*" @change="onFileChange"/>
        </div>
        <textarea v-model="postContent" rows="4" placeholder="コメントを入力（任意）"></textarea>
        <div class="modal-footer">
          <button @click="showModal = false">キャンセル</button>
          <button :disabled="isPostDisabled" @click="submitPost">投稿する</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  padding: 24px 20px;
}
.view-switcher button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
.post-card {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  cursor: pointer;
}
.user-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  text-align: center;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* スイッチャーボタンのスタイル調整 */
.view-switcher {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.switcher-btn {
  padding: 8px 16px;
  border: none;
  background: white;
  color: var(--text-main);
  font-size: 0.9rem;
}

.switcher-btn.active {
  background: var(--primary-color);
  color: white;
}

/* グリッド表示を復活させるための最重要設定 */
.post-container.view-grid {
  display: grid;
  /* 最小 150px、最大 1fr で画面幅に合わせて並べる */
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px; /* グリッド間の隙間 */
}

/* グリッド時の画像アスペクト比固定 */
.view-grid .post-card {
  padding: 0; /* 余計なパディングを削除 */
  border: none;
  border-radius: 4px;
}

.view-grid .post-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
}

/* リスト表示時のスタイル */
.post-container.view-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.view-list .post-card {
  padding: 16px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.view-list .post-image {
  max-width: 100%;
  border-radius: 8px;
}
</style>
