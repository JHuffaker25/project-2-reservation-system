import { useState, useEffect } from 'react';
import { setTheme } from '@/features/theme/themeSlice';
import { useGetUserDataQuery } from '@/features/auth/authApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useUpdateUserPreferencesMutation, useGetUserPaymentMethodsQuery, useDeleteUserPaymentMethodMutation } from '@/features/user/userApi';
import { useUpdateUserDetailsMutation } from '@/features/user/userApi';
import { useAttachPaymentMethodMutation } from '@/features/transaction/transactionApi';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
// import { Toggle } from '@/components/ui/toggle'; // Assume exists
// import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'; // Assume exists

export default function Profile() {
  // Stripe hooks
  const stripe = useStripe();
  const elements = useElements();
  // Fetch user data from server
  const { data: user, isLoading, isError } = useGetUserDataQuery();
  const [personal, setPersonal] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [editingPersonal, setEditingPersonal] = useState(false);

  useEffect(() => {
    if (user) {
      setPersonal({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Redux: get theme preference from store
  const dispatch = useAppDispatch();

  // Get user preferences from Redux (if available)
  const userPreferences = useAppSelector((state) => state.auth.user?.preferences);

  // Local state for preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: userPreferences?.emailNotifications ?? true, // default to 'on'
    darkMode: userPreferences?.darkMode ?? false, // default to light
  });

  // Mutation for updating user preferences
  const [updateUserPreferences, { isLoading: isSaving, isSuccess: saveSuccess, isError: saveError }] = useUpdateUserPreferencesMutation();
  // Mutation for updating personal info
  const [updateUserDetails, { isLoading: isSavingPersonal, isSuccess: savePersonalSuccess, isError: savePersonalError }] = useUpdateUserDetailsMutation();

  // On mount, set display mode and notifications from Redux store (or default)
  useEffect(() => {
    setPreferences(p => ({
      ...p,
      darkMode: userPreferences?.darkMode ?? false,
      emailNotifications: userPreferences?.emailNotifications ?? true,
    }));
  }, [userPreferences]);


  // Payment methods
  const { data: paymentMethods = [], refetch: refetchPayments, isLoading: isLoadingPayments } = useGetUserPaymentMethodsQuery(user?.id ?? '', { skip: !user?.id });
  const [deletePaymentMethod, { isLoading: isDeletingPayment }] = useDeleteUserPaymentMethodMutation();

  // Add payment method state and mutation
  const [attachPaymentMethod, { isLoading: isAttaching, isSuccess: attachSuccess, isError: attachError }] = useAttachPaymentMethodMutation();
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [isRefreshingMethod, setIsRefreshingMethod] = useState(false);
  const [addError, setAddError] = useState('');

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  if (isError) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Failed to load user data.</div>;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Personal Information */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>View and update your profile details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  value={personal.firstName}
                  disabled={!editingPersonal}
                  onChange={e => setPersonal(p => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  value={personal.lastName}
                  disabled={!editingPersonal}
                  onChange={e => setPersonal(p => ({ ...p, lastName: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  value={personal.email}
                  disabled={!editingPersonal}
                  onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input
                  value={personal.phone}
                  disabled={!editingPersonal}
                  onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end">
            {editingPersonal ? (
              <>
                <Button size="sm" onClick={() => setEditingPersonal(false)} variant="outline">Cancel</Button>
                <Button
                  size="sm"
                  disabled={isSavingPersonal}
                  onClick={async () => {
                    if (!user?.id) return;
                    await updateUserDetails({
                      userId: user.id,
                      user: {
                        firstName: personal.firstName,
                        lastName: personal.lastName,
                        email: personal.email,
                        phone: personal.phone,
                      },
                    });
                    setEditingPersonal(false);
                  }}
                >
                  {isSavingPersonal ? 'Saving...' : 'Save'}
                </Button>
                
              </>
            ) : (
              <Button size="sm" onClick={() => setEditingPersonal(true)}>Edit</Button>
            )}
            {savePersonalSuccess && <span className="ml-2 text-green-600 text-sm">Saved!</span>}
            {savePersonalError && <span className="ml-2 text-red-600 text-sm">Error saving info.</span>}
          </CardFooter>
        </Card>

        {/* Preferences */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Email Notifications</span>
              {/* <Toggle checked={preferences.notifications} onCheckedChange={v => setPreferences(p => ({ ...p, notifications: v }))} /> */}
              <Button size="sm" variant={preferences.emailNotifications ? 'default' : 'outline'} onClick={() => setPreferences(p => ({ ...p, emailNotifications: !p.emailNotifications }))}>
                {preferences.emailNotifications ? 'On' : 'Off'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Display Mode</span>
              <select
                className="border rounded-md px-3 py-1 text-sm bg-background"
                value={preferences.darkMode ? 'dark' : 'light'}
                onChange={e => {
                  const newDarkMode = e.target.value === 'dark';
                  setPreferences(p => ({ ...p, darkMode: newDarkMode }));
                  dispatch(setTheme(newDarkMode ? 'dark' : 'light'));
                }}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              size="sm"
              disabled={isSaving}
              onClick={async () => {
                if (!user?.id) return;
                await updateUserPreferences({
                  userId: user.id,
                  preferences: {
                    emailNotifications: preferences.emailNotifications,
                    darkMode: preferences.darkMode,
                  },
                });
              }}
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
            {saveSuccess && <span className="ml-2 text-green-600 text-sm">Saved!</span>}
            {saveError && <span className="ml-2 text-red-600 text-sm">Error saving preferences.</span>}
          </CardFooter>
        </Card>

        {/* Payment Details */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Manage your saved payment methods.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add Payment Method UI */}
            <div className="mb-6">
              {showAddPayment ? (
                <form
                  className="flex flex-col gap-2 mb-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setAddError('');
                    if (!stripe || !elements) {
                      setAddError('Stripe not loaded.');
                      return;
                    }
                    if (!user?.id) {
                      setAddError('User not found.');
                      return;
                    }
                    const cardElement = elements.getElement(CardElement);
                    if (!cardElement) {
                      setAddError('Card element not found.');
                      return;
                    }
                    const { error, paymentMethod } = await stripe.createPaymentMethod({
                      type: 'card',
                      card: cardElement,
                    });
                    if (error) {
                      setAddError(error.message || 'Failed to create payment method.');
                      return;
                    }
                    try {
                      await attachPaymentMethod({ userId: user.id, paymentMethodId: paymentMethod.id }).unwrap();
                      setIsRefreshingMethod(true);
                      await refetchPayments();
                      setShowAddPayment(false);
                      setIsRefreshingMethod(false);
                    } catch (err) {
                      setIsRefreshingMethod(false);
                      setAddError('Failed to attach payment method.');
                    }
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Card Details</label>
                    <div className="border border-input rounded-md px-3 py-2 bg-background">
                      <CardElement options={{ style: { base: { fontSize: '16px', color: '#1a202c' } } }} />
                    </div>
                  </div>
                  {addError && <div className="text-red-600 text-sm font-semibold">{addError}</div>}
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isAttaching || isRefreshingMethod}
                    >
                      {isAttaching || isRefreshingMethod ? 'Adding...' : 'Add Payment Method'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddPayment(false);
                        setAddError('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-end">
                    <Button size="sm" onClick={() => setShowAddPayment(true)}>
                    Add Payment Method
                    </Button>
                </div>
              )}
              {attachSuccess && <span className="ml-2 text-green-600 text-sm">Added!</span>}
              {attachError && <span className="ml-2 text-red-600 text-sm">Error adding payment method.</span>}
            </div>
            {/* List Payment Methods */}
            {isLoadingPayments ? (
              <div>Loading payment methods...</div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-muted-foreground flex justify-center">No payment methods found.</div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map(pm => (
                  <div key={pm.paymentMethodId} className="flex flex-col md:flex-row md:items-center md:gap-4 border rounded p-3">
                    <div className="flex-1">
                      <div className="text-lg font-semibold mb-1">{pm.card.brand} ({pm.type})</div>
                      <div className="text-muted-foreground mb-1">**** **** **** {pm.card.last4}</div>
                      <div className="text-muted-foreground text-sm">Expires {pm.card.expMonth}/{pm.card.expYear}</div>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isDeletingPayment}
                        onClick={async () => {
                          if (!user?.id) return;
                          await deletePaymentMethod({ userId: user.id, paymentMethodId: pm.paymentMethodId });
                          refetchPayments();
                        }}
                      >
                        Delete
                      </Button>
                      <Button size="sm" variant="secondary" disabled>
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}
