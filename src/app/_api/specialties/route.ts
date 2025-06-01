// src/app/_api/specialties/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 診療科情報を取得する処理
    const specialties = [
      { id: 1, name: '内科' },
      { id: 2, name: '外科' },
      { id: 3, name: '小児科' },
      { id: 4, name: '婦人科' },
      { id: 5, name: '眼科' },
      { id: 6, name: '耳鼻咽喉科' },
      { id: 7, name: '皮膚科' },
      { id: 8, name: '整形外科' },
      { id: 9, name: '精神科' },
      { id: 10, name: '歯科' },
    ];

    return NextResponse.json(specialties);
  } catch (error) {
    return NextResponse.json(
      { error: '診療科情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}