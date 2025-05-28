// 医師の基本情報
export interface Doctor {
  id: number;
  name: string;
  gender: 'M' | 'F';
  birthdate: string;
  license_date: string;
  email: string;
  password: string;
  specialties: string[];
}

// 新規登録時のリクエスト
export interface RegisterRequest {
  name: string;
  gender: 'M' | 'F';
  birthdate: string;
  license_date: string;
  specialties: string[];
  email: string;
  password: string;
}

// ログイン時のリクエスト
export interface LoginRequest {
  email: string;
  password: string;
}

// JWTペイロード
export interface JWTPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

// APIレスポンスの共通型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  gender: 'M' | 'F';
  birthdate: string;
  license_date: string;
  specialties: string[];
  created_at: string;
  updated_at: string;
} 