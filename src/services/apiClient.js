import axios from 'axios';
import { apiLogger } from '@/utils/logger';

/**
 * Cookie から指定名の値を取得する
 * @param {string} name
 * @returns {string|null}
 */
const getCookieValue = (name) => {
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  const target = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!target) {
    return null;
  }
  return decodeURIComponent(target.substring(name.length + 1));
};

/**
 * アプリケーション全体の共通APIクライアント（Axiosインスタンス）
 *
 * 【主な役割】
 * 1. 共通設定（baseURL, timeout）の適用
 * 2. ログデザインに基づいた通信ログの自動出力
 * 3. サーバー側との相関ID（traceId）の連携
 * 4. レスポンスデータの簡略化（response.data の直接返却）
 * 5. CSRF トークンの自動付与
 */
const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

/**
 * Axios の config に安全にログイベント名を付与するヘルパー関数
 * 静的解析エラー（未知のプロパティ警告）を回避するために利用する。
 *
 * @param {string|Object} logDef イベント名単体、または {event, message} の定数オブジェクト
 * @param {import('axios').AxiosRequestConfig} [config={}] 既存の設定
 * @returns {import('axios').AxiosRequestConfig} ログイベントが付与された設定
 */
export const withLog = (logDef, config = {}) => {
  if (typeof logDef === 'string') {
    config['logEvent'] = logDef;
  } else {
    config['logEvent'] = logDef.event;
    // メッセージが定義されていれば後続のインターセプター等で利用可能（必要に応じて）
  }
  return config;
};

/**
 * リクエスト・インターセプター
 * 通信開始時の処理を定義する。
 */
instance.interceptors.request.use(
  (config) => {
    // 処理時間計算のために開始時間を記録
    config.metadata = { startTime: new Date() };

    const method = config.method?.toUpperCase();

    // CSRF 対象メソッドに対してトークンを付与
    if (method && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      const csrfToken = getCookieValue('XSRF-TOKEN');
      if (csrfToken) {
        config.headers = config.headers || {};
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * レスポンス・インターセプター
 * 通信終了時（成功・失敗）の処理を定義する。
 */
instance.interceptors.response.use(
  /**
   * 成功時の処理
   * @param {import('axios').AxiosResponse} response
   */
  (response) => {
    // 処理時間の計算
    const durationMs = new Date() - response.config.metadata.startTime;
    // サーバー側から返却された相関IDを取得
    const traceId = response.headers['x-trace-id'];

    // 通信成功ログの出力
    apiLogger.info(response.config.logEvent || 'API_SUCCESS', 'API request succeeded', {
      method: response.config.method.toUpperCase(),
      path: response.config.url,
      status: response.status,
      durationMs,
      traceId
    });

    // 利用側での記述を簡略化するため、データ部分のみを返却
    return response.data;
  },

  /**
   * 失敗時の処理（ステータスコードが 2xx 以外の場合）
   * @param {import('axios').AxiosError} error
   */
  (error) => {
    // リクエスト送信前のエラー（タイムアウト、ネットワーク切断など）計算不能の場合、nullとする
    const durationMs = error.config?.metadata
      ? new Date() - error.config.metadata.startTime
      : null;
    const traceId = error.response?.headers['x-trace-id'];
    const status = error.response?.status;

    // ログに付与する詳細情報
    const logData = {
      method: error.config?.method?.toUpperCase(),
      path: error.config?.url,
      status: status,
      durationMs,
      traceId,
      // サーバー側で定義された独自エラーコードがあれば取得
      errorCode: error.response?.data?.code
    };

    // ステータスコードに応じてログレベルを切り分け
    if (status >= 500) {
      // サーバーエラー時は ERROR レベル
      apiLogger.error('API_SERVER_ERROR', error.message, logData);
    } else {
      // 4xx系（バリデーションエラーや認可エラーなど）は WARN レベル
      apiLogger.warn('API_CLIENT_ERROR', error.message, logData);
    }

    // エラーを呼び出し元に伝播させる
    return Promise.reject(error);
  }
);

export default instance;
