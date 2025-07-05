import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../lib/storage';
import { getRestaurantMenu, getAggregatorMenu, MenuItem as APIMenuItem } from '../lib/menu-api';
import { getPosProfileLimitedFields, getPosProfileFull, getCurrencyInfo, PosProfileFull } from '../lib/pos-profile-api';
import { getMenuCourses } from '../lib/menu-course-api';
import { getCustomerGroups, getCustomerTerritories } from '../lib/customer-api';
import { DEFAULT_ORDER_TYPE, OrderType } from '../data/order-types';

// Constants
const MAX_QUANTITY = 99;
const MIN_QUANTITY = 1;

// Custom error class for cart operations
class CartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CartError';
  }
}

// Extend the API MenuItem to include UI-specific properties
export interface MenuItem extends Omit<APIMenuItem, 'rate' | 'item_image'> {
  id: string;
  name: string; // map from item_name
  image: string | null; // map from item_image
  price: number; // map from rate
  quantity?: number;
  selectedVariant?: { id: string; name: string; price: number };
  selectedAddons?: { id: string; name: string; price: number }[];
  uniqueId?: string;
  tax_rate?: number;
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

interface CartTotals {
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
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
  currency: string;
  currencySymbol: string | null;
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
  fetchCurrencySymbol: () => Promise<void>;
  getCartTotals: () => CartTotals;
  itemExistsInCart: (uniqueId: string) => boolean;
  validateQuantity: (quantity: number) => boolean;
  getItemPrice: (item: OrderItem) => number;
}

const generateUniqueId = (item: OrderItem): string => {
  const variantId = item.selectedVariant?.id || 'default';
  const addonIds = item.selectedAddons?.map(addon => addon.id).sort().join('-') || 'no-addons';
  return `${item.id}-${variantId}-${addonIds}`;
};

const calculateItemPrice = (item: OrderItem): number => {
  const basePrice = item.selectedVariant?.price || item.price;
  const addonsTotal = item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
  return basePrice + addonsTotal;
};

export const usePOSStore = create<POSState>((set, get) => ({
  menuItems: [],
  categories: [],
  activeOrders: storage.getCartItems(),
  selectedCategory: '',
  selectedTable: null,
  searchQuery: '',
  selectedCustomer: null,
  selectedOrderType: DEFAULT_ORDER_TYPE as OrderType,
  quickFilter: 'all',
  selectedItem: null,
  cartId: null,
  loading: false,
  menuLoading: false,
  error: null,
  paymentModes: [],
  orders: [],
  posProfile: null,
  customerGroups: [],
  territories: [],
  selectedAggregator: null,
  currency: storage.getItem('currency') || 'INR',
  currencySymbol: storage.getItem('currencySymbol') || null,

  fetchPosProfile: async () => {
    try {
      // Check session storage first
      const cached = sessionStorage.getItem('posProfile');
      if (cached) {
        const profile = JSON.parse(cached);
        set({ 
          posProfile: profile, 
          loading: false,
          currency: profile.currency || 'INR'
        });
        // Fetch currency symbol if not in storage
        if (!storage.getItem('currencySymbol')) {
          get().fetchCurrencySymbol();
        }
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
      set({ 
        posProfile: fullProfile, 
        loading: false,
        currency: fullProfile.currency
      });
      storage.setItem('currency', fullProfile.currency);

      // Fetch currency symbol if not in storage
      if (!storage.getItem('currencySymbol')) {
        get().fetchCurrencySymbol();
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchCurrencySymbol: async () => {
    try {
      const currency = get().currency;
      const response = await getCurrencyInfo(currency);
      const { symbol } = response;
      
      set({ currencySymbol: symbol });
      storage.setItem('currencySymbol', symbol);
    } catch (error) {
      console.error('Error fetching currency symbol:', error);
      // Fallback to currency code if symbol fetch fails
      set({ currencySymbol: get().currency });
      storage.setItem('currencySymbol', get().currency);
    }
  },

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
        image: item.item_imgae || null,
        price: typeof item.rate === 'string' ? parseFloat(item.rate) : item.rate || 0,
        category: item.course
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
        image: item.item_imgae || null,
        price: typeof item.rate === 'string' ? parseFloat(item.rate) : item.rate || 0,
        category: item.course
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

  addToOrder: async (item: OrderItem) => {
    try {
      // Validate quantity
      if (!get().validateQuantity(item.quantity)) {
        throw new CartError(`Quantity must be between ${MIN_QUANTITY} and ${MAX_QUANTITY}`);
      }

      const uniqueId = generateUniqueId(item);
      const existingItemIndex = get().activeOrders.findIndex(orderItem => orderItem.uniqueId === uniqueId);

      if (existingItemIndex !== -1) {
        // If item exists, validate and update its quantity
        const existingItem = get().activeOrders[existingItemIndex];
        const newQuantity = existingItem.quantity + item.quantity;

        if (!get().validateQuantity(newQuantity)) {
          throw new CartError(`Cannot add item. Total quantity would exceed ${MAX_QUANTITY}`);
        }

        const newOrders = [...get().activeOrders];
        newOrders[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity
        };
        
        set({ activeOrders: newOrders });
        storage.saveCartItems(newOrders);
      } else {
        // If item doesn't exist, add it as new
        const newOrders = [...get().activeOrders, { ...item, uniqueId }];
        set({ activeOrders: newOrders });
        storage.saveCartItems(newOrders);
      }
    } catch (error) {
      if (error instanceof CartError) {
        set({ error: error.message });
      } else {
        set({ error: 'Failed to add item to cart' });
      }
      throw error;
    }
  },

  removeFromOrder: async (uniqueId: string) => {
    try {
      const newOrders = get().activeOrders.filter(item => item.uniqueId !== uniqueId);
      set({ activeOrders: newOrders });
      storage.saveCartItems(newOrders);
    } catch (error) {
      set({ error: 'Failed to remove item from cart' });
      throw error;
    }
  },

  updateQuantity: async (uniqueId: string, quantity: number) => {
    try {
      // If quantity is 0 or less, remove the item
      if (quantity <= 0) {
        await get().removeFromOrder(uniqueId);
        return;
      }

      // Validate new quantity
      if (!get().validateQuantity(quantity)) {
        throw new CartError(`Quantity must be between ${MIN_QUANTITY} and ${MAX_QUANTITY}`);
      }

      const newOrders = get().activeOrders.map(item => 
        item.uniqueId === uniqueId ? { ...item, quantity } : item
      );

      set({ activeOrders: newOrders });
      storage.saveCartItems(newOrders);
    } catch (error) {
      if (error instanceof CartError) {
        set({ error: error.message });
      } else {
        set({ error: 'Failed to update quantity' });
      }
      throw error;
    }
  },

  clearOrder: async () => {
    try {
      set({ activeOrders: [] });
      storage.clearCart();
    } catch (error) {
      set({ error: 'Failed to clear cart' });
      throw error;
    }
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
  },

  getCartTotals: (): CartTotals => {
    const items = get().activeOrders;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = calculateItemPrice(item);
      return sum + (itemPrice * item.quantity);
    }, 0);

    const tax = items.reduce((sum, item) => {
      const itemPrice = calculateItemPrice(item);
      const taxRate = item.tax_rate || 0;
      return sum + (itemPrice * item.quantity * (taxRate / 100));
    }, 0);

    return {
      subtotal,
      tax,
      total: subtotal + tax,
      itemCount
    };
  },

  itemExistsInCart: (uniqueId: string): boolean => {
    return get().activeOrders.some(item => item.uniqueId === uniqueId);
  },

  validateQuantity: (quantity: number): boolean => {
    return quantity >= MIN_QUANTITY && quantity <= MAX_QUANTITY;
  },

  getItemPrice: (item: OrderItem): number => {
    return calculateItemPrice(item);
  }
})); 