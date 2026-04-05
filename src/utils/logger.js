/**
 * フロントエンドロガー
 * 構造化ログ（JSON）を出力するための基盤クラスです。
 */
class FrontLogger {
  /**
   * @param {'ui' | 'api'} category ログのカテゴリ
   */
  constructor(category) {
    this.category = category;
    this.enabled = import.meta.env.DEV || import.meta.env.MODE === 'staging';
  }

  /**
   * 構造化ログのベースオブジェクトを作成します（内部メソッド）
   * @param {'INFO' | 'WARN' | 'ERROR' | 'DEBUG'} level ログレベル
   * @param {string} event イベント名
   * @param {string} message ログメッセージ
   * @param {Object} extra 付随させる追加情報
   * @returns {Object} 構造化ログオブジェクト
   */
  _createLogObject(level, event, message, extra = {}) {
    return {
      timestamp: new Date().toISOString(), // ISO8601形式のタイムスタンプ
      level: level,
      logger: this.category,
      event: event,
      message: message,
      ...extra,
      // クライアント情報：障害解析時にブラウザ環境や発生場所を特定するために付与
      client: {
        ua: navigator.userAgent,
        url: window.location.href
      }
    };
  }

  /**
   * INFOレベルのログを出力（正常系の主要イベント用）
   * @param {string|Object} eventOrDef イベント名または定数オブジェクト({event, message})
   * @param {string} [message] メッセージ（第一引数が文字列の場合）
   * @param {Object} [extra] 追加情報
   */
  info(eventOrDef, message, extra) {
    if (!this.enabled) return;
    const { event, msg, ext } = this._resolveArgs(eventOrDef, message, extra);
    console.info(JSON.stringify(this._createLogObject('INFO', event, msg, ext)));
  }

  /**
   * WARNレベルのログを出力（想定内の異常、バリデーションエラー等）
   * @param {string|Object} eventOrDef イベント名または定数オブジェクト({event, message})
   * @param {string} [message] メッセージ（第一引数が文字列の場合）
   * @param {Object} [extra] 追加情報
   */
  warn(eventOrDef, message, extra) {
    if (!this.enabled) return;
    const { event, msg, ext } = this._resolveArgs(eventOrDef, message, extra);
    console.warn(JSON.stringify(this._createLogObject('WARN', event, msg, ext)));
  }

  /**
   * ERRORレベルのログを出力（想定外例外、処理継続困難な不具合等）
   * @param {string|Object} eventOrDef イベント名または定数オブジェクト({event, message})
   * @param {string} [message] メッセージ（第一引数が文字列の場合）
   * @param {Object} [extra] 追加情報
   */
  error(eventOrDef, message, extra) {
    if (!this.enabled) return;
    const { event, msg, ext } = this._resolveArgs(eventOrDef, message, extra);
    console.error(JSON.stringify(this._createLogObject('ERROR', event, msg, ext)));
  }

  /**
   * DEBUGレベルのログを出力（開発環境のみ）
   * @param {string|Object} eventOrDef イベント名または定数オブジェクト({event, message})
   * @param {string} [message] メッセージ（第一引数が文字列の場合）
   * @param {Object} [extra] 追加情報
   */
  debug(eventOrDef, message, extra) {
    if (!this.enabled) return;
    const { event, msg, ext } = this._resolveArgs(eventOrDef, message, extra);
    console.debug(JSON.stringify(this._createLogObject('DEBUG', event, msg, ext)));
  }

  /**
   * 引数を解析して event, message, extra を抽出する内部メソッド
   */
  _resolveArgs(eventOrDef, message, extra) {
    if (typeof eventOrDef === 'object' && eventOrDef !== null) {
      return {
        event: eventOrDef.event,
        msg: eventOrDef.message,
        ext: message // 第一引数がオブジェクトの場合、第二引数が extra となる
      };
    }
    return { event: eventOrDef, msg: message, ext: extra };
  }
}

/**
 * UI関連のイベント用ロガー（モーダル開閉、ボタンクリックなど）
 */
export const uiLogger = new FrontLogger('ui');

/**
 * API通信関連のイベント用ロガー（通信の成功・失敗など）
 */
export const apiLogger = new FrontLogger('api');
