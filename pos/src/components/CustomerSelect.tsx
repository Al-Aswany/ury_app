import React, { useState } from 'react';
import { Search, UserPlus, Mail, Phone } from 'lucide-react';
import { customers, usePOSStore, type Customer } from '../store/pos-store';

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
          <button
            onClick={() => setSelectedCustomer(null)}
            className="text-blue-700 hover:text-blue-800"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            placeholder="Search customer..."
            className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearching(true)}
          />
          <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
          
          {isSearching && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                  <button
                    key={customer.id}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center border-b border-gray-100 last:border-0"
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
                  </button>
                ))
              ) : (
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-3">No customers found</p>
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-primary-600 hover:text-primary-700 hover:bg-gray-50 rounded-md font-medium"
                    onClick={() => {
                      setShowNewCustomerForm(true);
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                    Add {searchTerm ? `"${searchTerm}"` : 'New Customer'}
                  </button>
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
                    <input
                      type="text"
                      defaultValue={searchTerm}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <Mail className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="relative">
                      <input
                        type="tel"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <Phone className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
                    >
                      Add Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCustomerForm(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                    >
                      Cancel
                    </button>
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