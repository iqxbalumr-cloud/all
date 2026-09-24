/**
 * Core Domain Types for NFC School Attendance
 * Following the schema provided in the PRD
 */

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';
export type UserType = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type CardStatus = 'ACTIVE' | 'INACTIVE' | 'LOST';

export interface School {
  id: string;
  name: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface User {
  id: string;
  schoolId: string;
  name: string;
  type: UserType;
  studentId?: string; // For students
  classId?: string;   // For students
  status: UserStatus;
  email?: string;
  parentPhone?: string; // For WhatsApp notifications
}

export interface Class {
  id: string;
  schoolId: string;
  name: string;
  grade: string;
  academicYear: string;
}

export interface NFCCard {
  id: string;
  cardUid: string;
  schoolId: string;
  status: CardStatus;
}

export interface CardAssignment {
  id: string;
  cardId: string;
  userId: string;
  assignedAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Schedule {
  id: string;
  classId: string;
  day: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm
  lateAfter: string; // HH:mm
}

export interface Attendance {
  id: string;
  eventId: string; // Unique ID to prevent duplication
  userId: string;
  cardId: string;
  readerId: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // ISO String
  status: AttendanceStatus;
  source: 'NFC' | 'MANUAL';
  synced: boolean;
}

export interface Reader {
  id: string;
  schoolId: string;
  deviceId: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE';
  lastSeen: string;
}
