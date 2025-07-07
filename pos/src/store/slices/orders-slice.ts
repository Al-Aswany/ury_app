import { StateCreator } from 'zustand';
import { OrderType } from '../../data/order-types';
import { Customer, OrderItem } from '../pos-store';
import { call } from '../../lib/frappe-sdk';

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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit_start: number;
  limit: number;
}

export interface OrdersState {
  orders: POSInvoice[];
  orderLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface OrdersActions {
  fetchOrders: (status?: string, page?: number) => Promise<void>;
  updateOrderStatus: (orderId: string, status: POSInvoice['status']) => Promise<void>;
}

export type OrdersSlice = OrdersState & OrdersActions;

const ITEMS_PER_PAGE = 10;

export const createOrdersSlice: StateCreator<
  OrdersSlice,
  [],
  [],
  OrdersSlice
> = (set, get) => ({
  // Initial state
  orders: [],
  orderLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: ITEMS_PER_PAGE,
  },

  // Actions
  fetchOrders: async (status = 'Draft', page = 1) => {
    try {
      set({ orderLoading: true, error: null });
      
      const limitStart = (page - 1) * ITEMS_PER_PAGE;
      
      const response = await call.get<{ message: PaginatedResponse<POSInvoice> }>(
        'ury.ury_pos.api.getPosInvoice',
        {
          status,
          limit: ITEMS_PER_PAGE,
          limit_start: limitStart,
        }
      );

      if (!response?.message) {
        throw new Error('Invalid response from server');
      }

      const { data, total } = response.message;
      
      set({ 
        orders: data,
        pagination: {
          currentPage: page,
          totalItems: total,
          itemsPerPage: ITEMS_PER_PAGE,
        },
        orderLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
        orderLoading: false 
      });
    }
  },

  updateOrderStatus: async (orderId: string, status: POSInvoice['status']) => {
    try {
      set({ orderLoading: true, error: null });

      await call.post('ury.ury_pos.api.updatePosInvoiceStatus', {
        invoice: orderId,
        status,
      });

      // Refresh the orders list after status update
      await get().fetchOrders(status, get().pagination.currentPage);
      
      set({ orderLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update order status',
        orderLoading: false 
      });
    }
  },
}); 