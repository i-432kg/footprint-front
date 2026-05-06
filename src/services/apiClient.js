import { apiLogger } from '@/utils/logger';

const API_BASE_URL = '/api';
const DEFAULT_TIMEOUT_MS = 10000;
const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD']);
const METHODS_WITHOUT_CSRF = new Set(['GET', 'HEAD', 'OPTIONS']);

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
 * @typedef {Object} ApiRequestConfig
 * @property {Object<string, string>} [headers]
 * @property {Object<string, string | number | boolean | null | undefined | Array<string | number | boolean>>} [params]
 * @property {string} [logEvent]
 * @property {number} [timeout]
 * @property {AbortSignal} [signal]
 */

/**
 * @typedef {Error & {
 *  status?: number,
 *  code?: string,
 *  response?: { status: number, data: any, headers: Headers },
 *  config?: { method: string, url: string, logEvent?: string }
 * }} ApiError
 */

/**
 * APIリクエスト設定にログイベントを付与するヘルパー関数
 *
 * @param {string|Object} logDef イベント名単体、または {event, message} の定数オブジェクト
 * @param {ApiRequestConfig} [config={}] 既存の設定
 * @returns {ApiRequestConfig} ログイベントが付与された設定
 */
export const withLog = (logDef, config = {}) => {
  if (typeof logDef === 'string') {
    config.logEvent = logDef;
  } else {
    config.logEvent = logDef.event;
  }
  return config;
};

/**
 * パスとクエリパラメータから API URL を組み立てる
 *
 * @param {string} path
 * @param {ApiRequestConfig['params']} params
 * @returns {string}
 */
const buildUrl = (path, params) => {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  if (!params) {
    return `${url.pathname}${url.search}`;
  }

  // axios の params 相当を URLSearchParams へ明示的に展開する。
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined) {
          url.searchParams.append(key, String(item));
        }
      });
      return;
    }

    url.searchParams.append(key, String(value));
  });

  return `${url.pathname}${url.search}`;
};

/**
 * fetch に渡すボディとヘッダを整形する
 *
 * @param {string} method
 * @param {any} body
 * @param {Headers} headers
 * @returns {BodyInit | undefined}
 */
const prepareBody = (method, body, headers) => {
  if (body === undefined || METHODS_WITHOUT_BODY.has(method)) {
    return undefined;
  }

  // FormData や URLSearchParams はブラウザにそのまま送信させる。
  if (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    typeof body === 'string'
  ) {
    return body;
  }

  if (!headers.has('Content-Type')) {
    // plain object のみ JSON とみなして共通でシリアライズする。
    headers.set('Content-Type', 'application/json');
  }

  return JSON.stringify(body);
};

/**
 * レスポンス本文を安全に解析する
 *
 * @param {Response} response
 * @returns {Promise<any>}
 */
const parseResponseBody = async (response) => {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  // 一度 text として読み、JSON / 空文字 / プレーンテキストを安全に吸収する。
  const text = await response.text();
  if (!text) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return JSON.parse(text);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

/**
 * レスポンスエラーを生成する
 *
 * @param {Object} args
 * @param {string} args.message
 * @param {number} args.status
 * @param {any} args.data
 * @param {Headers} args.headers
 * @param {string} args.method
 * @param {string} args.path
 * @param {string} [args.logEvent]
 * @returns {ApiError}
 */
const createApiError = ({ message, status, data, headers, method, path, logEvent }) => {
  const error = /** @type {ApiError} */ (new Error(message));
  error.name = 'ApiError';
  error.status = status;
  error.code = data?.code;
  error.response = { status, data, headers };
  error.config = { method, url: path, logEvent };
  return error;
};

/**
 * 通信失敗ログを出力する
 *
 * @param {ApiError | Error} error
 * @param {Object} logData
 */
const logRequestFailure = (error, logData) => {
  if (typeof logData.status === 'number' && logData.status >= 500) {
    apiLogger.error('API_SERVER_ERROR', error.message, logData);
    return;
  }

  apiLogger.warn('API_CLIENT_ERROR', error.message, logData);
};

/**
 * fetch ベースの共通APIクライアント
 *
 * @param {string} method
 * @param {string} path
 * @param {any} [body]
 * @param {ApiRequestConfig} [config={}]
 * @returns {Promise<any>}
 */
const request = async (method, path, body, config = {}) => {
  const startedAt = Date.now();
  const upperMethod = method.toUpperCase();
  const requestPath = buildUrl(path, config.params);
  const headers = new Headers(config.headers || {});
  let response;

  // 安全メソッド以外は Spring Security 向けに CSRF トークンを付与する。
  if (!METHODS_WITHOUT_CSRF.has(upperMethod)) {
    const csrfToken = getCookieValue('XSRF-TOKEN');
    if (csrfToken) {
      headers.set('X-XSRF-TOKEN', csrfToken);
    }
  }

  const timeoutController = new AbortController();
  const timeoutMs = config.timeout ?? DEFAULT_TIMEOUT_MS;
  const timeoutId = window.setTimeout(() => timeoutController.abort(), timeoutMs);

  // タイムアウトと呼び出し元 signal のどちらでも中断できるように統合する。
  const abortController = new AbortController();
  const abort = () => abortController.abort();
  timeoutController.signal.addEventListener('abort', abort);
  config.signal?.addEventListener('abort', abort);

  if (config.signal?.aborted) {
    abortController.abort(config.signal.reason);
  }

  try {
    response = await fetch(requestPath, {
      method: upperMethod,
      headers,
      body: prepareBody(upperMethod, body, headers),
      credentials: 'same-origin',
      signal: abortController.signal,
    });
  } catch (error) {
    // ネットワーク断や AbortError も呼び出し側では同じ API エラーとして扱える形へそろえる。
    const message = error instanceof DOMException && error.name === 'AbortError'
      ? timeoutController.signal.aborted
        ? `Request timed out after ${timeoutMs}ms`
        : 'Request was aborted'
      : error instanceof Error
        ? error.message
        : 'Unknown API request error';

    const requestError = /** @type {ApiError} */ (new Error(message));
    requestError.name = 'ApiError';
    requestError.config = { method: upperMethod, url: requestPath, logEvent: config.logEvent };

    logRequestFailure(requestError, {
      method: upperMethod,
      path: requestPath,
      status: null,
      durationMs: Date.now() - startedAt,
      traceId: null,
      errorCode: null,
    });

    throw requestError;
  } finally {
    // タイマーとイベント購読を片付け、連続リクエスト時のリークを防ぐ。
    window.clearTimeout(timeoutId);
    timeoutController.signal.removeEventListener('abort', abort);
    config.signal?.removeEventListener('abort', abort);
  }

  const data = await parseResponseBody(response);
  const durationMs = Date.now() - startedAt;
  const traceId = response.headers.get('x-trace-id');

  // fetch は 4xx/5xx で reject しないため、レスポンス取得後に HTTP エラーを明示的に例外化する。
  if (!response.ok) {
    const error = createApiError({
      message: data?.message || `Request failed with status ${response.status}`,
      status: response.status,
      data,
      headers: response.headers,
      method: upperMethod,
      path: requestPath,
      logEvent: config.logEvent,
    });

    logRequestFailure(error, {
      method: upperMethod,
      path: requestPath,
      status: response.status,
      durationMs,
      traceId,
      errorCode: data?.code,
    });

    throw error;
  }

  apiLogger.info(config.logEvent || 'API_SUCCESS', 'API request succeeded', {
    method: upperMethod,
    path: requestPath,
    status: response.status,
    durationMs,
    traceId,
  });

  return data;
};

export default {
  /**
   * GET リクエスト
   * @param {string} path
   * @param {ApiRequestConfig} [config]
   * @returns {Promise<any>}
   */
  get(path, config) {
    return request('GET', path, undefined, config);
  },

  /**
   * POST リクエスト
   * @param {string} path
   * @param {any} body
   * @param {ApiRequestConfig} [config]
   * @returns {Promise<any>}
   */
  post(path, body, config) {
    return request('POST', path, body, config);
  }
};
