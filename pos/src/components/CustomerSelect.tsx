import React, { useState } from 'react';
import { UserPlus, Mail, Phone } from 'lucide-react';
import { customers, usePOSStore, type Customer } from '../store/pos-store';
import { Button, Dialog, DialogContent } from './ui';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';

const CustomerSelect = () => {
  // Remove search state, use Radix Select
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const { selectedCustomer, setSelectedCustomer } = usePOSStore();

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
        <RadixSelect.Root
          onValueChange={(value) => {
            if (value === '__add_new__') {
              setShowNewCustomerForm(true);
            } else {
              const customer = customers.find((c) => c.id === value);
              if (customer) setSelectedCustomer(customer);
            }
          }}
        >
          <RadixSelect.Trigger
            className="flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            aria-label="Select customer"
          >
            <RadixSelect.Value placeholder="Select customer..." />
            <ChevronDown className="ml-2 w-4 h-4 text-gray-400" />
          </RadixSelect.Trigger>
          <RadixSelect.Portal>
            <RadixSelect.Content
              className="z-50 w-[var(--radix-select-trigger-width)] bg-white border border-gray-200 rounded-lg shadow-lg mt-2 max-h-80 overflow-y-auto"
              position="popper"
              sideOffset={4}
            >
              <RadixSelect.Viewport>
                {customers.map((customer) => (
                  <RadixSelect.Item
                    key={customer.id}
                    value={customer.id}
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50 rounded-md text-gray-800 text-sm outline-none select-none"
                  >
                    <span className="font-medium">{customer.name}</span>
                    <span className="ml-auto text-xs text-gray-500">{customer.phone}</span>
                  </RadixSelect.Item>
                ))}
                <RadixSelect.Separator className="my-1 h-px bg-gray-100" />
                <RadixSelect.Item
                  value="__add_new__"
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer text-primary-600 hover:text-primary-700 hover:bg-gray-50 font-medium rounded-md text-sm outline-none select-none"
                >
                  <UserPlus className="w-4 h-4" /> Add New Customer
                </RadixSelect.Item>
              </RadixSelect.Viewport>
            </RadixSelect.Content>
          </RadixSelect.Portal>
        </RadixSelect.Root>
      )}
      {showNewCustomerForm && (
        <Dialog open={showNewCustomerForm} onOpenChange={setShowNewCustomerForm}>
          <DialogContent className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Customer</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm pl-10"
                  />
                  <Mail className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <input
                    type="tel"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm pl-10"
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
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CustomerSelect; 