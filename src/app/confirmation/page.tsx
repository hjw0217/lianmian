'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { CheckCircle2, Download, Home, MapPin, Clock, User, Phone, Calendar, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: string;
  bookingNo: string;
  studentName: string;
  phone: string;
  age: string;
  requirement: string;
  course: string;
  teacher: string;
  classroom: string;
  date: string;
  timeSlot: string;
  status: string;
  createdAt: string;
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/bookings`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const found = res.data.find((b: Booking) => b.id === id);
          setBooking(found || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleDownload = () => {
    if (!booking) return;

    const content = `
══════════════════════════════════
        课程预约确认卡
══════════════════════════════════

预约编号：${booking.bookingNo}
状　　态：${booking.status === 'confirmed' ? '已确认' : booking.status}

【课程信息】
课　　程：${booking.course}
讲　　师：${booking.teacher}
教　　室：${booking.classroom}

【时间信息】
日　　期：${booking.date}
时　　段：${booking.timeSlot}

【学员信息】
姓　　名：${booking.studentName}
电　　话：${booking.phone}
年　　龄：${booking.age}
${booking.requirement ? `课程需求：${booking.requirement}` : ''}

预约时间：${new Date(booking.createdAt).toLocaleString('zh-CN')}

══════════════════════════════════
温馨提示：
1. 请携带有效证件到场
2. 请提前10分钟到场签到
3. 试听课完全免费
4. 如需变更请联系客服
══════════════════════════════════
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `预约确认_${booking.bookingNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-sm text-muted-foreground">加载中...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">未找到预约信息</p>
          <Link href="/" className="text-sm text-primary hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const maskedPhone = booking.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-green/20">
            <CheckCircle2 className="h-8 w-8 text-accent-green" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">预约成功！</h1>
          <p className="mt-1 text-sm text-muted-foreground">您的试听课已成功预约，请按时到场</p>
        </div>

        {/* Confirmation Card */}
        <div className="mx-auto max-w-lg overflow-hidden rounded-2xl bg-card shadow-float">
          {/* Top gradient bar */}
          <div className="h-2 bg-gradient-to-r from-primary via-accent-yellow to-accent-pink" />

          <div className="p-6 space-y-5">
            {/* Course Info */}
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                课程信息
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="text-xs text-muted-foreground">课程</div>
                  <div className="text-sm font-semibold text-foreground">{booking.course}</div>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="text-xs text-muted-foreground">讲师</div>
                  <div className="text-sm font-semibold text-foreground">{booking.teacher}</div>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="text-xs text-muted-foreground">教室</div>
                  <div className="text-sm font-semibold text-foreground">{booking.classroom}</div>
                </div>
              </div>
            </div>

            {/* Time Info */}
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                时间信息
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">日期</div>
                    <div className="text-sm font-semibold text-foreground">{booking.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">时段</div>
                    <div className="text-sm font-semibold text-foreground">{booking.timeSlot}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <User className="h-4 w-4 text-primary" />
                学员信息
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="text-xs text-muted-foreground">姓名</div>
                  <div className="text-sm font-semibold text-foreground">{booking.studentName}</div>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="text-xs text-muted-foreground">电话</div>
                  <div className="text-sm font-semibold text-foreground">{maskedPhone}</div>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="text-xs text-muted-foreground">年龄</div>
                  <div className="text-sm font-semibold text-foreground">{booking.age}</div>
                </div>
              </div>
            </div>

            {/* Booking No & Status */}
            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
              <div>
                <div className="text-xs text-muted-foreground">预约编号</div>
                <div className="text-sm font-semibold text-foreground">#{booking.bookingNo}</div>
              </div>
              <span className="rounded-full bg-accent-green/20 px-3 py-1 text-xs font-semibold text-accent-green">
                已确认
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mx-auto mt-8 flex max-w-lg items-center justify-center gap-4">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:shadow-float"
          >
            <Download className="h-4 w-4" />
            下载确认卡
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-muted px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-surface-container-high"
          >
            <Home className="h-4 w-4" />
            返回首页
          </Link>
        </div>

        {/* Tips */}
        <div className="mx-auto mt-8 max-w-lg">
          <div className="rounded-xl bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground">温馨提示</h3>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 shrink-0 text-primary" />
                请携带有效证件到场
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 shrink-0 text-primary" />
                请提前10分钟到场签到
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-accent-green" />
                试听课完全免费
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0 text-primary" />
                如需变更请联系客服
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
