-- ダミー医師データ（ログイン用）
-- user_type_id は doctors テーブルで NOT NULL DEFAULT 1 ですが、明示的に指定します。
INSERT INTO doctors (name, gender, birthdate, license_date, email, password_hash, user_type_id)
VALUES ('テスト医師', 'M', '1990-01-01', '2015-04-01', 'test@example.com', '$2b$10$u1FzQwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQW', 1);

-- 新しく追加した「テスト医師」を診療科「総合内科」に関連付けます。
-- 既にこの関連付けが存在する場合でもエラーにならないように INSERT OR IGNORE を使用します。
-- doctor_id は 'test@example.com' のメールアドレスを持つ医師のIDを動的に検索して使用します。
-- specialty_id は '総合内科' のID (schema.sqlでの挿入順から1と想定) を使用します。
INSERT OR IGNORE INTO doctor_specialties (doctor_id, specialty_id)
SELECT
    (SELECT id FROM doctors WHERE email = 'test@example.com'),
    (SELECT id FROM specialties WHERE name = '総合内科');