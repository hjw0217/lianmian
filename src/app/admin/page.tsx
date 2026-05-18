'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Clock,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  X,
  LogOut,
  AlertCircle,
  Eye,
  Ban,
  Users,
} from 'lucide-react';

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
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

type TabType = 'slots' | 'bookings';

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [verified, setVerified] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('slots');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    course: '',
    teacher: '',
    classroom: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check auth on mount
  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) {
      router.push('/admin-login');
      return;
    }
    setToken(t);
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: t }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setVerified(true);
        } else {
          localStorage.removeItem('admin_token');
          router.push('/admin-login');
        }
      })
      .catch(() => {
        localStorage.removeItem('admin_token');
        router.push('/admin-login');
      });
  }, [router]);

  // Load data
  const loadData = useCallback(async () => {
    const [slotsRes, bookingsRes] = await Promise.all([
      fetch('/api/timeslots').then((r) => r.json()),
      fetch('/api/bookings').then((r) => r.json()),
    ]);
    if (slotsRes.success) setTimeSlots(slotsRes.data);
    if (bookingsRes.success) setBookings(bookingsRes.data);
  }, []);

  useEffect(() => {
    if (verified) loadData();
  }, [verified, loadData]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin-login');
  };

  // TimeSlot CRUD
  const openAddModal = () => {
    setEditingSlot(null);
    setFormData({ date: '', startTime: '', endTime: '', course: '', teacher: '', classroom: '' });
    setShowModal(true);
  };

  const openEditModal = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      course: slot.course,
      teacher: slot.teacher,
      classroom: slot.classroom,
    });
    setShowModal(true);
  };

  const handleSaveSlot = async () => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.course || !formData.teacher || !formData.classroom) {
      showMessage('error', '请填写完整信息');
      return;
    }

    try {
      if (editingSlot) {
        const res = await fetch('/api/timeslots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update', token, id: editingSlot.id, ...formData }),
        });
        const data = await res.json();
        if (data.success) {
          showMessage('success', '时段已更新');
          setShowModal(false);
          loadData();
        } else {
          showMessage('error', data.error);
        }
      } else {
        const res = await fetch('/api/timeslots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add', token, ...formData }),
        });
        const data = await res.json();
        if (data.success) {
          showMessage('success', '时段已添加');
          setShowModal(false);
          loadData();
        } else {
          showMessage('error', data.error);
        }
      }
    } catch {
      showMessage('error', '网络错误');
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('确定要删除此时段吗？')) return;
    try {
      const res = await fetch('/api/timeslots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', token, id }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', '时段已删除');
        loadData();
      } else {
        showMessage('error', data.error);
      }
    } catch {
      showMessage('error', '网络错误');
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('确定要取消此预约吗？')) return;
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', token, id }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', '预约已取消');
        loadData();
      } else {
        showMessage('error', data.error);
      }
    } catch {
      showMessage('error', '网络错误');
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: 'bg-accent-green/20 text-accent-green',
      booked: 'bg-primary/15 text-primary',
      expired: 'bg-muted text-muted-foreground',
      confirmed: 'bg-accent-green/20 text-accent-green',
      pending: 'bg-accent-yellow/20 text-warning',
      cancelled: 'bg-destructive/15 text-destructive',
    };
    const labels: Record<string, string> = {
      available: '可用',
      booked: '已预约',
      expired: '已过期',
      confirmed: '已确认',
      pending: '待确认',
      cancelled: '已取消',
    };
    return (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || 'bg-muted text-muted-foreground'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter((b) => b.date === todayStr && b.status !== 'cancelled').length;
  const availableSlotCount = timeSlots.filter((s) => s.status === 'available').length;
  const totalBookings = bookings.filter((b) => b.status === 'confirmed').length;

  if (!verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">验证中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-card shadow-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">课程预约</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                初
              </div>
              <span className="text-sm text-foreground">小初</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground">预约时段管理</h1>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-4 rounded-xl bg-card p-5 shadow-card">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <CalendarCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{todayBookings}</div>
              <div className="text-xs text-muted-foreground">今日预约</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-card p-5 shadow-card">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-green/20">
              <Clock className="h-5 w-5 text-accent-green" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{availableSlotCount}</div>
              <div className="text-xs text-muted-foreground">可用时段</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-card p-5 shadow-card">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-yellow/20">
              <Users className="h-5 w-5 text-accent-yellow" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalBookings}</div>
              <div className="text-xs text-muted-foreground">累计试听</div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-accent-green/10 text-accent-green'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6 flex gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setActiveTab('slots')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'slots'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            时段管理
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'bookings'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            预约列表
          </button>
        </div>

        {/* Slots Tab */}
        {activeTab === 'slots' && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">时段列表</h2>
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                新增时段
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-border/20 bg-card shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/20 bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">日期</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">时间段</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">课程</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">讲师</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">教室</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">状态</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot, idx) => (
                      <tr
                        key={slot.id}
                        className={`border-b border-border/10 transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? '' : 'bg-muted/20'}`}
                      >
                        <td className="px-4 py-3 text-sm text-foreground">{slot.date}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{slot.startTime}-{slot.endTime}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{slot.course}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{slot.teacher}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{slot.classroom}</td>
                        <td className="px-4 py-3">{statusBadge(slot.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(slot)}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              title="编辑"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              title="删除"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {timeSlots.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          暂无时段数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="mt-4">
            <h2 className="text-base font-semibold text-foreground">预约列表</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-border/20 bg-card shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/20 bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">预约编号</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">学员</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">课程</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">预约时间</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">状态</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, idx) => (
                      <tr
                        key={b.id}
                        className={`border-b border-border/10 transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? '' : 'bg-muted/20'}`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-foreground">#{b.bookingNo}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{b.studentName}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{b.course}</td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {b.date} {b.timeSlot}
                        </td>
                        <td className="px-4 py-3">{statusBadge(b.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              title="查看"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            {b.status !== 'cancelled' && (
                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                title="取消预约"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          暂无预约记录
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {editingSlot ? '编辑时段' : '新增时段'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">日期</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border-none bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">开始时间</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full rounded-lg border-none bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">结束时间</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full rounded-lg border-none bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">课程</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full rounded-lg border-none bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">请选择课程</option>
                  <option value="钢琴启蒙课">钢琴启蒙课</option>
                  <option value="美术创意课">美术创意课</option>
                  <option value="编程思维课">编程思维课</option>
                  <option value="英语口语课">英语口语课</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">讲师</label>
                <select
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full rounded-lg border-none bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">请选择讲师</option>
                  <option value="王老师">王老师</option>
                  <option value="李老师">李老师</option>
                  <option value="张老师">张老师</option>
                  <option value="陈老师">陈老师</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">教室</label>
                <select
                  value={formData.classroom}
                  onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                  className="w-full rounded-lg border-none bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">请选择教室</option>
                  <option value="A301">A301</option>
                  <option value="B205">B205</option>
                  <option value="C102">C102</option>
                  <option value="D408">D408</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-container-high"
              >
                取消
              </button>
              <button
                onClick={handleSaveSlot}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
