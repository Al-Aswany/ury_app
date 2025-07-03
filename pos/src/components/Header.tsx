import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search,
  Bell,
  Command,
  User,
  ChevronDown,
  LogOut,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  AlertCircle,
  DollarSign,
  ChefHat,
  CheckSquare,
  Monitor,
  BarChart3
} from 'lucide-react';
import { Button, Input, Badge } from './ui';

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Enhanced notification data with restaurant-specific alerts
  const notifications = [
    {
      id: 5,
      type: 'info',
      title: 'Order Ready to Serve',
      message: 'Table 4 - Chicken Biryani and Mutton Curry are ready for service',
      time: '3 min ago',
      unread: true,
      icon: ChefHat,
      priority: 'medium'
    },
    {
      id: 1,
      type: 'attention',
      title: 'Low Stock Alert',
      message: 'Chicken Biryani ingredients running low - Only 2 portions left',
      time: '5 min ago',
      unread: true,
      icon: AlertTriangle,
      priority: 'high'
    },
    {
      id: 2,
      type: 'alert',
      title: 'Table Occupied Too Long',
      message: 'Table 4 has been occupied for over 50 minutes - Consider checking on guests',
      time: '8 min ago',
      unread: true,
      icon: AlertCircle,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Order Delay Warning',
      message: 'Table 2 order is running 15 minutes behind estimated time',
      time: '12 min ago',
      unread: true,
      icon: Clock,
      priority: 'high'
    },
    {
      id: 4,
      type: 'alert',
      title: 'Payment Pending',
      message: 'Order #1234 was billed 15 minutes ago but payment not received',
      time: '15 min ago',
      unread: true,
      icon: DollarSign,
      priority: 'high'
    },
    {
      id: 6,
      type: 'order',
      title: 'New Order Received',
      message: 'Table 7 has placed a new order - 2x Masala Dosa, 1x Filter Coffee',
      time: '18 min ago',
      unread: false,
      icon: Package,
      priority: 'low'
    },
    {
      id: 7,
      type: 'payment',
      title: 'Payment Confirmed',
      message: 'Table 3 - Order #1235 payment of ₹450 received successfully',
      time: '22 min ago',
      unread: false,
      icon: CheckCircle,
      priority: 'low'
    },
    {
      id: 8,
      type: 'system',
      title: 'Daily Backup Complete',
      message: 'System backup completed successfully at 2:00 AM',
      time: '6 hours ago',
      unread: false,
      icon: CheckCircle,
      priority: 'low'
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Handle clicks outside of menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationsToggle = () => {
    setShowUserMenu(false);
    setShowNotifications(!showNotifications);
  };

  const handleUserMenuToggle = () => {
    setShowNotifications(false);
    setShowUserMenu(!showUserMenu);
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return 'text-red-600 bg-red-100';
    }
    
    switch (type) {
      case 'attention': return 'text-orange-600 bg-orange-100';
      case 'alert': return 'text-red-600 bg-red-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'order': return 'text-purple-600 bg-purple-100';
      case 'payment': return 'text-green-600 bg-green-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/assets/ury/pos/ury_pos.png" 
              alt="URY POS" 
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <Button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            variant="outline"
            className="relative w-full flex items-center text-left bg-gray-50 hover:bg-gray-100"
          >
            <Input
              readOnly
              placeholder="Search orders, menu items, or customers..."
              className="w-full bg-transparent border-0 focus:outline-none cursor-pointer"
              onClick={(e) => e.preventDefault()}
            />
            <div className="flex items-center gap-2 text-gray-400">
              <Command className="w-4 h-4" />
              <span>K</span>
            </div>
          </Button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <Button
              onClick={handleNotificationsToggle}
              variant="ghost"
              size="icon"
              className="relative text-gray-600 hover:text-gray-900"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="danger" 
                  size="sm" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${notification.unread ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getNotificationColor(notification.type, notification.priority)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${getPriorityIndicator(notification.priority)}`} />
                                <span className="text-xs text-gray-500">{notification.time}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              onClick={handleUserMenuToggle}
              variant="ghost"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">Admin</span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-sm text-gray-500">admin@urypos.com</p>
                </div>
                <div className="py-2">
                  <Link
                    to="/pos/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Monitor className="w-4 h-4 mr-3" />
                    Settings
                  </Link>
                  <Link
                    to="/pos/analytics"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Analytics
                  </Link>
                  <Button
                    variant="ghost"
                    className="flex items-center w-full justify-start text-sm text-gray-700"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 