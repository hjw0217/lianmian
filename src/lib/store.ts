import fs from 'fs';
import path from 'path';

export interface TimeSlot {
  id: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  teacher: string;
  status: 'available' | 'booked' | 'expired';
}

export interface Booking {
  id: string;
  bookingNo: string;
  studentName: string;
  phone: string;
  requirement: string;
  teacher: string;
  date: string;
  timeSlot: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

// Admin auth uses stateless signed tokens

const isProd = process.env.COZE_PROJECT_ENV === 'PROD';
const DATA_DIR = isProd ? '/tmp/vocal-booking-data' : path.join(process.cwd(), 'data');
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
  const teachers = ['王老师', '李老师', '张老师', '陈老师'];
  const times = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];

  const today = new Date();
  let id = 1;
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    const dayOfWeek = date.getDay();

    const slotCount = dayOfWeek === 0 || dayOfWeek === 6 ? 5 : 4;
    for (let t = 0; t < slotCount; t++) {
      const tIdx = (d + t) % teachers.length;
      slots.push({
        id: `ts-${String(id++).padStart(3, '0')}`,
        date: dateStr,
        startTime: times[t].split('-')[0],
        endTime: times[t].split('-')[1],
        teacher: teachers[tIdx],
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
    requirement: data.requirement,
    teacher: slot.teacher,
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
    s => s.date === booking.date && s.startTime === booking.timeSlot.split('-')[0] && s.teacher === booking.teacher
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
const TOKEN_SECRET = 'vocal_link_admin_2026';

function signToken(username: string): string {
  const payload = `${username}:${Date.now()}`;
  const signature = Buffer.from(`${payload}:${TOKEN_SECRET}`).toString('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token: string): boolean {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const expected = Buffer.from(`${payload}:${TOKEN_SECRET}`).toString('base64url');
    if (signature !== expected) return false;
    const [, ts] = payload.split(':');
    const createdAt = Number(ts);
    if (Date.now() - createdAt > 24 * 60 * 60 * 1000) return false;
    return true;
  } catch {
    return false;
  }
}

export function adminLogin(username: string, password: string): string | null {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return signToken(username);
  }
  return null;
}

export function verifyAdmin(token: string): boolean {
  return verifyToken(token);
}

export function adminLogout(_token: string) {
  // Stateless token, no cleanup needed
}
