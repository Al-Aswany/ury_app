import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Package, Truck, CheckSquare } from 'lucide-react';
import { usePOSStore } from '../store/pos-store';
import { formatCurrency } from '../lib/utils';
import { Button, Badge, Card, CardContent } from '../components/ui';

export default function Orders() {
  const { orders, fetchOrders, updateOrderStatus } = usePOSStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
    paid: { label: 'Paid', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
    preparing: { label: 'Preparing', icon: Package, color: 'text-blue-600 bg-blue-100' },
    ready: { label: 'Ready', icon: CheckSquare, color: 'text-purple-600 bg-purple-100' },
    completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-100' },
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const getStatusIcon = (status: keyof typeof statusConfig) => {
    const Icon = statusConfig[status].icon;
    return <Icon className="w-4 h-4" />;
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus as any);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Status</h1>
        <p className="text-gray-600">Track and manage all orders</p>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedStatus('all')}
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All Orders ({orders.length})
          </Button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <Button
              key={status}
              onClick={() => setSelectedStatus(status)}
              variant={selectedStatus === status ? 'default' : 'outline'}
              size="sm"
            >
              {config.label} ({orders.filter(o => o.status === status).length})
            </Button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => {
          const status = statusConfig[order.status as keyof typeof statusConfig];
          const Icon = status.icon;

          return (
            <Card
              key={order.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${status.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{status.label}</span>
                </div>
                <span className="text-sm text-gray-500">#{order.id.slice(-6)}</span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Type:</span>
                  <span className="font-medium capitalize">{order.orderType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium">{order.paymentMode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleStatusUpdate(order.id, 'preparing')}
                      variant="default"
                      size="xs"
                    >
                      Start Preparing
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                      variant="danger"
                      size="xs"
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {order.status === 'preparing' && (
                  <Button
                    onClick={() => handleStatusUpdate(order.id, 'ready')}
                    variant="warning"
                    size="xs"
                  >
                    Mark Ready
                  </Button>
                )}
                {order.status === 'ready' && (
                  <Button
                    onClick={() => handleStatusUpdate(order.id, 'completed')}
                    variant="success"
                    size="xs"
                  >
                    Complete
                  </Button>
                )}
              </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">Orders will appear here once they are created</p>
        </div>
      )}
    </div>
  );
};
