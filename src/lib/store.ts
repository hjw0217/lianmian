import fs from 'fs';
import path from 'path';

export interface TimeSlot {
  id: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  course: string;
  teacher: string;
  classroom: string;
  status: 'available' | 'booked' | 'expired';
}

export interface Booking {
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

export interface AdminSession {
  token: string;
  username: string;
  createdAt: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const TIMESLOTS_FILE = path.join(DATA_DIR, 'timeslots.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON<T>(filePath: string, defaultValue: T): T {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
    return defaultValue;
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function writeJSON<T>(filePath: string, data: T) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ==================== TimeSlots ====================

function getDefaultTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const courses = ['钢琴启蒙课', '美术创意课', '编程思维课', '英语口语课'];
  const teachers = ['王老师', '李老师', '张老师', '陈老师'];
  const classrooms = ['A301', 'B205', 'C102', 'D408'];
  const times = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];

  const today = new Date();
  let id = 1;
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    const dayOfWeek = date.getDay();

    // Each day has 3-5 slots for different courses
    const slotCount = dayOfWeek === 0 || dayOfWeek === 6 ? 5 : 4;
    for (let t = 0; t < slotCount; t++) {
      const cIdx = (d + t) % courses.length;
      slots.push({
        id: `ts-${String(id++).padStart(3, '0')}`,
        date: dateStr,
        startTime: times[t].split('-')[0],
        endTime: times[t].split('-')[1],
        course: courses[cIdx],
        teacher: teachers[cIdx],
        classroom: classrooms[cIdx],
        status: t === 0 && d === 1 ? 'booked' : (d === 0 && t > 3 ? 'expired' : 'available'),
      });
    }
  }
  return slots;
}

export function getTimeSlots(): TimeSlot[] {
  return readJSON<TimeSlot[]>(TIMESLOTS_FILE, getDefaultTimeSlots());
}

export function getTimeSlotsByDate(date: string): TimeSlot[] {
  return getTimeSlots().filter(s => s.date === date);
}

export function addTimeSlot(slot: Omit<TimeSlot, 'id'>): TimeSlot {
  const slots = getTimeSlots();
  const id = `ts-${String(slots.length + 1).padStart(3, '0')}`;
  const newSlot: TimeSlot = { ...slot, id };
  slots.push(newSlot);
  writeJSON(TIMESLOTS_FILE, slots);
  return newSlot;
}

export function updateTimeSlot(id: string, updates: Partial<TimeSlot>): TimeSlot | null {
  const slots = getTimeSlots();
  const idx = slots.findIndex(s => s.id === id);
  if (idx === -1) return null;
  slots[idx] = { ...slots[idx], ...updates };
  writeJSON(TIMESLOTS_FILE, slots);
  return slots[idx];
}

export function deleteTimeSlot(id: string): boolean {
  const slots = getTimeSlots();
  const filtered = slots.filter(s => s.id !== id);
  if (filtered.length === slots.length) return false;
  writeJSON(TIMESLOTS_FILE, filtered);
  return true;
}

// ==================== Bookings ====================

function generateBookingNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `TR${dateStr}${seq}`;
}

export function getBookings(): Booking[] {
  return readJSON<Booking[]>(BOOKINGS_FILE, []);
}

export function getBookingById(id: string): Booking | null {
  return getBookings().find(b => b.id === id) ?? null;
}

export function createBooking(data: {
  studentName: string;
  phone: string;
  age: string;
  requirement: string;
  timeSlotId: string;
}): Booking | { error: string } {
  const slots = getTimeSlots();
  const slot = slots.find(s => s.id === data.timeSlotId);
  if (!slot) return { error: '时间段不存在' };
  if (slot.status !== 'available') return { error: '该时间段已被预约' };

  const bookings = getBookings();
  const id = `bk-${String(bookings.length + 1).padStart(3, '0')}`;
  const booking: Booking = {
    id,
    bookingNo: generateBookingNo(),
    studentName: data.studentName,
    phone: data.phone,
    age: data.age,
    requirement: data.requirement,
    course: slot.course,
    teacher: slot.teacher,
    classroom: slot.classroom,
    date: slot.date,
    timeSlot: `${slot.startTime}-${slot.endTime}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  // Mark slot as booked
  const slotIdx = slots.findIndex(s => s.id === data.timeSlotId);
  slots[slotIdx].status = 'booked';
  writeJSON(TIMESLOTS_FILE, slots);

  bookings.push(booking);
  writeJSON(BOOKINGS_FILE, bookings);
  return booking;
}

export function cancelBooking(id: string): Booking | null {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return null;
  bookings[idx].status = 'cancelled';
  writeJSON(BOOKINGS_FILE, bookings);

  // Free up the time slot
  const booking = bookings[idx];
  const slots = getTimeSlots();
  const slotIdx = slots.findIndex(
    s => s.date === booking.date && s.startTime === booking.timeSlot.split('-')[0] && s.course === booking.course
  );
  if (slotIdx !== -1) {
    slots[slotIdx].status = 'available';
    writeJSON(TIMESLOTS_FILE, slots);
  }

  return bookings[idx];
}

// ==================== Admin Auth ====================

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const sessions: Map<string, AdminSession> = new Map();

export function adminLogin(username: string, password: string): string | null {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessions.set(token, { token, username, createdAt: Date.now() });
    return token;
  }
  return null;
}

export function verifyAdmin(token: string): boolean {
  const session = sessions.get(token);
  if (!session) return false;
  // 24h expiry
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function adminLogout(token: string) {
  sessions.delete(token);
}

// ==================== Courses ====================

export interface Course {
  id: string;
  name: string;
  icon: string;
  color: string;
  tag: string;
  description: string;
  ageRange: string;
  teacher: string;
}

export const courses: Course[] = [
  {
    id: 'piano',
    name: '钢琴启蒙课',
    icon: 'music',
    color: 'accent-yellow',
    tag: '热门',
    description: '从零开始，感受黑白键上的音乐世界，培养节奏感与表现力',
    ageRange: '5-12岁',
    teacher: '王老师',
  },
  {
    id: 'art',
    name: '美术创意课',
    icon: 'palette',
    color: 'accent-pink',
    tag: '新课',
    description: '水彩、素描、手工综合创意课，激发孩子的艺术想象力',
    ageRange: '4-10岁',
    teacher: '李老师',
  },
  {
    id: 'coding',
    name: '编程思维课',
    icon: 'code',
    color: 'accent-green',
    tag: '热门',
    description: 'Scratch图形化编程入门，在游戏创作中锻炼逻辑思维',
    ageRange: '7-14岁',
    teacher: '张老师',
  },
  {
    id: 'english',
    name: '英语口语课',
    icon: 'message-circle',
    color: 'accent-yellow',
    tag: '推荐',
    description: '沉浸式情景口语教学，让孩子自信开口说英语',
    ageRange: '6-12岁',
    teacher: '陈老师',
  },
];
