import React, { useState } from 'react';
import { Trash2, Edit, FrownIcon, Plus } from 'lucide-react';
import { usePOSStore } from '../store/pos-store';
import { formatCurrency, cn } from '../lib/utils';
import CustomerSelect from './CustomerSelect';
import ProductDialog from './ProductDialog';
import OrderTypeSelect from './OrderTypeSelect';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';

const OrderPanel = () => {
  const { 
    activeOrders, 
    removeFromOrder, 
    updateQuantity, 
    clearOrder, 
    setSelectedItem,
    orderLoading,
    isOrderInteractionDisabled,
    isUpdatingOrder
  } = usePOSStore();
  const [editingItem, setEditingItem] = useState<typeof activeOrders[0] | null>(null);

  const calculateItemTotal = (item: typeof activeOrders[0]) => {
    const basePrice = item.selectedVariant?.price || item.price;
    const addonsTotal = item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
    return (basePrice + addonsTotal) * item.quantity;
  };

  const total = activeOrders.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0
  );

  const handleEdit = (item: typeof activeOrders[0]) => {
    const menuItem = {
      ...item,
      variants: item.variants,
      addons: item.addons,
    };
    setSelectedItem(menuItem);
    setEditingItem(item);
  };

  const EmptyCartUI = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <FrownIcon className="w-12 h-12 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Your cart is empty
      </h3>
      
      <p className="text-gray-500 text-sm mb-6 max-w-xs leading-relaxed">
        Add items to get started with your order
      </p>
      
      <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">Click items to add them</span>
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        Double-click for customization options
      </div>
    </div>
  );

  const LoadingOrderUI = () => (
    <div className="h-96">
      <Spinner message="Loading order details..." />
    </div>
  );

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-[calc(100vh-4rem)] fixed right-0 z-10">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <OrderTypeSelect disabled={isOrderInteractionDisabled()} />
        <div className="mt-3"><CustomerSelect disabled={isOrderInteractionDisabled()} /></div>
      </div>
      
      {orderLoading ? (
        <LoadingOrderUI />
      ) : activeOrders.length === 0 ? (
        <EmptyCartUI />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-6">
            {activeOrders.map((item) => (
              <div
                key={item.uniqueId}
                className={cn(
                  "flex flex-col py-4 border-b border-gray-100",
                  isOrderInteractionDisabled() && "opacity-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                    </div>
                    {item.selectedVariant && (
                      <p className="text-sm text-gray-600">{item.selectedVariant.name}</p>
                    )}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <p className="text-sm text-gray-500">
                        {item.selectedAddons.map(addon => addon.name).join(', ')}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm">{formatCurrency(calculateItemTotal(item))}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleEdit(item)}
                      variant="ghost"
                      size="icon"
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit item"
                      disabled={isOrderInteractionDisabled()}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => updateQuantity(item.uniqueId!, Math.max(0, item.quantity - 1))}
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        disabled={isOrderInteractionDisabled()}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button
                        onClick={() => updateQuantity(item.uniqueId!, item.quantity + 1)}
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        disabled={isOrderInteractionDisabled()}
                      >
                        +
                      </Button>
                    </div>
                    
                    <Button
                      onClick={() => removeFromOrder(item.uniqueId!)}
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      disabled={isOrderInteractionDisabled()}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {activeOrders.length > 0 && (
              <Button
                onClick={clearOrder}
                variant="ghost"
                size="sm"
                className="w-full text-gray-600 hover:text-gray-800 mt-4"
                disabled={isOrderInteractionDisabled()}
              >
                Clear cart
              </Button>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
            <div className="flex justify-between mb-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-semibold">{formatCurrency(total)}</span>
            </div>
            <Button
              onClick={() => {
                // TODO: Implement order creation/update logic
              }}
              variant="default"
              size="default"
              className="w-full"
              disabled={isOrderInteractionDisabled()}
            >
              {isUpdatingOrder ? 'Update Order' : 'Add New Order'}
            </Button>
          </div>
        </>
      )}

      {editingItem && (
        <ProductDialog
          onClose={() => {
            setEditingItem(null);
            setSelectedItem(null);
          }}
          editMode
          initialVariant={editingItem.selectedVariant}
          initialAddons={editingItem.selectedAddons}
          initialQuantity={editingItem.quantity}
          itemToReplace={editingItem}
        />
      )}
    </div>
  );
};

export default OrderPanel; 