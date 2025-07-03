import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { MenuItem, OrderItem, usePOSStore } from '../store/pos-store';
import { cn, formatCurrency } from '../lib/utils';

interface ProductDialogProps {
  onClose: () => void;
  editMode?: boolean;
  initialVariant?: { id: string; name: string; price: number };
  initialAddons?: Array<{ id: string; name: string; price: number }>;
  initialQuantity?: number;
  itemToReplace?: OrderItem;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  onClose,
  editMode = false,
  initialVariant,
  initialAddons = [],
  initialQuantity = 1,
  itemToReplace
}) => {
  const { selectedItem, addToOrder, removeFromOrder, setSelectedItem } = usePOSStore();
  const [selectedVariant, setSelectedVariant] = useState(initialVariant || selectedItem?.variants?.[0]);
  const [selectedAddons, setSelectedAddons] = useState<Array<{ id: string; name: string; price: number }>>(initialAddons);
  const [quantity, setQuantity] = useState(initialQuantity);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  if (!selectedItem) return null;

  const basePrice = selectedVariant?.price || selectedItem.price;
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const total = (basePrice + addonsTotal) * quantity;

  const handleAddToOrder = () => {
    if (editMode && itemToReplace?.uniqueId) {
      // Remove the old item first
      removeFromOrder(itemToReplace.uniqueId);
    }

    const orderItem: OrderItem = {
      ...selectedItem,
      quantity,
      selectedVariant,
      selectedAddons,
      price: basePrice
    };
    addToOrder(orderItem);
    handleClose();
  };

  const handleClose = () => {
    setSelectedItem(null);
    onClose();
  };

  const handleAddonToggle = (addon: { id: string; name: string; price: number }) => {
    setSelectedAddons(current => 
      current.some(item => item.id === addon.id)
        ? current.filter(item => item.id !== addon.id)
        : [...current, addon]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={dialogRef}
        className="bg-white rounded-lg w-full max-w-[90rem] max-h-[90vh] flex flex-col md:flex-row"
      >
        {/* Left Column - Image and Basic Info */}
        <div className="md:w-1/3 relative">
          <img
            src={selectedItem.image}
            alt={selectedItem.name}
            className="w-full h-64 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
          />
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Middle Column - Variants and Quantity */}
        <div className="md:w-1/3 p-6 overflow-y-auto">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h2>
            <p className="text-gray-600 mt-2">{selectedItem.description}</p>
          </div>

          {selectedItem.variants && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Choose your size</h3>
              <div className="space-y-2">
                {selectedItem.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={cn(
                      'w-full p-3 rounded-lg border text-left',
                      selectedVariant?.id === variant.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{variant.name}</span>
                      <span>{formatCurrency(variant.price)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Quantity</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="text-lg font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Add-ons and Order Button */}
        <div className="md:w-1/3 p-6 border-t md:border-t-0 md:border-l border-gray-200 overflow-y-auto">
          {selectedItem.addons && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Add extras</h3>
              <div className="space-y-4">
                {(['sides', 'drinks', 'desserts'] as const).map(category => {
                  const categoryAddons = selectedItem.addons?.filter(addon => addon.category === category);
                  if (!categoryAddons?.length) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium capitalize">{category}</h4>
                      {categoryAddons.map(addon => (
                        <button
                          key={addon.id}
                          onClick={() => handleAddonToggle(addon)}
                          className={cn(
                            'w-full p-3 rounded-lg border text-left',
                            selectedAddons.some(item => item.id === addon.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-200'
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <span>{addon.name}</span>
                            <span>+{formatCurrency(addon.price)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-semibold">{formatCurrency(total)}</span>
            </div>
            <button
              onClick={handleAddToOrder}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {editMode ? 'Update Order' : 'Add to Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDialog; 