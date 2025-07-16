import React, { useEffect } from 'react';
import { Clock, User, UserCheck, Receipt, Calendar, Printer } from 'lucide-react';
import { Badge, Button, Card, CardContent } from '../components/ui';
import OrderStatusSidebar from '../components/OrderStatusSidebar';
import { useRootStore } from '../store/root-store';
import { formatCurrency } from '../lib/utils';
import { Spinner } from '../components/ui/spinner';

export default function Orders() {
  const { 
    orders,
    orderLoading,
    error,
    selectedStatus,
    pagination,
    selectedOrder,
    selectedOrderItems,
    selectedOrderTaxes,
    selectedOrderLoading,
    selectedOrderError,
    fetchOrders,
    setSelectedStatus,
    goToNextPage,
    goToPreviousPage,
    selectOrder,
    clearSelectedOrder
  } = useRootStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Function to format the date and time
  const formatDateTime = (date: string, time: string) => {
    const formattedDate = new Date(date + ' ' + time).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    return formattedDate;
  };

  // Function to format just the date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleOrderClick = (order: any) => {
    selectOrder(order);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold text-red-600 mb-2">Failed to load orders</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - Order Types */}
      <OrderStatusSidebar
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

      {/* Middle Section - Order Cards */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden pr-96">
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-20">
          {orderLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center mt-10">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-screen-xl mx-auto">
              {orders.map((order) => (
                <Card 
                  key={order.name} 
                  className={`p-0 bg-white hover:shadow-md transition-shadow flex flex-col overflow-hidden cursor-pointer ${
                    selectedOrder?.name === order.name ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                  onClick={() => handleOrderClick(order)}
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="p-3 bg-gray-50 border-b">
                    <h3 className="font-medium text-gray-900 text-sm truncate" title={order.name}>
                      {order.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">
                          {order.restaurant_table ? `Table ${order.restaurant_table} • ` : ''}{order.order_type}
                        </p>
                      </div>
                      <Badge variant={order.status === 'Draft' ? 'secondary' : 'default'} className="ml-2">
                        {order.status}
                      </Badge>
                    </div>
                    </div>

                    {/* Content section - matches MenuCard padding and structure */}
                    <div className="flex-1 p-3 flex flex-col">
                      <div className="">
                        <p className="text-sm text-gray-900">{order.customer}</p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDateTime(order.posting_date, order.posting_time)}</span>
                      </div>

                      {/* Total - pushed to bottom like MenuCard */}
                      <div className="mt-auto pt-2">
                        <span className="text-sm font-semibold text-gray-900 tabular-nums">
                          {formatCurrency(order.grand_total)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {/* Pagination Controls */}
          {!orderLoading && (
            <div className="py-4">
              <div className="flex justify-center items-center gap-x-4 max-w-screen-xl mx-auto">
                <Button
                  onClick={goToPreviousPage}
                  disabled={pagination.currentPage === 1}
                  variant="outline"
                  className='w-20'
                  size="xs"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.currentPage}
                  </span>
                </div>
                <Button
                  onClick={goToNextPage}
                  disabled={!pagination.hasNextPage}
                  variant="outline"
                  className='w-20'
                  size="xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Order Details */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-[calc(100vh-4rem)] fixed right-0 z-10">
        {!selectedOrder ? (
          <div className="text-center h-full flex flex-col items-center justify-center text-gray-500 p-6">
            <p className="text-lg font-medium mb-2">Select an order to view details</p>
            <p className="text-sm">Click on any order card to view its details</p>
          </div>
        ) : selectedOrderLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : selectedOrderError ? (
          <div className="text-center h-full flex flex-col items-center justify-center text-red-500 p-6">
            <p className="text-lg font-medium mb-2">Failed to load order details</p>
            <p className="text-sm">{selectedOrderError}</p>
          </div>
        ) : (
          <>
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 pb-40">
              {/* Order Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedOrder.name}</h2>
                  <Badge variant={selectedOrder.status === 'Draft' ? 'secondary' : 'default'}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                {/* Two-column Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  {/* First column: customer and time */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900 font-medium">{selectedOrder.customer}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{formatDateTime(selectedOrder.posting_date, selectedOrder.posting_time)}</span>
                    </div>
                  </div>
                  {/* Second column: waiter and table */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <UserCheck className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{selectedOrder.waiter}</span>
                    </div>
                    {selectedOrder.restaurant_table && (
                      <div className="flex items-center gap-3 text-sm">
                        <Receipt className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{selectedOrder.restaurant_table}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.item_name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Taxes */}
              {selectedOrderTaxes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Taxes & Charges</h3>
                  <div className="space-y-2">
                    {selectedOrderTaxes.map((tax, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600">{tax.description}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(tax.rate)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Section - Single Row: Print | Payment | Total */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 sticky bottom-0 left-0 right-0 z-10">
              <div className="flex items-center gap-3 w-full">
                {/* Print Icon Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => {
                    // TODO: Implement print functionality
                    console.log('Print order:', selectedOrder.name);
                  }}
                  aria-label="Print"
                >
                  <Printer className="w-5 h-5" />
                </Button>
                {/* Payment Button */}
                <Button
                  className="flex-1"
                  onClick={() => {
                    // TODO: Implement payment functionality
                    console.log('Process payment for order:', selectedOrder.name);
                  }}
                >
                  Payment
                </Button>
                {/* Total */}
                <span className="ml-auto text-xl font-bold text-gray-900 whitespace-nowrap">
                  {formatCurrency(selectedOrder.grand_total)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
