import React, { useState, useEffect } from 'react';
import { X, Percent, Gift, Award, CreditCard, Wallet, QrCode } from 'lucide-react';
import { usePOSStore } from '../store/pos-store';
import { cn, formatCurrency } from '../lib/utils';
import { Button, Input, Select, SelectItem, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui';
import { RadixSelect } from './ui/select';

interface PaymentDialogProps {
  onClose: () => void;
  grandTotal: number;
  roundedTotal: number;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ onClose, grandTotal, roundedTotal }) => {
  const { paymentModes, fetchPaymentModes, processPayment } = usePOSStore();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  useEffect(() => {
    fetchPaymentModes();
  }, [fetchPaymentModes]);

  const handleApplyDiscount = () => {
    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid discount value');
      return;
    }
    let calculatedDiscount = 0;
    if (discountType === 'percentage') {
      if (value > 100) {
        setError('Percentage discount cannot exceed 100%');
        return;
      }
      calculatedDiscount = (grandTotal * value) / 100;
    } else {
      if (value > grandTotal) {
        setError('Discount cannot exceed total amount');
        return;
      }
      calculatedDiscount = value;
    }
    setAppliedDiscount(calculatedDiscount);
    setError(null);
    setDiscountValue('');
  };

  // Order summary logic
  const subtotal = grandTotal;
  const adjustment = roundedTotal - grandTotal;
  const roundedAdjustment = Math.round(adjustment * 100) / 100;
  const showAdjustment = Math.abs(roundedAdjustment) > 0.001;
  const totalDiscount = appliedDiscount;
  const discountedTotal = Math.max(0, subtotal - totalDiscount);
  const finalTotal = Math.round(discountedTotal); // Always round after discount
  const finalAdjustment = finalTotal - discountedTotal;
  const roundedFinalAdjustment = Math.round(finalAdjustment * 100) / 100;
  const showFinalAdjustment = Math.abs(roundedFinalAdjustment) > 0.001;

  const handlePayment = async () => {
    if (!selectedMode) {
      setError('Please select a payment method');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      await processPayment(selectedMode, finalTotal);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent variant="xlarge" className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row p-0" showCloseButton={false}>
        {/* Left Column - Discount and Payment Mode */}
        <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Discount Section */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Apply Discount
            </h3>
            <div className="flex gap-2">
              <Select
                value={discountType}
                onValueChange={(val) => setDiscountType(val as 'percentage' | 'fixed')}
                size="sm"
                className="w-24"
              >
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
              </Select>
              <Input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter amount'}
                size="sm"
                className="flex-1"
              />
              <Button
                onClick={handleApplyDiscount}
                variant="default"
                size="sm"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <div className="grid grid-cols-1 gap-3">
              {paymentModes.map((mode: any) => (
                <Button
                  key={typeof mode === 'string' ? mode : mode.id}
                  onClick={() => setSelectedMode(typeof mode === 'string' ? mode : mode.id)}
                  variant="outline"
                  className={cn(
                    'flex items-center gap-3 p-4 text-left justify-start transition-colors',
                    selectedMode === (typeof mode === 'string' ? mode : mode.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2',
                    selectedMode === (typeof mode === 'string' ? mode : mode.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  )}>
                    {selectedMode === (typeof mode === 'string' ? mode : mode.id) && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {typeof mode !== 'string' && mode.id === 'cash' && <Wallet className="w-5 h-5 text-green-600" />}
                    {typeof mode !== 'string' && mode.id === 'card' && <CreditCard className="w-5 h-5 text-blue-600" />}
                    {typeof mode !== 'string' && mode.id === 'upi' && <QrCode className="w-5 h-5 text-purple-600" />}
                    <span className="font-medium">{typeof mode === 'string' ? mode : mode.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary and Pay Button */}
        <div className="md:w-1/2 p-6 overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Order Summary */}
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {/* Subtotal (Grand Total) */}
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {/* Discount */}
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(appliedDiscount)}</span>
                </div>
              )}
              {/* Adjustment (if any) */}
              {showFinalAdjustment && (
                <div className="flex justify-between text-blue-600">
                  <span>Adjustment</span>
                  <span>{roundedFinalAdjustment > 0 ? '+' : ''}{formatCurrency(roundedFinalAdjustment)}</span>
                </div>
              )}
              {/* Final Total (Rounded) */}
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !selectedMode}
            variant={isProcessing || !selectedMode ? "secondary" : "default"}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : `Pay ${formatCurrency(finalTotal)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog; 