-- ユーザー種別を定義する列挙型
CREATE TABLE user_types (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 初期データ: 医師と病院の種別を追加
INSERT INTO user_types (name) VALUES ('doctor'), ('hospital');

-- 診療科マスタ
CREATE TABLE specialties (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 初期データ: 一般的な診療科を追加
INSERT INTO specialties (name) VALUES 
    ('内科'), ('外科'), ('整形外科'), ('小児科'), ('産婦人科'),
    ('眼科'), ('耳鼻咽喉科'), ('皮膚科'), ('精神科'), ('歯科');

-- 医師テーブル
CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_type_id INTEGER NOT NULL DEFAULT 1, -- 1: doctor
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
    birthdate DATE NOT NULL,
    license_date DATE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_type_id) REFERENCES user_types(id)
);

-- 医師と診療科の中間テーブル
CREATE TABLE IF NOT EXISTS doctor_specialties (
    doctor_id INTEGER NOT NULL,
    specialty_id INTEGER NOT NULL,
    PRIMARY KEY (doctor_id, specialty_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (specialty_id) REFERENCES specialties(id)
);

-- インデックスの作成
CREATE INDEX idx_doctors_email ON doctors(email);
CREATE INDEX idx_doctors_user_type ON doctors(user_type_id);

-- 診療科データの挿入
INSERT INTO specialties (name) VALUES
    ('内科'),
    ('外科'),
    ('小児科'),
    ('産婦人科'),
    ('眼科'),
    ('耳鼻咽喉科'),
    ('皮膚科'),
    ('精神科'),
    ('整形外科'),
    ('脳神経外科'),
    ('心臓血管外科'),
    ('呼吸器外科'),
    ('消化器外科'),
    ('泌尿器科'),
    ('放射線科'),
    ('麻酔科'),
    ('病理診断科'),
    ('臨床検査科'),
    ('救急科'),
    ('総合診療科');

-- ダミーデータの挿入（パスワードは 'password123' のハッシュ値）
INSERT INTO doctors (name, gender, birthdate, license_date, email, password_hash) VALUES
    ('山田太郎', 'M', '1980-01-01', '2005-04-01', 'yamada@example.com', '$2b$10$YourHashedPasswordHere');

-- 医師と診療科の関連付け
INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES
    (1, 1),  -- 山田太郎 - 内科
    (1, 13); -- 山田太郎 - 消化器外科 