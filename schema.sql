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
-- 初期データは重複を避けるため、一度にまとめて挿入するか、存在しない場合のみ挿入するロジックを推奨しますが、
-- ここでは既存のINSERT文を整理し、追加の診療科を明確にします。
-- 既存のINSERT文は一度削除し、必要なものをまとめて再挿入します。
DELETE FROM specialties; -- 既存のデータを一度クリアする場合（注意：本番環境では慎重に）

-- 医師テーブル
CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_type_id INTEGER NOT NULL DEFAULT 1, -- 1: doctor
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('M', 'F', 'O', 'N')), -- 性別の選択肢を増やすことも検討
    birthdate DATE NOT NULL,
    license_date DATE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- SQLiteでは TIMESTAMP は DATETIME のエイリアス
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
    ('総合内科'), ('循環器内科'), ('消化器内科'), ('呼吸器内科'), ('糖尿病・内分泌内科'),
    ('腎臓内科'), ('神経内科'), ('血液内科'), ('リウマチ科'), ('アレルギー科'),
    ('一般外科'), ('消化器外科'), ('心臓血管外科'), ('呼吸器外科'), ('脳神経外科'),
    ('整形外科'), ('形成外科'), ('美容外科'), ('リハビリテーション科'),
    ('小児科'), ('小児外科'),
    ('産婦人科'), ('産科'), ('婦人科'),
    ('精神科'), ('心療内科'),
    ('皮膚科'), ('美容皮膚科'),
    ('眼科'),
    ('耳鼻咽喉科'),
    ('泌尿器科'),
    ('放射線科'), ('放射線治療科'), ('画像診断科'),
    ('麻酔科'),
    ('救急科'),
    ('病理診断科'),
    ('臨床検査科'),
    ('歯科'), ('口腔外科'), ('矯正歯科'), ('小児歯科'),
    ('漢方内科'),
    ('感染症内科'),
    ('緩和ケア内科'),
    ('老年内科'),
    ('ペインクリニック科'),
    ('人間ドック・健診');


-- ダミーデータの挿入（パスワードは 'password123' のハッシュ値）
INSERT INTO doctors (name, gender, birthdate, license_date, email, password_hash) VALUES
    ('山田太郎', 'M', '1980-01-01', '2005-04-01', 'yamada@example.com', 'GENERATED_HASH_FOR_YAMADA'); /* ここに生成したハッシュ値を入力 */

-- 医師と診療科の関連付け
INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES
    (1, 1),  -- 山田太郎 - 内科
    (1, 13); -- 山田太郎 - 消化器外科 