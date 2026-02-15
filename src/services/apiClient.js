import axios from 'axios';

/**
 * プロジェクト共通の API クライアント
 */
const apiClient = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// インターセプター（必要に応じて認証トークンの付与などをここで行う）
apiClient.interceptors.response.use(

  // 利用側での response.data の省略
  (response) => response.data,

  // 共通エラーハンドリング
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
