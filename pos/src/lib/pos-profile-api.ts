import { DOCTYPES } from '../data/doctypes';
import { call, db } from './frappe-sdk';

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
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  company: string;
  customer: string | null;
  country: string;
  disabled: number;
  warehouse: string;
  campaign: string | null;
  company_address: string | null;
  restaurant: string;
  branch: string;
  currency: string;
  // ... other fields
}

export interface Currency {
  name: string;
  symbol: string;
  fraction: string;
  fraction_units: number;
  smallest_currency_fraction_value: number;
  number_format: string;
}

export interface PosProfileFullResponse {
  message: PosProfileFull;
}


export async function getPosProfileLimitedFields(): Promise<PosProfileLimited> {
  const res = await call.get('ury.ury_pos.api.getPosProfile');
  return res.message;
}

export async function getPosProfileFull(posProfileName: string): Promise<PosProfileFull> {
  const doc = await db.getDoc(DOCTYPES.POS_PROFILE, posProfileName);
  return doc;
} 

export async function getCurrencyInfo(currencyCode: string): Promise<Currency> {
  const doc = await db.getDoc(DOCTYPES.CURRENCY, currencyCode);
  return doc;
}