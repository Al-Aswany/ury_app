import React, { useEffect } from 'react';
import { Clock } from 'lucide-react';
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
    fetchOrders,
    setSelectedStatus,
    goToNextPage,
    goToPreviousPage
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
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Sidebar - Order Types */}
      <OrderStatusSidebar
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        getStatusCount={() => orders.length}
      />

      {/* Middle Section - Order Cards */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
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
                <Card key={order.name} className="bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg truncate" title={order.name}>
                          {order.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {order.restaurant_table ? `${order.restaurant_table} • ` : ''}
                          {order.order_type}
                        </p>
                      </div>
                      <Badge variant={order.status === 'Draft' ? 'secondary' : 'default'}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(order.posting_date, order.posting_time)}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {order.customer} • {order.mobile_number}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Total</span>
                        <span className="text-lg font-semibold">{formatCurrency(order.grand_total)}</span>
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
      <div className="w-96 bg-white border-l border-gray-200 p-6">
        <div className="text-center h-full flex flex-col items-center justify-center text-gray-500">
          <p className="text-lg font-medium mb-2">Select an order to view details</p>
          <p className="text-sm">Click on any order card to view its details</p>
        </div>
      </div>
    </div>
  );
};
