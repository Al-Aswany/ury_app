import { StateCreator } from 'zustand';
import { OrderType } from '../../data/order-types';
import { Customer, OrderItem } from '../pos-store';
import { call } from '../../lib/frappe-sdk';
import { getPOSInvoices } from '../../lib/invoice-api';

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

export interface OrdersState {
  orders: POSInvoice[];
  orderLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
    itemsPerPage: number;
  };
  selectedStatus: 'Draft' | 'Paid' | 'Cancelled';
}

export interface OrdersActions {
  fetchOrders: (page?: number) => Promise<void>;
  updateOrderStatus: (orderId: string, status: POSInvoice['status']) => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  setSelectedStatus: (status: POSInvoice['status']) => Promise<void>;
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
    hasNextPage: false,
    itemsPerPage: ITEMS_PER_PAGE,
  },
  selectedStatus: 'Draft',

  // Actions
  fetchOrders: async (page = 1) => {
    try {
      set({ orderLoading: true, error: null });
      
      const limitStart = (page - 1) * ITEMS_PER_PAGE;
      const status = get().selectedStatus;
      
      const { invoices, hasMore } = await getPOSInvoices({
        status,
        limit: ITEMS_PER_PAGE,
        limit_start: limitStart,
      });

      console.log("HAS MORE ", hasMore)
      set({ 
        orders: invoices,
        pagination: {
          currentPage: page,
          hasNextPage: hasMore,
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

  goToNextPage: async () => {
    const { pagination, orderLoading } = get();
    if (!orderLoading && pagination.hasNextPage) {
      await get().fetchOrders(pagination.currentPage + 1);
    }
  },

  goToPreviousPage: async () => {
    const { pagination, orderLoading } = get();
    if (!orderLoading && pagination.currentPage > 1) {
      await get().fetchOrders(pagination.currentPage - 1);
    }
  },

  setSelectedStatus: async (status) => {
    set({ selectedStatus: status });
    await get().fetchOrders(1); // Reset to first page when status changes
  },

  updateOrderStatus: async (orderId: string, status: POSInvoice['status']) => {
    try {
      set({ orderLoading: true, error: null });

      await call.post('ury.ury_pos.api.updatePosInvoiceStatus', {
        invoice: orderId,
        status,
      });

      // Refresh the orders list after status update
      await get().fetchOrders(get().pagination.currentPage);
      
      set({ orderLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update order status',
        orderLoading: false 
      });
    }
  },
}); 