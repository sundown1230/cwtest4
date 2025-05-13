// 医師の基本情報
export interface Doctor {
  id: number;
  name: string;
  gender: 'M' | 'F';
  birthdate: string;
  license_date: string;
  email: string;
  specialties: string[];
  created_at: string;
  updated_at: string;
}

// 新規登録時のリクエスト
export interface RegisterRequest {
  name: string;
  gender: 'M' | 'F';
  birthdate: string;
  license_date: string;
  specialties: number[];
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
  userType: 'doctor' | 'hospital';
}

// APIレスポンスの共通型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 