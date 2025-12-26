import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import DateRangeCalendar from '@/components/date-range-calendar';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  ChevronDown,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import { useCancelReservationMutation, useGetUserReservationsQuery, useUpdateReservationMutation, useGetReservationTransactionQuery } from '@/features/reservation/reservationApi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setUserReservations } from '@/features/reservation/reservationSlice';
import type { Reservation } from '@/types/types';
import { useGetRoomTypeByReservationIdQuery } from '@/features/roomType/roomTypeApi';
import Loader from '@/components/loader';
import type { RoomType } from '@/types/types';
import type { UpdateReservationRequest } from '@/types/types';


// Reservation Card Component
const ReservationCard = ({
  reservation,
  isPreloading,
  onCancel,
  onModify,
}: {
  reservation: Reservation;
  isPreloading?: boolean;
  onCancel: (id: string) => void;
  onModify: (id: string) => void;
}) => {
  const [showReceipt, setShowReceipt] = useState(false);
  // Format date as YYYY-MM-DD from ISO string (UTC, no timezone shift)
  function formatDateUTC(dateString: string) {
    if (!dateString) return '';
    return dateString.slice(0, 10);
  }
  const checkInDateStr = formatDateUTC(reservation.checkIn);
  const checkOutDateStr = formatDateUTC(reservation.checkOut);
  const checkInDate = new Date(reservation.checkIn);
  const checkOutDate = new Date(reservation.checkOut);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const today = new Date();
  const isUpcoming = checkInDate > today;

  const { data: roomType, isLoading } = useGetRoomTypeByReservationIdQuery(reservation.id ?? '');
  // Fetch transaction data for this reservation
  const { data: transaction, isLoading: isTransactionLoading } = useGetReservationTransactionQuery(reservation.id ?? '');
  
  if (isLoading || isPreloading || isTransactionLoading) return <Loader />;
  return (
    <>
      <Card className="overflow-hidden pt-0">
        <div className="relative h-54 bg-gray-200 overflow-hidden">
          <img
            src={roomType?.images[0]}
            alt={roomType?.name}
            className="w-full h-full object-cover"
          />
        </div>

        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Reservation for:</p>
            <h3 className="text-lg font-semibold">{roomType?.name} Room</h3>
            <p className="text-sm text-muted-foreground">ID: {reservation.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Check-in <span className=" font-medium text-sm">(3:00 PM)</span></p>
              <p className="font-semibold">{checkInDateStr}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Check-out <span className=" font-medium text-sm">(12:00 PM)</span></p>
              <p className="font-semibold">{checkOutDateStr}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Duration</p>
              <p className="font-semibold">{nights} Night{nights > 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Guests</p>
              <p className="font-semibold">{reservation.numGuests}</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-lg font-bold pt-2">
              <span>Total</span>
              <span className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowReceipt(true)}
                  className="cursor-pointer text-muted-foreground hover:text-primary"
                  title="View Receipt"
                >
                  <Receipt className="h-5 w-5" />
                </Button>
                <span className="text-primary">${reservation.totalPrice}</span>
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            {isUpcoming && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onModify(reservation?.id || '')}
                  className="flex-1 gap-2 cursor-pointer"
                >
                  <Edit2 className="h-4 w-4" />
                  Modify
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onCancel(reservation?.id || '')}
                  className="flex-1 gap-2 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="flex flex-col items-center bg-transparent shadow-none border-none text-force-dark">
          <div className="bg-white w-full max-w-xs shadow-lg border border-dashed border-gray-300 px-6 py-6 font-mono relative overflow-hidden receipt-paper">
            <div className="absolute left-0 right-0 top-0 flex justify-between -mt-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-white rounded-full border border-gray-300" />
              ))}
            </div>
            <div className="absolute left-0 right-0 bottom-0 flex justify-between -mb-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-white rounded-full border border-gray-300" />
              ))}
            </div>
            <div className="text-center mb-2">
              <span className="block text-lg font-bold tracking-widest mb-1">HOTEL RECEIPT</span>
              
            </div>
            <div className="border-b border-dashed border-gray-300 mb-2" />
            <div className="flex justify-between mb-1">
              <span>Room Type</span>
              <span>{roomType?.name || 'Deluxe Suite'}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Check-in</span>
              <span>{checkInDateStr}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Check-out</span>
              <span>{checkOutDateStr}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Guests</span>
              <span>{reservation.numGuests}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Nights</span>
              <span>{nights}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Price/Night</span>
              <span>${roomType?.pricePerNight ?? 120}.00</span>
            </div>
            <div className="border-b border-dashed border-gray-300 my-2" />
            <div className="flex justify-between font-bold text-base mb-1">
              <span>Total Paid</span>
              <span>
                ${reservation.totalPrice}.00
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Payment</span>
              <span>
                {transaction?.paymentIntentId
                  ? `Card •••• ${transaction?.last4 ?? 'XXXX'}`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Date Paid</span>
              <span>
                {transaction?.capturedAt
                  ? new Date(transaction.capturedAt).toLocaleDateString()
                  : checkInDateStr}
              </span>
            </div>
            
            <div className="border-b border-dashed border-gray-300 my-2" />
            <div className="flex flex-col gap-1 mb-1">
                <div className="flex items-center justify-between gap-2 text-[10px] text-gray-400">
                  <span className="font-mono text-gray-400">Reservation ID:</span>
                  <span className="font-mono py-0.5 rounded">{reservation.id}</span>
                </div>
                {transaction?.id && (
                  <div className="flex items-center justify-between gap-2 text-[10px] text-gray-400">
                    <span className="font-mono text-gray-400">Transaction ID:</span>
                    <span className="font-monopx-2 py-0.5 rounded">{transaction.id}</span>
                  </div>
                )}
              </div>
              <div className="border-b border-dashed border-gray-300 my-2" />
            <div className="text-center text-xs text-gray-400 mt-2">Thank you for your stay!</div>
            <div className="flex justify-center mt-3">
              <Button onClick={() => setShowReceipt(false)} type="button" className="cursor-pointer">Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Modify Reservation Dialog
const ModifyReservationDialog = ({
  reservation,
  onClose,
  onConfirm,
}: {
  reservation: Reservation;
  onClose: () => void;
  onConfirm: (modifyData: { id: string; checkInDate: Date; checkOutDate: Date; roomType: RoomType | null; guests: number }) => void;
}) => {

  const { data: roomType } = useGetRoomTypeByReservationIdQuery(reservation.id ?? '');

  const [modifyData, setModifyData] = useState<UpdateReservationRequest>({
    id: reservation?.id || '',
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    numGuests: reservation.numGuests || 1,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl">Modify Reservation</CardTitle>
            <CardDescription>{reservation.id}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-4">Update Check-in and Check-out Dates</h3>

            <DateRangeCalendar
              startDate={ new Date(modifyData.checkIn)}
              endDate={new Date(modifyData.checkOut)}
              onStartDateChange={(date) => setModifyData((prev) => ({ ...prev, checkIn: date ? date.toISOString() : '' }))}
              onEndDateChange={(date) => setModifyData((prev) => ({ ...prev, checkOut: date ? date.toISOString() : '' }))}
              minDate={new Date()}
              onChange={({ checkInDate, checkOutDate }) => {
                setModifyData((prev) => ({ ...prev, checkInDate }));
                setModifyData((prev) => ({ ...prev, checkOutDate }));
              }}
            />
            <div className="mt-4 pt-6 border-t space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Check-in: </span>
                <span className="font-semibold">{modifyData.checkIn ? new Date(modifyData.checkIn).toLocaleDateString() : 'Not selected'}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Check-out: </span>
                <span className="font-semibold">{modifyData.checkOut ? new Date(modifyData.checkOut).toLocaleDateString() : 'Not selected'}</span>
              </div>
            </div>
          </div>


          <div className="border-t pt-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-4">Change Number of Guests</h3>
              <div className="relative">
                <select
                  value={modifyData.numGuests}
                  onChange={(e) => setModifyData((prev) => ({ ...prev, numGuests: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-input rounded-md bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  {(() => {
                    const maxGuests = roomType?.maxGuests || 6;
                    return Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ));
                  })()}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              </div>
            </div>
          </div>


          <div className="flex gap-2 justify-end pt-4 border-t items-center">
            {/* Total Price Calculation */}
            <div className="flex-1 text-left">
              <span className="text-muted-foreground text-sm mr-2">Total:</span>
              <span className="text-lg font-bold text-primary">
                {(() => {
                  if (!modifyData.checkIn || !modifyData.checkOut || roomType?.pricePerNight == null) return '-';
                  const msPerDay = 1000 * 60 * 60 * 24;
                  const nights = Math.max(1, Math.round((new Date(modifyData.checkOut).getTime() - new Date(modifyData.checkIn).getTime()) / msPerDay));
                  return `$${(roomType.pricePerNight * nights).toLocaleString()}`;
                })()}
              </span>
            </div>
            <Button variant="outline" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (modifyData.checkIn && modifyData.checkOut) {
                  onConfirm({
                    id: modifyData.id,
                    checkInDate: new Date(modifyData.checkIn),
                    checkOutDate: new Date(modifyData.checkOut),
                    roomType: roomType ?? null,
                    guests: modifyData.numGuests,
                  });
                }
              }}
              disabled={!modifyData.checkIn || !modifyData.checkOut}
              className="cursor-pointer"
            >
              Submit Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Reservations() {

  const userId = useAppSelector((state) => state.auth.user?.id);

  const {
    data: reservations,
    isLoading,
    refetch: refetchReservations
  } = useGetUserReservationsQuery(userId ?? '', { refetchOnMountOrArgChange: true });
    const dispatch = useAppDispatch();
  
    useEffect(() => {
      if (reservations) {
        dispatch(setUserReservations(reservations));
      }
    }, [reservations]);

  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);
  const [modifyDialogId, setModifyDialogId] = useState<string | null>(null);

  // Normalize dates to ignore time for accurate comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sortByCheckIn = (arr: Reservation[] = []) =>
    arr.slice().sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());

  const filteredReservations = reservations?.filter(r => r.status !== 'CANCELLED') ?? [];

  const ongoingReservations = sortByCheckIn(
    filteredReservations.filter((r) => {
      const checkIn = new Date(r.checkIn);
      const checkOut = new Date(r.checkOut);
      checkIn.setHours(15, 0, 0, 0);
      checkOut.setHours(12, 0, 0, 0);
      return checkIn <= today && today < checkOut;
    })
  );
  const upcomingReservations = sortByCheckIn(
    filteredReservations.filter((r) => {
      const checkIn = new Date(r.checkIn);
      checkIn.setHours(15, 0, 0, 0);
      return checkIn > today;
    })
  );
  const pastReservations = sortByCheckIn(
    filteredReservations.filter((r) => {
      const checkOut = new Date(r.checkOut);
      checkOut.setHours(12, 0, 0, 0);
      return checkOut <= today;
    })
  );

  const [cancelReservation, { isLoading: isCancelling }] = useCancelReservationMutation();

  const handleCancelReservation = async (id: string) => {
    if (isCancelling) {
      return <Loader />;
    }
    try {
      await cancelReservation(id).unwrap();
      // Re-fetch reservations after cancellation
      const refreshed = await refetchReservations();
      if (refreshed.data) {
        dispatch(setUserReservations(refreshed.data));
      }
      setCancelDialogId(null);
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
    }
  };

  const [updateReservation, { isLoading: isUpdating }] = useUpdateReservationMutation();

  const handleModifyReservation = async (modifyData: UpdateReservationRequest) => {
    if (isUpdating) {
      return <Loader />;
    }
    try {
      await updateReservation(modifyData).unwrap();
      // Re-fetch reservations after update
      const refreshed = await refetchReservations();
      if (refreshed.data) {
        dispatch(setUserReservations(refreshed.data));
      }
      setModifyDialogId(null);
    } catch (error) {
      console.error('Failed to update reservation:', error);
    }
  };


  if (isCancelling) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="py-12 px-4 md:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">My Reservations</h1>
          <p className="text-lg text-muted-foreground">
            Manage your hotel reservations, view booking details, and make changes when needed.
          </p>
        </div>
      </div>

      <div className="py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {ongoingReservations.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-1 rounded-full bg-yellow-500" />
                <h2 className="text-2xl font-bold">Ongoing Reservations:</h2>
                <span className="ml-auto text-sm text-muted-foreground">
                  {ongoingReservations.length} reservation{ongoingReservations.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onCancel={() => {}}
                    onModify={() => {}}
                    isPreloading={isLoading}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <h2 className="text-2xl font-bold">Upcoming Reservations:</h2>
              <span className="ml-auto text-sm text-muted-foreground">
                {upcomingReservations?.length} reservation{upcomingReservations?.length !== 1 ? 's' : ''}
              </span>
            </div>

            {(upcomingReservations ?? []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(upcomingReservations ?? []).map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onCancel={(id) => setCancelDialogId(id)}
                    onModify={(id) => setModifyDialogId(id)}
                    isPreloading={isLoading}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold mb-2">No Upcoming Reservations</p>
                  <p className="text-muted-foreground text-center">
                    You don't have any upcoming reservations. Book a room to get started!
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {(pastReservations ?? []).length > 0 && (
            <section>
              <div className="border-t my-16"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                <h2 className="text-2xl font-bold">Past Reservations:</h2>
                <span className="ml-auto text-sm text-muted-foreground">
                  {(pastReservations ?? []).length} reservation{(pastReservations ?? []).length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(pastReservations ?? []).map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onCancel={() => {}}
                    onModify={() => {}}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <Dialog open={cancelDialogId !== null} onOpenChange={(open) => !open && setCancelDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              Cancel Reservation?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your reservation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setCancelDialogId(null)} className="cursor-pointer">
              Keep Reservation
            </Button>
            <Button variant="destructive" onClick={() => handleCancelReservation(cancelDialogId!)} className="cursor-pointer">
              Yes, Cancel Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {modifyDialogId !== null && reservations && (
        <ModifyReservationDialog
          reservation={reservations.find((r) => r.id === modifyDialogId)!}
          onClose={() => setModifyDialogId(null)}
          onConfirm={(modifyData) =>
            handleModifyReservation({
              id: modifyData.id,
              checkIn: modifyData.checkInDate.toISOString(),
              checkOut: modifyData.checkOutDate.toISOString(),
              numGuests: modifyData.guests,
            })
          }
        />
      )}
    </div>
  );
}
