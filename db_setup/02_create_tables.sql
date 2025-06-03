-- ユーザー種別テーブル
CREATE TABLE user_types (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 診療科マスタテーブル
CREATE TABLE specialties (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 医師テーブル
CREATE TABLE doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_type_id INTEGER NOT NULL DEFAULT 1, -- 1: doctor
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('M', 'F', 'O', 'N')),
    birthdate DATE NOT NULL,
    license_date DATE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_type_id) REFERENCES user_types(id)
);

-- 医師と診療科の中間テーブル
CREATE TABLE doctor_specialties (
    doctor_id INTEGER NOT NULL,
    specialty_id INTEGER NOT NULL,
    PRIMARY KEY (doctor_id, specialty_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (specialty_id) REFERENCES specialties(id)
);