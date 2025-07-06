export interface POSInvoiceItem {
  name: string;
  item_code: string;
  item_name: string;
  description: string;
  item_group: string;
  image: string;
  qty: number;
  comment: string;
  rate: number;
  amount: number;
  discount_percentage: number;
  discount_amount: number;
}

export interface POSInvoice {
  name: string;
  title: string;
  customer: string;
  customer_name: string;
  mobile_number: string;
  customer_group: string;
  territory: string;
  posting_date: string;
  posting_time: string;
  order_type: string;
  restaurant_table: string;
  custom_restaurant_room: string;
  status: string;
  total: number;
  grand_total: number;
  items: POSInvoiceItem[];
}

export interface TableOrder {
  message: POSInvoice | null;
}

/**
 * Fetches the current active order/invoice for a table if any exists
 * @param table_no The table number to fetch the order for
 * @returns The order details and customer information if an active order exists
 */
export async function getTableOrder(table_no: string): Promise<TableOrder> {
  const { call } = await import('./frappe-sdk');
  try {
    const res = await call.get('ury.ury.doctype.ury_order.ury_order.get_order_invoice', { 
      table: table_no
    });
    return res as TableOrder;
  } catch (error) {
    console.error('Error fetching table order:', error);
    return { message: null };
  }
} 