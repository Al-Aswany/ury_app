import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp as Trending, Star, ThumbsUp, X, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrderPanel from '../components/OrderPanel';
import ProductDialog from '../components/ProductDialog';
import MenuList from '../components/MenuList';
import { usePOSStore } from '../store/pos-store';
import { cn } from '../lib/utils';

export default function POS() {
  const {
    selectedCategory,
    searchQuery,
    setSearchQuery,
    quickFilter,
    setQuickFilter,
    setSelectedItem,
    addToOrder,
    fetchCategories,
    fetchPosProfile,
    loading,
    error,
    posProfile
  } = usePOSStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initializeData = async () => {
      await fetchPosProfile();
      await fetchCategories();
    };
    initializeData();
  }, [fetchPosProfile, fetchCategories]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleItemClick = (item: any) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600">Error loading menu</p>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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

        <MenuList onItemClick={handleItemClick} />
      </div>
      <OrderPanel />
      {isDialogOpen && <ProductDialog onClose={() => setIsDialogOpen(false)} />}
    </div>
  );
}
