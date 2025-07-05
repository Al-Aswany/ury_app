import { FrappeApp } from 'frappe-js-sdk';

export interface MenuCourse {
  name: string;
}

export interface MenuCourseResponse {
  data: MenuCourse[];
}

const frappe = new FrappeApp(import.meta.env.VITE_FRAPPE_BASE_URL);

export async function getMenuCourses(): Promise<MenuCourse[]> {
  const db = frappe.db();
  // The API endpoint is /api/resource/URY%20Menu%20Course?fields=["name"]&order_by=&limit=*&as_dict=true
  // frappe-js-sdk's getDocList maps to /api/resource/{DocType}
  const courses = await db.getDocList('URY Menu Course', {
    fields: ['name'],
    limit: 100, // Arbitrary high limit; adjust as needed
    asDict: true,
  });
  return courses as MenuCourse[];
} 