// 医師の基本情報
export interface Doctor {
  id: number;
  user_type_id?: number; // doctors.ts の Doctor 型と合わせるか、必要に応じて調整
  name: string;
  gender: 'M' | 'F' | 'O' | 'N'; // schema.sql の CHECK 制約と合わせる
  birthdate: string; // ISO 8601 date string (YYYY-MM-DD)
  license_date: string; // ISO 8601 date string (YYYY-MM-DD)
  email: string;
  // password_hash は通常フロントエンドには含めません
  created_at?: string; // ISO 8601 datetime string
  updated_at?: string; // ISO 8601 datetime string
  specialties?: Specialty[]; // 診療科情報は Specialty オブジェクトの配列として扱うことを推奨
}

export interface Specialty {
  id: number;
  name: string;
}


// 新規登録時のリクエスト
export interface RegisterRequest {
  name: string;
  gender: 'M' | 'F' | 'O' | 'N'; // schema.sql の doctors テーブルの gender CHECK 制約と合わせる
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
  message?: string; // 一般的なメッセージ (成功時またはエラー時)
  details?: any; // エラー詳細情報用
}

export interface User {
  id: number;
  name: string;
  email: string;
  gender: 'M' | 'F' | 'O' | 'N';
  birthdate: string;
  license_date: string;
  specialties: string[];
  created_at: string;
  updated_at: string;
} 

// データベースの doctors テーブルのレコードを表す型 (サーバーサイド用)
export interface DoctorDbRecord {
  id: number;
  user_type_id: number;
  name: string;
  gender: 'M' | 'F' | 'O' | 'N';
  birthdate: string; // ISO 8601 date string (YYYY-MM-DD)
  license_date: string; // ISO 8601 date string (YYYY-MM-DD)
  email: string;
  password_hash: string; // 認証に使用するパスワードハッシュ
  created_at?: string; // ISO 8601 datetime string (DB側で自動生成される場合はオプショナル)
  updated_at?: string; // ISO 8601 datetime string (DB側で自動生成される場合はオプショナル)
  // specialties は doctor_specialties テーブルで別途管理されるため、この型には直接含めない
}

// APIレスポンスやフロントエンドで診療科情報を含めて医師情報を扱うための型
export interface WorkerDoctor {
  id: number;
  name: string;
  gender: 'M' | 'F' | 'O' | 'N';
  birthdate: string;
  license_date: string;
  email: string;
  specialties: Specialty[]; // 医師が持つ診療科のリスト
}