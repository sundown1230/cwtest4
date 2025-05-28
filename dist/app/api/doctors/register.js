import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { hash } from 'bcryptjs';
const app = new Hono();
// CORSの設定
app.use('*', cors());
// 医師登録エンドポイント
app.post('/register', async (c) => {
    try {
        const body = await c.req.json();
        const { name, gender, birthdate, licenseDate, specialties, email, password } = body;
        // パスワードのハッシュ化
        const passwordHash = await hash(password, 10);
        // D1データベースに医師情報を保存
        const db = c.env.DB;
        // トランザクション開始
        const result = await db.prepare(`
      INSERT INTO doctors (
        name, gender, birthdate, license_date, email, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(name, gender, birthdate, licenseDate, email, passwordHash).run();
        const doctorId = result.meta.last_row_id;
        // 診療科の保存
        if (specialties && specialties.length > 0) {
            const specialtyValues = specialties.map((specialtyId) => `(${doctorId}, ${specialtyId})`).join(',');
            await db.prepare(`
        INSERT INTO doctor_specialties (doctor_id, specialty_id)
        VALUES ${specialtyValues}
      `).run();
        }
        return c.json({
            success: true,
            message: '医師登録が完了しました',
            doctorId
        });
    }
    catch (error) {
        console.error('医師登録エラー:', error);
        return c.json({
            success: false,
            message: '医師登録に失敗しました',
            error: error.message
        }, 500);
    }
});
export default app;
