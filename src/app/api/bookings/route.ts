import { NextRequest, NextResponse } from 'next/server';
import { getBookings, createBooking, cancelBooking, verifyAdmin } from '@/lib/store';

export async function GET() {
  const bookings = getBookings();
  return NextResponse.json({ success: true, data: bookings });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, token, ...data } = body;

    if (action === 'create') {
      const { studentName, phone, requirement, timeSlotId } = data;
      if (!studentName || !phone || !timeSlotId) {
        return NextResponse.json({ error: '请填写完整的预约信息' }, { status: 400 });
      }
      const result = createBooking({ studentName, phone, requirement: requirement || '', timeSlotId });
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'cancel') {
      if (!token || !verifyAdmin(token)) {
        return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
      }
      const { id } = data;
      if (!id) {
        return NextResponse.json({ error: '缺少预约ID' }, { status: 400 });
      }
      const booking = cancelBooking(id);
      if (!booking) {
        return NextResponse.json({ error: '预约不存在' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: booking });
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
}
