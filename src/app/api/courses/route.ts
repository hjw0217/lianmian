import { NextResponse } from 'next/server';
import { courses } from '@/lib/store';

export async function GET() {
  return NextResponse.json({ success: true, data: courses });
}
