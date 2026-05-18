import { NextRequest, NextResponse } from 'next/server';
import { getTimeSlots, getTimeSlotsByDate, addTimeSlot, updateTimeSlot, deleteTimeSlot, verifyAdmin } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const slots = date ? getTimeSlotsByDate(date) : getTimeSlots();
  return NextResponse.json({ success: true, data: slots });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, token, ...data } = body;

    // Verify admin for write operations
    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
    }

    if (action === 'add') {
      const { date, startTime, endTime, teacher } = data;
      if (!date || !startTime || !endTime || !teacher) {
        return NextResponse.json({ error: '请填写完整的时段信息' }, { status: 400 });
      }
      const slot = addTimeSlot({ date, startTime, endTime, teacher, status: 'available' });
      return NextResponse.json({ success: true, data: slot });
    }

    if (action === 'update') {
      const { id, ...updates } = data;
      if (!id) {
        return NextResponse.json({ error: '缺少时段ID' }, { status: 400 });
      }
      const slot = updateTimeSlot(id, updates);
      if (!slot) {
        return NextResponse.json({ error: '时段不存在' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: slot });
    }

    if (action === 'delete') {
      const { id } = data;
      if (!id) {
        return NextResponse.json({ error: '缺少时段ID' }, { status: 400 });
      }
      const ok = deleteTimeSlot(id);
      if (!ok) {
        return NextResponse.json({ error: '时段不存在' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, id, ...updates } = body;

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: '缺少时段ID' }, { status: 400 });
    }

    const slot = updateTimeSlot(id, updates);
    if (!slot) {
      return NextResponse.json({ error: '时段不存在' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: slot });
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, id } = body;

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: '缺少时段ID' }, { status: 400 });
    }

    const ok = deleteTimeSlot(id);
    if (!ok) {
      return NextResponse.json({ error: '时段不存在' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
}
