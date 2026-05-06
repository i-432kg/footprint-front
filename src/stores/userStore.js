import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * ユーザー情報管理ストア
 *
 * 役割:
 * - ログイン中のユーザー情報をメモリ上で保持する
 * - Thymeleaf から読み取った初期情報をセットする
 */
export const useUserStore = defineStore('user', () => {
  /**
   * ユーザー名
   */
  const username = ref('ゲスト');

  /**
   * ユーザー名をセットする
   *
   * @param {string} name - ログインユーザーの名前
   */
  function setUsername(name) {
    if (name) {
      username.value = name;
    }
  }

  return {
    username,
    setUsername
  };
});
