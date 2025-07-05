import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../lib/storage';
import { getRestaurantMenu, getAggregatorMenu, MenuItem as APIMenuItem } from '../lib/menu-api';
import { getPosProfileLimitedFields, getPosProfileFull, PosProfileFull } from '../lib/pos-profile-api';
import { getMenuCourses, MenuCourse } from '../lib/menu-course-api';
import { getCustomerGroups, getCustomerTerritories } from '../lib/customer-api';
import { OrderType } from '../data/order-types';

// Extend the API MenuItem to include UI-specific properties
export interface MenuItem extends Omit<APIMenuItem, 'rate' | 'item_image'> {
  id: string;
  name: string; // map from item_name
  image: string | undefined; // map from item_image
  price: number; // map from rate
  quantity?: number;
  selectedVariant?: { id: string; name: string; price: number };
  selectedAddons?: { id: string; name: string; price: number }[];
  uniqueId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
  selectedVariant?: { id: string; name: string; price: number };
  selectedAddons?: { id: string; name: string; price: number }[];
  uniqueId?: string;
}

export interface PaymentMode {
  id: string;
  name: string;
  enabled: boolean;
}

export interface Order {
  id: string;
  cartId: string;
  customerId?: string;
  paymentModeId: string;
  paymentMode: string;
  orderType: OrderType;
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface POSState {
  menuItems: MenuItem[];
  categories: string[];
  activeOrders: OrderItem[];
  selectedCategory: string;
  searchQuery: string;
  selectedCustomer: Customer | null;
  selectedTable: string | null;
  quickFilter: 'all' | 'trending' | 'popular' | 'recommended';
  selectedItem: MenuItem | null;
  cartId: string | null;
  loading: boolean;
  menuLoading: boolean; // Separate loading state for menu
  error: string | null;
  paymentModes: PaymentMode[];
  orders: Order[];
  selectedOrderType: OrderType;
  selectedAggregator: string | null;
  fetchMenuItems: () => Promise<void>;
  fetchAggregatorMenu: (aggregator: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchPaymentModes: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  addToOrder: (item: OrderItem) => Promise<void>;
  removeFromOrder: (uniqueId: string) => Promise<void>;
  updateQuantity: (uniqueId: string, quantity: number) => Promise<void>;
  clearOrder: () => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setSelectedTable: (table: string | null) => void;
  setSelectedOrderType: (type: OrderType) => void;
  setQuickFilter: (filter: 'all' | 'trending' | 'popular' | 'recommended') => void;
  setSelectedItem: (item: MenuItem | null) => void;
  initializeCart: () => Promise<void>;
  processPayment: (paymentModeId: string, amount: number) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  posProfile: PosProfileFull | null;
  fetchPosProfile: () => Promise<void>;
  customerGroups: string[];
  territories: string[];
  fetchCustomerGroups: () => Promise<void>;
  fetchTerritories: () => Promise<void>;
}

const generateUniqueId = (item: OrderItem): string => {
  const variantId = item.selectedVariant?.id || 'default';
  const addonIds = item.selectedAddons?.map(addon => addon.id).sort().join('-') || 'no-addons';
  return `${item.id}-${variantId}-${addonIds}`;
};

export const usePOSStore = create<POSState>((set, get) => ({
  menuItems: [],
  categories: [],
  activeOrders: storage.getCartItems(),
  selectedCategory: '',
  selectedTable: null,
  searchQuery: '',
  selectedCustomer: null,
  selectedOrderType: 'dine-in' as OrderType,
  quickFilter: 'all',
  selectedItem: null,
  cartId: null,
  loading: false,
  menuLoading: false, // Initialize menuLoading state
  error: null,
  paymentModes: [],
  orders: [],
  posProfile: null,
  customerGroups: [],
  territories: [],
  selectedAggregator: null,

  fetchMenuItems: async () => {
    const { posProfile, selectedOrderType } = get();
    if (!posProfile) {
      set({ error: 'POS Profile not found' });
      return;
    }

    try {
      set({ menuLoading: true, error: null }); // Use menuLoading instead of loading
      const items = await getRestaurantMenu(posProfile.name, selectedOrderType);
      
      // Transform API items to match the UI format
      const menuItems: MenuItem[] = items.map(item => ({
        ...item,
        id: item.item,
        name: item.item_name,
        image: item.item_imgae || undefined,
        price: typeof item.rate === 'string' ? parseFloat(item.rate) : item.rate || 0,
        category: item.category
      }));

      set({ menuItems, menuLoading: false }); // Use menuLoading instead of loading
    } catch (error) {
      set({ error: (error as Error).message, menuLoading: false }); // Use menuLoading instead of loading
    }
  },

  fetchAggregatorMenu: async (aggregator: string) => {
    try {
      set({ menuLoading: true, error: null }); // Use menuLoading instead of loading
      const items = await getAggregatorMenu(aggregator);
      
      // Transform API items to match the UI format
      const menuItems: MenuItem[] = items.map(item => ({
        ...item,
        id: item.item,
        name: item.item_name,
        image: item.item_imgae || undefined,
        price: typeof item.rate === 'string' ? parseFloat(item.rate) : item.rate || 0,
        category: item.category
      }));

      set({ menuItems, menuLoading: false }); // Use menuLoading instead of loading
    } catch (error) {
      set({ error: (error as Error).message, menuLoading: false }); // Use menuLoading instead of loading
    }
  },

  fetchCategories: async () => {
    try {
      set({ loading: true, error: null });
      const courses = await getMenuCourses();
      const categoryNames = courses.map((course) => course.name);
      set({ categories: categoryNames, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchPaymentModes: async () => {
    // TODO: Implement payment modes fetch from API
  },

  fetchOrders: async () => {
    try {
      const orders = storage.getOrders();
      set({ orders });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  initializeCart: async () => {
    set({ cartId: uuidv4() });
  },

  addToOrder: async (item) => {
    const uniqueId = generateUniqueId(item);
    const newOrders = [...get().activeOrders, { ...item, uniqueId }];
    set({ activeOrders: newOrders });
    storage.saveCartItems(newOrders);
  },

  removeFromOrder: async (uniqueId) => {
    const newOrders = get().activeOrders.filter(item => item.uniqueId !== uniqueId);
    set({ activeOrders: newOrders });
    storage.saveCartItems(newOrders);
  },

  updateQuantity: async (uniqueId, quantity) => {
    const newOrders = get().activeOrders.map(item => 
      item.uniqueId === uniqueId ? { ...item, quantity } : item
    );
    set({ activeOrders: newOrders });
    storage.saveCartItems(newOrders);
  },

  clearOrder: async () => {
    set({ activeOrders: [] });
    storage.clearCart();
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setSelectedTable: (table) => set({ selectedTable: table }),
  setSelectedOrderType: (type) => set({ selectedOrderType: type }),
  setQuickFilter: (filter) => set({ quickFilter: filter }),
  setSelectedItem: (item) => set({ selectedItem: item }),

  processPayment: async (paymentModeId, amount) => {
    try {
      const { activeOrders, cartId, selectedCustomer, selectedOrderType, paymentModes } = get();
      const paymentMode = paymentModes.find(pm => pm.id === paymentModeId);
      
      if (!paymentMode) throw new Error('Invalid payment mode');

      const order: Order = {
        id: uuidv4(),
        cartId: cartId!,
        customerId: selectedCustomer?.id,
        paymentModeId,
        paymentMode: paymentMode.name,
        orderType: selectedOrderType,
        status: 'paid',
        totalAmount: amount,
        paidAmount: amount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newOrders = [...get().orders, order];
      set({ orders: newOrders });
      storage.saveOrders(newOrders);
      
      // Clear cart after successful payment
      await get().clearOrder();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const newOrders = get().orders.map(order => 
        order.id === orderId 
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      );
      set({ orders: newOrders });
      storage.saveOrders(newOrders);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchPosProfile: async () => {
    try {
      // Check session storage first
      const cached = sessionStorage.getItem('posProfile');
      if (cached) {
        const profile = JSON.parse(cached);
        set({ posProfile: profile, loading: false });
        return;
      }

      set({ loading: true, error: null });
      const limitedProfile = await getPosProfileLimitedFields();
      if (!limitedProfile.pos_profile) {
        throw new Error('No POS profile found');
      }
      const fullProfile = await getPosProfileFull(limitedProfile.pos_profile);
      
      // Cache the profile in session storage
      sessionStorage.setItem('posProfile', JSON.stringify(fullProfile));
      set({ posProfile: fullProfile, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchCustomerGroups: async () => {
    const cached = sessionStorage.getItem('customerGroups');
    if (cached) {
      set({ customerGroups: JSON.parse(cached) });
      return;
    }
    const groups = await getCustomerGroups();
    const names = groups.map((g: any) => g.name);
    set({ customerGroups: names });
    sessionStorage.setItem('customerGroups', JSON.stringify(names));
  },

  fetchTerritories: async () => {
    const cached = sessionStorage.getItem('territories');
    if (cached) {
      set({ territories: JSON.parse(cached) });
      return;
    }
    const terrs = await getCustomerTerritories();
    const names = terrs.map((t: any) => t.name);
    set({ territories: names });
    sessionStorage.setItem('territories', JSON.stringify(names));
  }
})); 