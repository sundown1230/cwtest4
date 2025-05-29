import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

const specialties = [
  '内科',
  '外科',
  '小児科',
  '産婦人科',
  '眼科',
  '耳鼻咽喉科',
  '皮膚科',
  '精神科',
  '整形外科',
  '脳神経外科',
  '心臓血管外科',
  '呼吸器外科',
  '消化器外科',
  '泌尿器科',
  '放射線科',
  '麻酔科',
  '病理診断科',
  '臨床検査科',
  '救急科',
  '総合診療科'
];

export async function GET() {
  try {
    return NextResponse.json<ApiResponse<string[]>>({
      success: true,
      data: specialties
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '診療科情報の取得に失敗しました'
    }, { status: 500 });
  }
} 