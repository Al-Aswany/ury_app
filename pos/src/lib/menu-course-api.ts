import { DOCTYPES } from '../data/doctypes';
import { db } from './frappe-sdk';

export interface MenuCourse {
  name: string;
}

export interface MenuCourseResponse {
  data: MenuCourse[];
}


export async function getMenuCourses(): Promise<MenuCourse[]> {
  const courses = await db.getDocList(DOCTYPES.URY_MENU_COURSE, {
    fields: ['name'],
    limit: 100,
    asDict: true,
  });
  return courses as MenuCourse[];
} 