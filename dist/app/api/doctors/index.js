import { Hono } from 'hono';
import { cors } from 'hono/cors';
const app = new Hono();
// CORSの設定
app.use('*', cors());
// 医師一覧取得エンドポイント
app.get('/', async (c) => {
    try {
        const db = c.env.DB;
        // 医師情報と診療科情報を取得
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
        // 診療科を配列に変換
        const formattedDoctors = doctors.results.map(doctor => ({
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
            error: error.message
        }, 500);
    }
});
export default app;
