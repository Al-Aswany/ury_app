import { useEffect, useMemo, useRef } from 'react';
import { usePOSStore } from '../store/pos-store';
import MenuCard from './MenuCard';
import { Loader } from 'lucide-react';

interface MenuListProps {
  onItemClick: (item: any) => void;
}

const MenuList: React.FC<MenuListProps> = ({ onItemClick }) => {
  const {
    menuItems,
    loading,
    error,
    selectedCategory,
    searchQuery,
    quickFilter,
    fetchMenuItems,
  } = usePOSStore();

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = !selectedCategory || item.course === selectedCategory;
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = quickFilter === 'all' || 
        (quickFilter === 'trending' && item.trending) ||
        (quickFilter === 'popular' && item.popular) ||
        (quickFilter === 'recommended' && item.recommended);
      
      return matchesCategory && matchesSearch && matchesFilter;
    });
  }, [menuItems, selectedCategory, searchQuery, quickFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600 text-center">
          <p className="text-lg font-medium">Error loading menu items</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 text-center">
          <p className="text-lg font-medium">No items found</p>
          <p className="text-sm mt-2">Try adjusting your filters or search term</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-4 pb-40">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              item_image={item.image}
              course={item.course}
              onClick={() => onItemClick(item)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuList; 