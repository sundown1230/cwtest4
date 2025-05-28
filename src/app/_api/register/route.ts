import { NextResponse } from 'next/server';
import { hashPassword } from '@/utils/auth';
import { RegisterRequest, ApiResponse, Doctor } from '@/types';

export async function POST(request: Request) {
  try {
    const body: RegisterRequest = await request.json();
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

    const result = await response.json() as ApiResponse<Doctor>;

    if (!result.success || !result.data) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Registration failed'
      }, { status: 400 });
    }

    const { id, name: doctorName, email: doctorEmail } = result.data;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id,
        name: doctorName,
        email: doctorEmail
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 