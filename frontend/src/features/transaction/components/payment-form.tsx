
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Loader from '@/components/loader';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/app/hooks';
import { useAttachPaymentMethodMutation } from '@/features/transaction/transactionApi';
import { useGetUserPaymentMethodsQuery } from '@/features/user/userApi';
import { useCreateReservationMutation } from '@/features/reservation/reservationApi';
import type { PaymentMethod } from '@/types/types';

export default function PaymentForm() {
  // stripe hooks
  const stripe = useStripe();
  const elements = useElements();
  
  const userId = useAppSelector(state => state.auth.user?.id); // get user id from redux store

  // RTK Query mutation to attach payment method
  const [attachPaymentMethod, { isLoading: isAttaching, error: attachError }] = useAttachPaymentMethodMutation(); 

  // RTK Query mutation to create reservation
  const [createReservation] = useCreateReservationMutation();

  const checkoutData = useAppSelector(state => state.reservations.checkoutData);
  
  // RTK Query to get user's payment methods
  const {
    data: paymentMethods,
    isLoading: isLoadingMethods,
    refetch: refetchPaymentMethods
  } = useGetUserPaymentMethodsQuery(userId ?? '');
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showAddNew, setShowAddNew] = useState(false);

  // handle payment method selection
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'add-new') {
      setShowAddNew(true);
      setSelectedMethod(null);
    } else {
      setShowAddNew(false);
      const selected = paymentMethods?.find(pm => pm.paymentMethodId === e.target.value) || null;
      setSelectedMethod(selected);
    }
  };

  // form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return <Loader />;
    }

    if (!checkoutData) {
      console.error('No checkout data available');
      return;
    }

    // Option 1: using existing payment method
    if (!showAddNew && selectedMethod) {
      
      const reservation = {
        userId: userId,
        roomId: checkoutData.roomId,
        checkIn: checkoutData.checkIn,
        checkOut: checkoutData.checkOut,
        numGuests: checkoutData.numGuests,
        totalPrice: checkoutData.totalPrice,
        paymentMethodId: selectedMethod?.paymentMethodId,
      };
    
      try {
        await createReservation(reservation).unwrap();
        // Optionally handle success (e.g., redirect or show message)
      } catch (err) {
        console.error('Failed to create reservation:', err);
      }
      return;
    }

    // Option 2: without existing payment method
    // create new payment method with Stripe
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error('CardElement not found');
      return;
    }
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error(error);
      return;
    }

    // attach payment method to user
    try {
      await attachPaymentMethod({ userId: userId ?? '', paymentMethodId: paymentMethod.id }).unwrap();
      // Refetch payment methods and select the new one
      const refreshed = await refetchPaymentMethods();
      const newMethod = refreshed.data?.find((pm: PaymentMethod) => pm.paymentMethodId === paymentMethod.id) || null;
      setSelectedMethod(newMethod);
      setShowAddNew(false);
    } catch (err) {
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Payment Method</label>
        {isLoadingMethods ? (
          <Loader />
        ) : paymentMethods && paymentMethods.length > 0 ? (
          <select
            className="w-full px-3 py-2 h-10 border border-input rounded-md bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mb-2"
            value={selectedMethod?.paymentMethodId || ''}
            onChange={handleSelectChange}
          >
            <option value="" disabled>{showAddNew ? 'Add new payment method' : 'Select a payment method'}</option>
            {paymentMethods?.map((pm) => (
              <option key={pm.paymentMethodId} value={pm.paymentMethodId}>
                {pm.card.brand.toUpperCase()} **** {pm.card.last4} (exp {pm.card.expMonth}/{pm.card.expYear})
              </option>
            ))}
            <option value="add-new">Add new payment method</option>
          </select>
        ) : (
          <Button type="button" className="w-full mb-2" onClick={() => setShowAddNew(true)}>
            Add a new card
          </Button>
        )}
      </div>
      {showAddNew && (
        <div>
          <label className="block text-sm font-medium mb-2">Card Details</label>
          <div className="border border-input rounded-md px-3 py-2 bg-background">
            <CardElement options={{ style: { base: { fontSize: '16px', color: '#1a202c' } } }} />
          </div>
        </div>
      )}
      {attachError && (
        <div className="text-red-600 text-sm font-semibold">Failed to attach payment method.</div>
      )}
      <Button
        type="submit"
        className="w-full cursor-pointer"
        disabled={isAttaching || (!showAddNew && !selectedMethod)}
      >
        {showAddNew ? (isAttaching ? 'Adding...' : 'Add Payment Method') : 'Book Reservation'}
      </Button>
    </form>
  );
}