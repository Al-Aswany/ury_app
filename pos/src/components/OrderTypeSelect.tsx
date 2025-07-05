import React, { useState } from 'react';
import { Utensils, ShoppingBag, Truck, Globe } from 'lucide-react';
import { usePOSStore, type OrderType } from '../store/pos-store';
import { cn } from '../lib/utils';
import { Button } from './ui';
import TableSelectionDialog from './TableSelectionDialog';

const orderTypes = [
  { id: 'dine-in' as OrderType, label: 'Dine In', icon: Utensils },
  { id: 'takeaway' as OrderType, label: 'Takeaway', icon: ShoppingBag },
  { id: 'delivery' as OrderType, label: 'Delivery', icon: Truck },
  { id: 'aggregator' as OrderType, label: 'Aggregator', icon: Globe },
];

const OrderTypeSelect = () => {
  const { selectedOrderType, setSelectedOrderType, selectedTable } = usePOSStore();
  const [showTableDialog, setShowTableDialog] = useState(false);

  const handleOrderTypeSelect = (type: OrderType) => {
    setSelectedOrderType(type);
    if (type === 'dine-in') {
      setShowTableDialog(true);
    }
  };

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
        {orderTypes.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            onClick={() => handleOrderTypeSelect(id)}
            variant={selectedOrderType === id ? 'default' : 'outline'}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-white border',
              selectedOrderType === id
                ? 'text-primary border-primary hover:bg-white'
                : 'text-gray-700 border-gray-200 hover:bg-gray-50'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>

      {selectedOrderType === 'dine-in' && selectedTable && (
        <Button
          onClick={() => setShowTableDialog(true)}
          variant="ghost"
          className="mt-2 text-sm text-primary-600 hover:text-primary-700"
        >
          Table {selectedTable}
        </Button>
      )}

      {/* {showTableDialog && (
        <TableSelectionDialog onClose={() => setShowTableDialog(false)} />
      )} */}
      {showTableDialog && (
        <TableSelectionDialog onClose={() => setShowTableDialog(false)} />
      )}
    </div>
  );
};

export default OrderTypeSelect; 