import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useParams } from 'react-router';
import { useGetRoomTypeByIdQuery } from '@/features/roomType/roomTypeApi';
import AmenityIcon from '@/components/amenity-icon';
import DateRangeCalendar from '@/components/date-range-calendar';
import Loader from '@/components/loader';
import { useGetAvailableRoomsQuery } from '@/features/room/roomApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '@/features/transaction/components/payment-form';
import type { CheckoutData } from '@/types/types';
import { useAppDispatch } from '@/app/hooks';
import { setCheckoutData } from '@/features/reservation/reservationSlice';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function BookReservation() {

  const dispatch = useAppDispatch();

  // get room type data from server
  const { id } = useParams<{ id: string }>(); // room id is in query params
  const { data: roomType, isLoading } = useGetRoomTypeByIdQuery(id!); // api call

  // user input state
  const [userInput, setUserInput] = useState({
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    guests: 1,
  });

  const [showCheckout, setShowCheckout] = useState(false);

  // fetch available rooms once user selects dates
  const {
    data: availableRooms,
  } = useGetAvailableRoomsQuery(
    userInput.checkInDate && userInput.checkOutDate
      ? { id: id!, checkIn: toYMD(userInput.checkInDate), checkOut: toYMD(userInput.checkOutDate) }
      : skipToken
  );

  // handler for Go To Checkout button
  function handleGoToCheckout() {
    setShowCheckout(true)

    let roomId = '';
    if (availableRooms && availableRooms.length > 0) {
      roomId = availableRooms[0].id;
    }

    let totalPrice = roomType ? roomType.pricePerNight * Math.max(1, Math.round(((userInput.checkOutDate!.getTime() - userInput.checkInDate!.getTime()) / (1000 * 60 * 60 * 24)))) : 0;

    let checkoutData: CheckoutData = {
      roomId: roomId,
      roomTypeId: id!,
      checkIn: userInput.checkInDate ? toYMD(userInput.checkInDate) : '',
      checkOut: userInput.checkOutDate ? toYMD(userInput.checkOutDate) : '',
      numGuests: userInput.guests,
      totalPrice: totalPrice
    };

    dispatch(setCheckoutData(checkoutData));
  }

  if (isLoading) return <Loader />;
  return (
    <div className="min-h-screen bg-background">
      <div className="py-12 px-4 md:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Book Your Stay</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Please enter your details below to reserve your room.
          </p>
        </div>
      </div>
      <div className="py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Card className="p-0 space-x-6 border-none shadow-none">
            <CardContent className="p-0 grid grid-cols-2 gap-x-6 rounded-t-lg overflow-hidden">
              <div className="flex flex-col col-span-2 lg:col-span-1">
                <img
                  src={roomType?.images[0]}
                  alt={roomType?.name}
                  className="w-full h-96 object-cover rounded-lg shadow-md"
                />
                <div className="flex flex-col mt-4">
                  <h2 className="text-2xl font-bold mb-2">{roomType?.name}</h2>
                  <p className="text-muted-foreground mb-4">{roomType?.description}</p>
                  <div className="flex items-center mb-4">
                    <span className="text-lg font-semibold mr-4">
                      ${roomType?.pricePerNight} / night
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {roomType?.squareFootage} sq ft • Max {roomType?.maxGuests} guests
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {roomType?.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-2 bg-muted/50 px-3 py-1 rounded-full text-sm"
                      >
                        <AmenityIcon amenity={amenity} />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!showCheckout ? (
                
                <div className="flex flex-col col-span-2 lg:col-span-1 border rounded-2xl p-6 shadow-sm">
                  <div className="space-y-4 px-1">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Date Range</label>
                      <DateRangeCalendar
                        startDate={userInput.checkInDate}
                        endDate={userInput.checkOutDate}
                        onStartDateChange={(date) =>
                          setUserInput((prev) => ({ ...prev, checkInDate: date }))
                        }
                        onEndDateChange={(date) =>
                          setUserInput((prev) => ({ ...prev, checkOutDate: date }))
                        }
                        minDate={new Date()}
                        onChange={({ checkInDate, checkOutDate }) =>
                          setUserInput((prev) => ({ ...prev, checkInDate, checkOutDate }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="guests" className="text-sm font-semibold">
                        Number of Guests
                      </label>
                      <div className="relative">
                        <select
                          id="guests"
                          value={userInput.guests}
                          onChange={(e) =>
                            setUserInput((prev) => ({
                              ...prev,
                              guests: Number(e.target.value),
                            }))
                          }
                          className="w-full px-3 py-2 h-10 border border-input rounded-md bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        >
                          {roomType &&
                            Array.from({ length: roomType.maxGuests }, (_, i) => i + 1).map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? 'Guest' : 'Guests'}
                              </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                      </div>
                    </div>
                    {userInput.checkInDate && userInput.checkOutDate && availableRooms && availableRooms.length === 0 && (
                      <div className="text-red-600 text-sm font-semibold mb-2">No rooms of this type available for the selected date range.</div>
                    )}
                    <Button
                      className="w-full mt-4 cursor-pointer"
                      disabled={!userInput.checkInDate || !userInput.checkOutDate || !availableRooms || availableRooms.length === 0}
                      onClick={handleGoToCheckout}
                    >
                      Checkout
                    </Button>

                  </div>
                </div>

              ) : (

                <div className="flex flex-col col-span-2 lg:col-span-1 border rounded-2xl p-6 shadow-sm">
                  <div className="space-y-4 px-1">
                    <button
                      type="button"
                      className="flex items-center text-primary font-semibold mb-4 hover:underline focus:outline-none cursor-pointer"
                      onClick={() => setShowCheckout(false)}
                    >
                      <ChevronDown style={{ transform: 'rotate(90deg)' }} className="mr-2 h-5 w-5" />
                      Back
                    </button>

                    <div className="mb-4 p-4 bg-muted/30 rounded-lg border space-y-1">
                      <p className="text-lg font-bold">
                        Review Details
                      </p>
                      <div className="text-sm">
                        <span className="">Check in:</span> {userInput.checkInDate ? userInput.checkInDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}
                      </div>
                      <div className="text-sm">
                        <span className="">Check out:</span> {userInput.checkOutDate ? userInput.checkOutDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}
                      </div>
                      <div className="text-sm">
                        <span className="">Guests: {userInput.guests}</span>
                      </div>
                      <div className="mt-4 mb-0 text-sm text-muted-foreground">
                        <span className="">${roomType?.pricePerNight?.toLocaleString()} x {(() => {
                          if (!userInput.checkInDate || !userInput.checkOutDate) return '-';
                          const msPerDay = 1000 * 60 * 60 * 24;
                          const nights = Math.max(1, Math.round((userInput.checkOutDate.getTime() - userInput.checkInDate.getTime()) / msPerDay));
                          return nights;
                        })()} nights =</span>
                      </div>
                      <div className="text-lg font-bold">
                        Total: ${(() => {
                          if (!userInput.checkInDate || !userInput.checkOutDate || !roomType?.pricePerNight) return '-';
                          const msPerDay = 1000 * 60 * 60 * 24;
                          const nights = Math.max(1, Math.round((userInput.checkOutDate.getTime() - userInput.checkInDate.getTime()) / msPerDay));
                          return (roomType.pricePerNight * nights).toLocaleString();
                        })()}
                      </div>
                    </div>

                    <Elements stripe={stripePromise}>
                      <PaymentForm />
                    </Elements>
                  </div>
                </div>
              )}
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}