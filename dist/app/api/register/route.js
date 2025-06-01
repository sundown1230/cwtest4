import { NextResponse } from 'next/server';
import { hashPassword } from '@/utils/auth';
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, gender, birthdate, license_date, specialties, email, password } = body;
        // パスワードをハッシュ化
        const hashedPassword = await hashPassword(password);
        // 医師情報を登録
        const response = await fetch(`${process.env.API_URL}/api/doctors/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                gender,
                birthdate,
                license_date,
                specialties,
                email,
                password: hashedPassword
            })
        });
        const result = await response.json();
        if (!result.success || !result.data) {
            return NextResponse.json({
                success: false,
                error: result.error || 'Registration failed'
            }, { status: 400 });
        }
        const { id, name: doctorName, email: doctorEmail } = result.data;
        return NextResponse.json({
            success: true,
            data: {
                id,
                name: doctorName,
                email: doctorEmail
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
