import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
export async function GET(request) {
    try {
        // 認証トークンを取得
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const payload = await verifyToken(token);
        // ユーザー情報を取得
        const response = await fetch(`${process.env.API_URL}/api/doctors/${payload.id}`);
        const result = await response.json();
        if (!result.success || !result.data) {
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to fetch user profile'
            }, { status: 400 });
        }
        const { id, name, gender, birthdate, license_date, email, specialties } = result.data;
        return NextResponse.json({
            success: true,
            data: {
                id,
                name,
                gender,
                birthdate,
                license_date,
                email,
                specialties
            }
        });
    }
    catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
