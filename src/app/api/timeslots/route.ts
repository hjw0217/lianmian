import { NextResponse } from 'next/server';
import { getTimeSlots } from '@/lib/store';

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapSlot(s: any) {
  return {
    id: s.id,
    date: s.date,
    startTime: s.start_time,
    endTime: s.end_time,
    teacher: s.teacher,
    status: s.status,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const slots = await getTimeSlots(date);
    const mapped = slots.map(mapSlot);
    return NextResponse.json({ success: true, data: mapped });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询时段失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token as string | undefined;
    if (!token) {
      return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
    }

    const { verifyAuthToken, addTimeSlot } = await import('@/lib/store');
    if (!verifyAuthToken(token)) {
      return NextResponse.json({ error: '认证已过期，请重新登录' }, { status: 401 });
    }

    const { date, startTime, endTime, teacher } = body;
    if (!date || !startTime || !endTime || !teacher) {
      return NextResponse.json({ error: '缺少必填字段（日期、开始时间、结束时间、讲师）' }, { status: 400 });
    }

    const id = `ts-${Date.now().toString(36)}`;
    const slot = await addTimeSlot({ id, date, start_time: startTime, end_time: endTime, teacher, status: 'available' });
    return NextResponse.json({ success: true, data: mapSlot(slot) });
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { verifyAuthToken, updateTimeSlot } = await import('@/lib/store');
    if (!verifyAuthToken(body.token)) {
      return NextResponse.json({ error: '认证已过期，请重新登录' }, { status: 401 });
    }

    const { id, date, startTime, endTime, teacher, status } = body;
    if (!id) return NextResponse.json({ error: '缺少时段ID' }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (date) updates.date = date;
    if (startTime) updates.start_time = startTime;
    if (endTime) updates.end_time = endTime;
    if (teacher) updates.teacher = teacher;
    if (status) updates.status = status;

    const slot = await updateTimeSlot(id, updates);
    return NextResponse.json({ success: true, data: mapSlot(slot) });
  } catch (err) {
    const message = err instanceof Error ? err.message : '更新失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { verifyAuthToken, deleteTimeSlot } = await import('@/lib/store');
    if (!verifyAuthToken(body.token)) {
      return NextResponse.json({ error: '认证已过期，请重新登录' }, { status: 401 });
    }

    const { id } = body;
    if (!id) return NextResponse.json({ error: '缺少时段ID' }, { status: 400 });

    await deleteTimeSlot(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '删除失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
