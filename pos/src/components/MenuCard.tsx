import { FC } from 'react';
import { usePOSStore } from '../store/pos-store';

interface MenuCardProps {
  id: string;
  name: string;
  price: number;
  item_image: string | null;
  onAddToCart: () => void;
}

const MenuCard: FC<MenuCardProps> = ({ id, name, price, item_image, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {item_image ? (
        <img 
          src={item_image} 
          alt={name}
          className="w-full h-40 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const placeholder = document.createElement('div');
              placeholder.className = 'w-full h-40 bg-gray-200 flex items-center justify-center text-2xl text-gray-400 font-medium';
              placeholder.textContent = name.slice(0, 2).toUpperCase();
              parent.insertBefore(placeholder, target);
            }
          }}
        />
      ) : (
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-2xl text-gray-400 font-medium">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 truncate" title={name}>
          {name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-semibold">₹ {price.toFixed(2)}</span>
          <button
            onClick={onAddToCart}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard; 