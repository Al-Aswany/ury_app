import React, { useState } from 'react';
import { ChevronDown, Utensils, ShoppingBag, Truck, Globe } from 'lucide-react';
import { usePOSStore, type OrderType } from '../store/pos-store';
import { cn } from '../lib/utils';

const orderTypes = [
  { id: 'dine-in' as OrderType, label: 'Dine In', icon: Utensils },
  { id: 'takeaway' as OrderType, label: 'Takeaway', icon: ShoppingBag },
  { id: 'delivery' as OrderType, label: 'Delivery', icon: Truck },
  { id: 'aggregator' as OrderType, label: 'Aggregator', icon: Globe },
];

const OrderTypeSelect = () => {
  const { selectedOrderType, setSelectedOrderType } = usePOSStore();
  const [isOpen, setIsOpen] = useState(false);

  const selectedType = orderTypes.find(type => type.id === selectedOrderType);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {selectedType && <selectedType.icon className="w-4 h-4 text-gray-600" />}
          <span className="font-medium">{selectedType?.label}</span>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {orderTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedOrderType(type.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors',
                  selectedOrderType === type.id && 'bg-blue-50 text-blue-700'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderTypeSelect; 