import { NextRequest, NextResponse } from 'next/server';
import { adminLogin } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: '请输入用户名和密码' }, { status: 400 });
    }

    const token = adminLogin(username, password);
    if (!token) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    return NextResponse.json({ success: true, token });
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
}
