import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

interface Specialty {
  id: number;
  name: string;
}

export async function GET() {
  try {
    const response = await fetch(`${process.env.API_URL}/api/specialties`);
    const result = await response.json() as ApiResponse<Specialty[]>;

    if (!result.success || !result.data) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to fetch specialties'
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Specialties fetch error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 