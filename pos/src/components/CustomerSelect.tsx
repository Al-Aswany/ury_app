import { useState } from 'react';
import { UserPlus, Mail, Phone } from 'lucide-react';
import { customers, usePOSStore, type Customer } from '../store/pos-store';
import { Button, Dialog, DialogContent } from './ui';
import { useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomerSelect = () => {
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { selectedCustomer, setSelectedCustomer } = usePOSStore();

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      setHighlightedIndex(0);
      return;
    }
    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredCustomers.length));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (isOpen) {
        if (highlightedIndex === filteredCustomers.length) {
          setShowNewCustomerForm(true);
          setIsOpen(false);
        } else if (filteredCustomers[highlightedIndex]) {
          setSelectedCustomer(filteredCustomers[highlightedIndex]);
          setSearchTerm('');
          setIsOpen(false);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

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
          <div className="flex items-center relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
                setHighlightedIndex(0);
              }}
              onFocus={() => setIsOpen(true)}
              onBlur={e => {
                // Delay to allow click selection
                setTimeout(() => setIsOpen(false), 100);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search customer..."
              className="w-full h-10 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              aria-label="Search customer"
              autoComplete="off"
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {isOpen && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, idx) => (
                  <button
                    key={customer.id}
                    type="button"
                    className={`w-full gap-2 px-4 py-2 text-left rounded-md text-gray-800 text-sm select-none transition-colors ${
                      idx === highlightedIndex ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                    }`}
                    onMouseDown={() => {
                      setSelectedCustomer(customer);
                      setSearchTerm('');
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <div className="font-medium">{customer.name}</div>
                    <div className="ml-auto text-xs text-gray-500">{customer.phone}</div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm select-none">No customers found</div>
              )}
              <div className="my-1 h-px bg-gray-100" />
              <button
                type="button"
                className={`flex items-center gap-2 w-full px-4 py-2 text-primary-600 hover:text-primary-700 hover:bg-gray-50 font-medium rounded-md text-sm select-none transition-colors ${
                  highlightedIndex === filteredCustomers.length ? 'bg-primary-50' : ''
                }`}
                onMouseDown={() => {
                  setShowNewCustomerForm(true);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightedIndex(filteredCustomers.length)}
              >
                <UserPlus className="w-4 h-4" /> Add New Customer
              </button>
            </div>
          )}
        </div>
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