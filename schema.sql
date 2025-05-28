-- ユーザータイプテーブル
CREATE TABLE IF NOT EXISTS user_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 診療科テーブル
CREATE TABLE IF NOT EXISTS specialties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 医師テーブル
CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('M', 'F')),
    birthdate DATE NOT NULL,
    license_date DATE NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 医師と診療科の関連テーブル
CREATE TABLE IF NOT EXISTS doctor_specialties (
    doctor_id INTEGER NOT NULL,
    specialty_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (doctor_id, specialty_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE CASCADE
);

-- 初期データの挿入
INSERT OR IGNORE INTO user_types (name) VALUES ('doctor'), ('hospital');

INSERT OR IGNORE INTO specialties (name) VALUES 
    ('内科'),
    ('外科'),
    ('小児科'),
    ('産婦人科'),
    ('眼科'),
    ('耳鼻咽喉科'),
    ('皮膚科'),
    ('精神科'),
    ('整形外科'),
    ('脳神経外科');

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email); 