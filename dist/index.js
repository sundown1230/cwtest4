import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import { hash } from 'bcryptjs';
const app = new Hono();
// CORSの設定
app.use('*', cors());
// 静的ファイルの提供
app.get('/*', serveStatic({ root: './' }));
// 医師登録エンドポイント
app.post('/api/doctors/register', async (c) => {
    try {
        const body = await c.req.json();
        const { name, gender, birthdate, licenseDate, specialties, email, password } = body;
        // パスワードのハッシュ化
        const passwordHash = await hash(password, 10);
        // D1データベースに医師情報を保存
        const db = c.env.DB;
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
            error: error instanceof Error ? error.message : '不明なエラー'
        }, 500);
    }
});
// 医師一覧取得エンドポイント
app.get('/api/doctors', async (c) => {
    try {
        const db = c.env.DB;
        const doctors = await db.prepare(`
      SELECT 
        d.id,
        d.name,
        d.gender,
        d.birthdate,
        d.license_date,
        d.email,
        GROUP_CONCAT(s.name) as specialties
      FROM doctors d
      LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
      LEFT JOIN specialties s ON ds.specialty_id = s.id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `).all();
        const formattedDoctors = doctors.results.map((doctor) => ({
            ...doctor,
            specialties: doctor.specialties ? doctor.specialties.split(',') : []
        }));
        return c.json({
            success: true,
            doctors: formattedDoctors
        });
    }
    catch (error) {
        console.error('医師一覧取得エラー:', error);
        return c.json({
            success: false,
            message: '医師一覧の取得に失敗しました',
            error: error instanceof Error ? error.message : '不明なエラー'
        }, 500);
    }
});
// 診療科一覧取得エンドポイント
app.get('/api/specialties', async (c) => {
    try {
        const db = c.env.DB;
        const specialties = await db.prepare(`
      SELECT id, name
      FROM specialties
      ORDER BY name
    `).all();
        return c.json({
            success: true,
            specialties: specialties.results
        });
    }
    catch (error) {
        console.error('診療科一覧取得エラー:', error);
        return c.json({
            success: false,
            message: '診療科一覧の取得に失敗しました',
            error: error instanceof Error ? error.message : '不明なエラー'
        }, 500);
    }
});
export default app;
