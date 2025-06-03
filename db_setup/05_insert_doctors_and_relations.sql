-- ダミー医師データの挿入
INSERT INTO doctors (user_type_id, name, gender, birthdate, license_date, email, password_hash) VALUES
    (1, '山田太郎', 'M', '1980-01-01', '2005-04-01', 'yamada@example.com', '$2a$10$KorusqgH2A6WfX2kXyTjR.cvU.VAqXpWJBCk8xYj3bJkXyTjR.cvU');

-- 医師と診療科の関連付け
-- 注意: このINSERTは、上記のdoctorsとspecialtiesのデータが正しく挿入された後に実行してください。
-- specialty_id は INSERT OR IGNORE のため、実際のIDと異なる可能性があります。
-- 正確なIDを指定するためには、事前にSELECTでIDを取得するか、名前で紐付けるサブクエリを使用します。
-- ここでは簡略化のため、schema.sqlの値をそのまま使用しますが、本番では注意が必要です。
INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES
    ( (SELECT id FROM doctors WHERE email = 'yamada@example.com'), (SELECT id FROM specialties WHERE name = '総合内科') ),
    ( (SELECT id FROM doctors WHERE email = 'yamada@example.com'), (SELECT id FROM specialties WHERE name = '消化器外科') );