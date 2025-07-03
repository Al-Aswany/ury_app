import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { MenuItem, OrderItem, usePOSStore } from '../store/pos-store';
import { cn, formatCurrency } from '../lib/utils';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui';

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
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent 
        ref={dialogRef}
        variant="xlarge"
        className="bg-white w-full max-w-[90rem] max-h-[90vh] flex flex-col md:flex-row p-0"
        showCloseButton={false}
      >
        {/* Left Column - Image and Basic Info */}
        <div className="md:w-1/3 relative">
          <img
            src={selectedItem.image}
            alt={selectedItem.name}
            className="w-full h-64 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
          />
          <Button
            onClick={handleClose}
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 bg-white shadow-lg"
          >
            <X className="w-5 h-5" />
          </Button>
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
                  <Button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    variant="outline"
                    className={cn(
                      'w-full p-3 text-left justify-start',
                      selectedVariant?.id === variant.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{variant.name}</span>
                      <span>{formatCurrency(variant.price)}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Quantity</h3>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full"
              >
                -
              </Button>
              <span className="text-lg font-medium">{quantity}</span>
              <Button
                onClick={() => setQuantity(q => q + 1)}
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full"
              >
                +
              </Button>
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
                        <Button
                          key={addon.id}
                          onClick={() => handleAddonToggle(addon)}
                          variant="outline"
                          className={cn(
                            'w-full p-3 text-left justify-start',
                            selectedAddons.some(item => item.id === addon.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-200'
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <span>{addon.name}</span>
                            <span>+{formatCurrency(addon.price)}</span>
                          </div>
                        </Button>
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
            <Button
              onClick={handleAddToOrder}
              variant="default"
              className="w-full"
            >
              {editMode ? 'Update Order' : 'Add to Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog; 