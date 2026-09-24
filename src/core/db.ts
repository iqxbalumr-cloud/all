import Dexie, { type Table } from 'dexie';
import type { Attendance, User, NFCCard, Schedule, Class } from './types';

export class AppDatabase extends Dexie {
  attendanceQueue!: Table<Attendance>;
  users!: Table<User>;
  cards!: Table<NFCCard>;
  schedules!: Table<Schedule>;
  classes!: Table<Class>;

  constructor() {
    super('NfcAttendanceDB');
    this.version(1).stores({
      attendanceQueue: '++id, eventId, userId, cardId, date, synced',
      users: 'id, schoolId, type, classId',
      cards: 'id, cardUid, schoolId',
      schedules: 'id, classId, day',
      classes: 'id, schoolId'
    });
  }
}

export const db = new AppDatabase();
