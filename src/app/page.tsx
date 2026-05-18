'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/navbar';
import {
  GraduationCap,
  Music,
  MessageCircle,
  Calendar,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle,
  Mic,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  course: string;
  teacher: string;
  classroom: string;
  status: 'available' | 'booked' | 'expired';
}

interface CourseInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  tag: string;
  description: string;
  teacher: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  music: Music,
  'message-circle': MessageCircle,
  mic: Mic,
};

const courseIconBgs: Record<string, string> = {
  'vocal-basics': 'bg-accent-yellow/20',
  'folk-singing': 'bg-accent-pink/20',
  'bel-canto': 'bg-accent-green/20',
  'pop-singing': 'bg-primary/20',
};

const courseNames = ['声乐基础课', '民歌演唱课', '美声唱法课', '通俗流行课'];

export default function HomePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [requirement, setRequirement] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/courses')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCourses(res.data);
      })
      .catch(() => {});
    fetch('/api/timeslots')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setTimeSlots(res.data);
      })
      .catch(() => {});
  }, []);

  // Get next 7 days
  const dates = useCallback(() => {
    const result: { date: string; label: string; weekday: string }[] = [];
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      result.push({
        date: dateStr,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        weekday: i === 0 ? '今天' : weekdays[d.getDay()],
      });
    }
    return result;
  }, [])();

  // Filter slots by selected date and selected course
  const filteredSlots = timeSlots.filter((s) => {
    const matchDate = selectedDate ? s.date === selectedDate : true;
    const matchCourse = selectedCourse
      ? courseNames.find((c) => c === s.course) &&
        s.course === courseNames.find((cn) => cn === selectedCourse)
      : true;
    return matchDate && matchCourse;
  });

  // Get selected course info
  const selectedCourseInfo = courses.find((c) => c.id === selectedCourse);
  const selectedSlotInfo = timeSlots.find((s) => s.id === selectedSlot);

  const handleSubmit = async () => {
    setError('');
    if (!studentName.trim()) { setError('请输入学员姓名'); return; }
    if (!phone.trim()) { setError('请输入联系电话'); return; }
    if (!selectedCourse) { setError('请选择试听课程'); return; }
    if (!selectedSlot) { setError('请选择预约时段'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          studentName,
          phone,
          requirement,
          timeSlotId: selectedSlot,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/confirmation?id=${data.data.id}`);
      } else {
        setError(data.error || '预约失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">预约连麦课程</h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          选择感兴趣的课程和合适的时段，填写信息即可完成连麦预约
        </p>

        <div className="mt-6 lg:flex lg:gap-8">
          {/* Left Form */}
          <div className="flex-1 space-y-6 sm:space-y-8">
            {/* Student Info */}
            <section className="rounded-xl bg-card p-4 shadow-card sm:p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
                <GraduationCap className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                学员信息
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">学员姓名</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="请输入学员姓名"
                    className="w-full rounded-lg border-none bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">联系电话</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入联系电话"
                    className="w-full rounded-lg border-none bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">课程需求</label>
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="可选，如希望重点学习的内容、擅长曲目等"
                    className="w-full rounded-lg border-none bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </section>

            {/* Course Selection */}
            <section className="rounded-xl bg-card p-4 shadow-card sm:p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
                <Mic className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                选择课程
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                {courses.map((c) => {
                  const Icon = iconMap[c.icon] || Music;
                  const isSelected = selectedCourse === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCourse(c.id);
                        setSelectedSlot('');
                      }}
                      className={`flex items-center gap-2.5 rounded-lg p-3 text-left transition-all sm:gap-3 sm:p-4 ${
                        isSelected
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'bg-muted hover:bg-surface-container-high'
                      }`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${courseIconBgs[c.id] || 'bg-primary/20'}`}>
                        <Icon className="h-4 w-4 text-foreground sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-foreground sm:text-sm">{c.name}</div>
                        <div className="text-[10px] text-muted-foreground sm:text-xs">{c.teacher}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Time Selection */}
            <section className="rounded-xl bg-card p-4 shadow-card sm:p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
                <Clock className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                选择时间
              </h2>

              {/* Date selector */}
              <div className="mt-4 flex gap-1.5 overflow-x-auto pb-2 sm:gap-2">
                {dates.map((d) => {
                  const isSelected = selectedDate === d.date;
                  return (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => {
                        setSelectedDate(d.date);
                        setSelectedSlot('');
                      }}
                      className={`flex shrink-0 flex-col items-center rounded-lg px-3 py-2 text-center transition-all sm:px-4 sm:py-2.5 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="text-[10px] font-medium sm:text-xs">{d.weekday}</span>
                      <span className="text-xs font-semibold sm:text-sm">{d.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time slot grid */}
              {selectedDate && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
                  {filteredSlots.length === 0 && (
                    <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                      该日期暂无可用时段
                    </div>
                  )}
                  {filteredSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.id;
                    const isAvailable = slot.status === 'available';
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => isAvailable && setSelectedSlot(slot.id)}
                        className={`flex flex-col rounded-lg p-3 text-left transition-all ${
                          !isAvailable
                            ? 'cursor-not-allowed bg-surface-container-high/60 text-muted-foreground/50'
                            : isSelected
                              ? 'ring-2 ring-primary bg-primary/5'
                              : 'bg-muted hover:bg-surface-container-high'
                        }`}
                      >
                        <span className={`text-sm font-semibold ${isAvailable ? 'text-foreground' : ''}`}>
                          {slot.startTime}-{slot.endTime}
                        </span>
                        <span className="mt-0.5 text-xs text-muted-foreground">
                          {slot.course} · {slot.teacher}
                        </span>
                        {!isAvailable && (
                          <span className="mt-1 text-xs text-muted-foreground/60">
                            {slot.status === 'booked' ? '已约满' : '已过期'}
                          </span>
                        )}
                        {isAvailable && !isSelected && (
                          <span className="mt-1 text-xs text-accent-green">可预约</span>
                        )}
                        {isSelected && (
                          <span className="mt-1 flex items-center gap-1 text-xs text-primary">
                            <CheckCircle2 className="h-3 w-3" /> 已选择
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {!selectedDate && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5 text-xs text-muted-foreground sm:mt-4 sm:px-4 sm:py-3 sm:text-sm">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  请先选择日期，查看可用时段
                </div>
              )}
            </section>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:shadow-float disabled:opacity-50"
            >
              {submitting ? '提交中...' : '确认预约'}
            </button>
          </div>

          {/* Right Sidebar - stacked below on mobile, side on lg */}
          <div className="mt-6 space-y-3 lg:mt-0 lg:w-80 lg:shrink-0 lg:space-y-4">
            {/* Selected Course Summary */}
            <div className="rounded-xl bg-card p-4 shadow-card sm:p-5">
              <h3 className="text-sm font-semibold text-foreground">已选课程</h3>
              {selectedCourseInfo ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = iconMap[selectedCourseInfo.icon] || Music;
                      return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                    <span className="text-sm font-semibold text-foreground">{selectedCourseInfo.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    讲师：{selectedCourseInfo.teacher}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">尚未选择课程</p>
              )}
            </div>

            {/* Selected Time Summary */}
            <div className="rounded-xl bg-card p-4 shadow-card sm:p-5">
              <h3 className="text-sm font-semibold text-foreground">已选时间</h3>
              {selectedSlotInfo ? (
                <div className="mt-3 space-y-2">
                  <div className="text-sm text-foreground">
                    {selectedSlotInfo.date} {selectedSlotInfo.startTime}-{selectedSlotInfo.endTime}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    连麦房间：{selectedSlotInfo.classroom}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">尚未选择时间</p>
              )}
            </div>

            {/* Tips */}
            <div className="rounded-xl bg-card p-4 shadow-card sm:p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Info className="h-4 w-4 text-primary" />
                温馨提示
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-accent-green" />
                  试听连麦课完全免费，无任何附加费用
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-accent-green" />
                  请提前5分钟进入连麦房间测试设备
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-accent-green" />
                  预约成功后可下载确认凭证
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-accent-green" />
                  如需变更请提前1天联系客服
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
