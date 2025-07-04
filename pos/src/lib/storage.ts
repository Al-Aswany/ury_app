import type { OrderItem, Order } from '../store/pos-store';

const CART_STORAGE_KEY = 'ury_pos_cart';
const ORDERS_STORAGE_KEY = 'ury_pos_orders';
const POS_PROFILE_FULL_KEY = 'ury_pos_profile_full';

export const storage = {
  saveCartItems: (items: OrderItem[]) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart items:', error);
    }
  },

  getCartItems: (): OrderItem[] => {
    try {
      const items = localStorage.getItem(CART_STORAGE_KEY);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Failed to get cart items:', error);
      return [];
    }
  },

  clearCart: () => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  },

  saveOrders: (orders: Order[]) => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Failed to save orders:', error);
    }
  },

  getOrders: (): Order[] => {
    try {
      const orders = localStorage.getItem(ORDERS_STORAGE_KEY);
      return orders ? JSON.parse(orders) : [];
    } catch (error) {
      console.error('Failed to get orders:', error);
      return [];
    }
  },

  savePosProfileFull: (profile: unknown) => {
    try {
      sessionStorage.setItem(POS_PROFILE_FULL_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save POS Profile:', error);
    }
  },
  getPosProfileFull: () => {
    try {
      const profile = sessionStorage.getItem(POS_PROFILE_FULL_KEY);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Failed to get POS Profile:', error);
      return null;
    }
  },
}; 