import { FrappeApp } from 'frappe-js-sdk';

// Limited fields response
export interface PosProfileLimited {
  pos_profile: string;
  branch: string;
  company: string;
  waiter: string;
  warehouse: string;
  cashier: string;
  print_format: string | null;
  qz_print: number;
  qz_host: string | null;
  printer: string | null;
  print_type: string;
  tableAttention: number;
  paid_limit: number;
  disable_rounded_total: number;
  enable_discount: number;
  multiple_cashier: number;
  owner: string;
  edit_order_type?: number;
}

export interface PosProfileLimitedResponse {
  message: PosProfileLimited;
}

// Full POS Profile response (partial, extend as needed)
export interface PosProfileFull {
  name: string;
  branch: string;
  company: string;
  // ... add more fields as needed
}

export interface PosProfileFullResponse {
  message: PosProfileFull;
}

const frappe = new FrappeApp(import.meta.env.VITE_FRAPPE_BASE_URL);

export async function getPosProfileLimitedFields(): Promise<PosProfileLimited> {
  const call = frappe.call();
  const res = await call.get('ury.ury_pos.api.getPosProfile');
  return res.message;
}

export async function getPosProfileFull(posProfileName: string): Promise<PosProfileFull> {
  const db = frappe.db();
  const doc = await db.getDoc('POS Profile', posProfileName);
  return doc;
} 