import { db } from './frappe-sdk';

export interface Room {
  name: string;
  branch: string;
}

export interface Table {
  name: string;
  occupied: number;
  latest_invoice_time: string | null;
  is_take_away: number;
  restaurant_room: string;
}

const DUMMY_ROOMS: Room[] = [
  { name: 'Main Hall', branch: 'Dummy Branch' },
  { name: 'Outdoor', branch: 'Dummy Branch' },
];

const DUMMY_TABLES: Table[] = [
  { name: 'T1', occupied: 0, latest_invoice_time: null, is_take_away: 0, restaurant_room: 'Main Hall' },
  { name: 'T2', occupied: 1, latest_invoice_time: null, is_take_away: 0, restaurant_room: 'Main Hall' },
  { name: 'T3', occupied: 0, latest_invoice_time: null, is_take_away: 1, restaurant_room: 'Main Hall' },
  { name: 'O1', occupied: 0, latest_invoice_time: null, is_take_away: 0, restaurant_room: 'Outdoor' },
];

export async function getRooms(branch: string): Promise<Room[]> {
  try {
    const rooms = await db.getDocList('URY Room', {
      fields: ['name', 'branch'],
      filters: [['branch', 'like', branch]],
      limit: 100,
      asDict: true,
    });
    if (!rooms || rooms.length === 0) {
      return DUMMY_ROOMS;
    }
    return rooms as Room[];
  } catch {
    return DUMMY_ROOMS;
  }
}

export async function getTables(room: string): Promise<Table[]> {
  try {
    const { call } = await import('./frappe-sdk');
    const res = await call.get('ury.ury_pos.api.getTable', { room });
    if (!res.message || res.message.length === 0) {
      return DUMMY_TABLES.filter(t => t.restaurant_room === room);
    }
    return res.message as Table[];
  } catch {
    return DUMMY_TABLES.filter(t => t.restaurant_room === room);
  }
} 