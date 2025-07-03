import React, { useState, useEffect } from 'react';
import { X, Percent, Gift, Award, CreditCard, Wallet, QrCode } from 'lucide-react';
import { usePOSStore } from '../store/pos-store';
import { cn, formatCurrency } from '../lib/utils';

interface PaymentDialogProps {
  onClose: () => void;
  totalAmount: number;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ onClose, totalAmount }) => {
  const { paymentModes, fetchPaymentModes, processPayment } = usePOSStore();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; value: number } | null>(null);

  // Simulated loyalty points data
  const loyaltyPoints = 1250;
  const pointsValue = 0.01; // Each point is worth $0.01
  const maxPointsRedemption = Math.min(loyaltyPoints * pointsValue, totalAmount * 0.2); // Max 20% of total
  const [usePoints, setUsePoints] = useState(false);

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
      calculatedDiscount = (totalAmount * value) / 100;
    } else {
      if (value > totalAmount) {
        setError('Fixed discount cannot exceed total amount');
        return;
      }
      calculatedDiscount = value;
    }

    setAppliedDiscount(calculatedDiscount);
    setError(null);
    setDiscountValue('');
  };

  const handleApplyCoupon = () => {
    // Simulate coupon validation
    const validCoupons = {
      'WELCOME10': { value: 10, type: 'percentage' },
      'SAVE20': { value: 20, type: 'percentage' },
      'FLAT50': { value: 50, type: 'fixed' }
    };

    const coupon = validCoupons[couponCode as keyof typeof validCoupons];
    if (!coupon) {
      setError('Invalid coupon code');
      return;
    }

    const couponValue = coupon.type === 'percentage' 
      ? (totalAmount * coupon.value) / 100
      : coupon.value;

    setAppliedCoupon({ code: couponCode, value: couponValue });
    setError(null);
    setCouponCode('');
  };

  const subtotal = totalAmount;
  const pointsDiscount = usePoints ? maxPointsRedemption : 0;
  const totalDiscount = appliedDiscount + (appliedCoupon?.value || 0) + pointsDiscount;
  const finalTotal = Math.max(0, subtotal - totalDiscount);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row">
        {/* Left Column - Discounts and Loyalty */}
        <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Discount Section */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Apply Discount
            </h3>
            <div className="flex gap-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter amount'}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={handleApplyDiscount}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Apply Coupon
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Loyalty Points Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Award className="w-5 h-5" />
              Loyalty Points
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-700">Available Points</span>
                <span className="font-semibold text-blue-700">{loyaltyPoints}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-blue-700">Maximum Redemption Value</span>
                <span className="font-semibold text-blue-700">{formatCurrency(maxPointsRedemption)}</span>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-blue-700">Use points for this purchase</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Payment Methods and Summary */}
        <div className="md:w-1/2 p-6 overflow-y-auto">
          {/* Payment Methods */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <div className="grid grid-cols-1 gap-3">
              {paymentModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={cn(
                    'flex items-center gap-3 p-4 border rounded-lg text-left transition-colors',
                    selectedMode === mode.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2',
                    selectedMode === mode.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  )}>
                    {selectedMode === mode.id && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {mode.id === 'cash' && <Wallet className="w-5 h-5 text-green-600" />}
                    {mode.id === 'card' && <CreditCard className="w-5 h-5 text-blue-600" />}
                    {mode.id === 'upi' && <QrCode className="w-5 h-5 text-purple-600" />}
                    <span className="font-medium">{mode.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

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
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(appliedDiscount)}</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-{formatCurrency(appliedCoupon.value)}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Loyalty Points</span>
                  <span>-{formatCurrency(pointsDiscount)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing || !selectedMode}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-medium text-white transition-colors',
              isProcessing || !selectedMode
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            {isProcessing ? 'Processing...' : `Pay ${formatCurrency(finalTotal)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDialog; 