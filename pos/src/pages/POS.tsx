import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp as Trending, Star, ThumbsUp, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrderPanel from '../components/OrderPanel';
import ProductDialog from '../components/ProductDialog';
import { usePOSStore } from '../store/pos-store';
import { cn, formatCurrency } from '../lib/utils';

export default function POS() {
  const {
    menuItems,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    quickFilter,
    setQuickFilter,
    setSelectedItem,
    addToOrder,
    fetchMenuItems,
    fetchCategories
  } = usePOSStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, [fetchMenuItems, fetchCategories]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesQuickFilter = quickFilter === 'all' || 
      (quickFilter === 'trending' && item.trending) ||
      (quickFilter === 'popular' && item.popular) ||
      (quickFilter === 'recommended' && item.recommended);
    
    return matchesCategory && matchesSearch && matchesQuickFilter;
  });

  const handleItemClick = (item: typeof menuItems[0]) => {
    clickCountRef.current += 1;
    
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
        // Single click - add to cart
        addToOrder({ ...item, quantity: 1 });
      } else if (clickCountRef.current === 2) {
        // Double click - open dialog
        setSelectedItem(item);
        setIsDialogOpen(true);
      }
      clickCountRef.current = 0;
    }, 250); // 250ms threshold for double click
  };

  const QuickFilterButton = ({ filter, icon: Icon, label }: { 
    filter: 'all' | 'trending' | 'popular' | 'recommended';
    icon: React.ElementType;
    label: string;
  }) => (
    <button
      onClick={() => setQuickFilter(filter)}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
        quickFilter === filter
          ? 'bg-blue-100 text-blue-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden pr-96">
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="max-w-screen-xl mx-auto space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => {
                  setShowSearch(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className={cn(
                  'h-9 flex items-center gap-2 px-3 rounded-full text-sm font-medium transition-colors',
                  showSearch ? 'hidden' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <Search className="w-4 h-4" />
              </button>
              
              {showSearch && (
                <div className="flex-1 flex items-center gap-2 min-w-[200px] h-9">
                  <div className="relative flex-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search menu items..."
                      className="w-full h-full border border-gray-200 rounded-full text-sm focus:outline-none px-[12px] py-[8px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        onClick={() => {
                        setShowSearch(false);
                        setSearchQuery('');
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              <QuickFilterButton filter="all" icon={Star} label="All" />
              <QuickFilterButton filter="trending" icon={Trending} label="Trending" />
              <QuickFilterButton filter="popular" icon={ThumbsUp} label="Popular" />
              <QuickFilterButton filter="recommended" icon={Star} label="Recommended" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-screen-xl mx-auto p-4 pb-40">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-24 object-cover filter saturate-75 brightness-95"
                    style={{ filter: 'saturate(0.7) brightness(0.95)' }}
                  />
                  <div className="p-3">
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <OrderPanel />
      {isDialogOpen && <ProductDialog onClose={() => setIsDialogOpen(false)} />}
    </div>
  );
}
