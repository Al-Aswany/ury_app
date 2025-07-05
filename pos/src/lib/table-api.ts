import { DOCTYPES } from '../data/doctypes';
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

export async function getRooms(branch: string): Promise<Room[]> {
  const rooms = await db.getDocList(DOCTYPES.URY_ROOM, {
    fields: ['name', 'branch'],
    filters: [['branch', 'like', branch]],
    limit: "*" as unknown as number,
    asDict: true,
  });
  return rooms as Room[];
}

export async function getTables(room: string): Promise<Table[]> {
  const { call } = await import('./frappe-sdk');
  const res = await call.get('ury.ury_pos.api.getTable', { room });
  return res.message as Table[];
} 