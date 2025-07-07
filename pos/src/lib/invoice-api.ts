import { call } from './frappe-sdk';
import { OrderType } from '../data/order-types';

export interface POSInvoice {
  name: string;
  invoice_printed: number;
  grand_total: number;
  restaurant_table: string | null;
  cashier: string;
  waiter: string;
  net_total: number;
  posting_time: string;
  total_taxes_and_charges: number;
  customer: string;
  status: 'Draft' | 'Paid' | 'Cancelled';
  mobile_number: string;
  posting_date: string;
  rounded_total: number;
  order_type: OrderType;
}

interface GetPOSInvoicesResponse {
  message: {
    data: POSInvoice[];
    next: boolean;
  };
}

interface GetPOSInvoicesParams {
  status: POSInvoice['status'];
  limit?: number;
  limit_start?: number;
}

export async function getPOSInvoices({ 
  status, 
  limit, 
  limit_start
}: GetPOSInvoicesParams) {
  try {
    const response = await call.get<GetPOSInvoicesResponse>(
      'ury.ury_pos.api.getPosInvoice',
      {
        status,
        limit,
        limit_start
      }
    );

    return {
      invoices: response.message.data,
      hasMore: response.message.next
    };
  } catch (error) {
    console.error('Error fetching POS invoices:', error);
    throw new Error('Failed to fetch POS invoices');
  }
}

export async function updateInvoiceStatus(
  invoice: string,
  status: POSInvoice['status']
) {
  try {
    await call.post('ury.ury_pos.api.updatePosInvoiceStatus', {
      invoice,
      status,
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw new Error('Failed to update invoice status');
  }
} 