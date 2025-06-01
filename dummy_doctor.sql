-- ダミー医師データ（ログイン用）
INSERT INTO doctors (name, gender, birthdate, license_date, email, password_hash)
VALUES ('テスト医師', 'M', '1990-01-01', '2015-04-01', 'test@example.com', '$2b$10$u1FzQwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQW');

-- 診療科（例: 内科）を関連付け
INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES (1, 1); 