import React, { useState } from 'react';
import { Search, UserPlus, Mail, Phone } from 'lucide-react';
import { customers, usePOSStore, type Customer } from '../store/pos-store';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui';

const CustomerSelect = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const { selectedCustomer, setSelectedCustomer } = usePOSStore();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="relative">
      {selectedCustomer ? (
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
          <div>
            <p className="font-medium text-blue-900">{selectedCustomer.name}</p>
            <p className="text-sm text-blue-700">{selectedCustomer.phone}</p>
          </div>
          <Button
            onClick={() => setSelectedCustomer(null)}
            variant="ghost"
            size="sm"
            className="text-blue-700 hover:text-blue-800"
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            type="text"
            placeholder="Search customer..."
            className="w-full pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearching(true)}
          />
          <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
          
          {isSearching && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                  <Button
                    key={customer.id}
                    variant="ghost"
                    className="w-full text-left hover:bg-gray-50 flex justify-between items-center border-b border-gray-100 last:border-0"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setIsSearching(false);
                      setSearchTerm('');
                    }}
                  >
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-3">No customers found</p>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 w-full text-primary-600 hover:text-primary-700 hover:bg-gray-50 font-medium"
                    onClick={() => {
                      setShowNewCustomerForm(true);
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                    Add {searchTerm ? `"${searchTerm}"` : 'New Customer'}
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {showNewCustomerForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Customer</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input
                      type="text"
                      defaultValue={searchTerm}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Input
                        type="email"
                        className="w-full pl-10"
                      />
                      <Mail className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="relative">
                      <Input
                        type="tel"
                        className="w-full pl-10"
                      />
                      <Phone className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button
                      type="submit"
                      variant="default"
                      className="flex-1"
                    >
                      Add Customer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewCustomerForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSelect; 