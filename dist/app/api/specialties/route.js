import { NextResponse } from 'next/server';
export async function GET() {
    try {
        const response = await fetch(`${process.env.API_URL}/api/specialties`);
        const result = await response.json();
        if (!result.success || !result.data) {
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to fetch specialties'
            }, { status: 400 });
        }
        return NextResponse.json({
            success: true,
            data: result.data
        });
    }
    catch (error) {
        console.error('Specialties fetch error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
