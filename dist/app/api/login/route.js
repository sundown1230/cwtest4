import { NextResponse } from 'next/server';
import { generateToken, verifyPassword } from '@/utils/auth';
export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;
        // データベースからユーザーを取得
        const response = await fetch(`${process.env.API_URL}/api/doctors?email=${email}`);
        const result = await response.json();
        const user = result.data?.[0];
        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'Invalid email or password'
            }, { status: 401 });
        }
        // パスワードを検証
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json({
                success: false,
                error: 'Invalid email or password'
            }, { status: 401 });
        }
        // JWTトークンを生成
        const token = await generateToken({
            id: user.id,
            email: user.email
        });
        return NextResponse.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
