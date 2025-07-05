import { Order } from '../store/pos-store';

export const storage = {
  saveOrders: (orders: Order[]) => {
    localStorage.setItem('orders', JSON.stringify(orders));
  },

  getOrders: (): Order[] => {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
  },

  savePosProfileFull: (profile: unknown) => {
    localStorage.setItem('pos_profile', JSON.stringify(profile));
  },

  getPosProfileFull: () => {
    const profile = localStorage.getItem('pos_profile');
    return profile ? JSON.parse(profile) : null;
  },

  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
  },

  getItem: (key: string): string | null => {
    return localStorage.getItem(key);
  },

  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
}; 