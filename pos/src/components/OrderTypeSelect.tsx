import React, { useState } from 'react';
import { usePOSStore } from '../store/pos-store';
import { cn } from '../lib/utils';
import { Button } from './ui';
import TableSelectionDialog from './TableSelectionDialog';
import { DINE_IN, ORDER_TYPES , type OrderType} from '../data/order-types';


const OrderTypeSelect = () => {
  const { selectedOrderType, setSelectedOrderType, selectedTable } = usePOSStore();
  const [showTableDialog, setShowTableDialog] = useState(false);

  const handleOrderTypeSelect = (type: OrderType) => {
    setSelectedOrderType(type);
    if (type === DINE_IN) {
      setShowTableDialog(true);
    }
  };

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
        {ORDER_TYPES.map(({ label, value, icon: Icon }) => {
          return (
            <Button
              key={value}
              onClick={() => handleOrderTypeSelect(value)}
              variant={selectedOrderType === value ? 'default' : 'outline'}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-white border',
                selectedOrderType === value
                ? 'text-primary border-primary hover:bg-white'
                : 'text-gray-700 border-gray-200 hover:bg-gray-50'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          );
        })}
      </div>

      {selectedOrderType === DINE_IN && selectedTable && (
        <Button
          onClick={() => setShowTableDialog(true)}
          variant="ghost"
          className="mt-2 text-sm text-primary-600 hover:text-primary-700"
        >
          Table {selectedTable}
        </Button>
      )}

      {showTableDialog && (
        <TableSelectionDialog onClose={() => setShowTableDialog(false)} />
      )}
    </div>
  );
};

export default OrderTypeSelect; 