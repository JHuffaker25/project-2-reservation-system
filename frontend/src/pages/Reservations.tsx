import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useGetReservationsQuery } from '@/features/reservation/reservationApi';
import { useAppDispatch } from '@/app/hooks';
import { setUserReservations } from '@/features/reservation/reservationSlice';
import type { Reservation } from '@/types/types';
import { useGetRoomTypeByIdQuery } from '@/features/roomType/roomTypeApi';
import Loader from '@/components/loader';

// Simple Calendar for date range selection
const DateRangePicker = ({
  initialCheckIn,
  initialCheckOut,
  onConfirm,
}: {
  initialCheckIn: Date;
  initialCheckOut: Date;
  onConfirm: (checkIn: Date, checkOut: Date) => void;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempCheckIn, setTempCheckIn] = useState(initialCheckIn);
  const [tempCheckOut, setTempCheckOut] = useState(initialCheckOut);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isTodayOrLater = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const isDateInRange = (date: Date): boolean => {
    if (!tempCheckIn || !tempCheckOut) return false;
    return date > tempCheckIn && date < tempCheckOut;
  };

  const isStartDate = (date: Date): boolean => {
    return tempCheckIn ? date.toDateString() === tempCheckIn.toDateString() : false;
  };

  const isEndDate = (date: Date): boolean => {
    return tempCheckOut ? date.toDateString() === tempCheckOut.toDateString() : false;
  };

  const handleDateClick = (date: Date) => {
    if (!tempCheckIn) {
      setTempCheckIn(date);
    } else if (!tempCheckOut) {
      if (date > tempCheckIn) {
        setTempCheckOut(date);
      } else {
        setTempCheckIn(date);
      }
    } else {
      setTempCheckIn(date);
      setTempCheckOut(null as any);
    }
  };

  const days: (Date | null)[] = [];
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
          }
          className="p-2 hover:bg-muted rounded-md transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-semibold text-lg">{monthYear}</p>
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
          }
          className="p-2 hover:bg-muted rounded-md transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-3">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const isDisabled = !day || !isTodayOrLater(day);
          const isInRange = day && isDateInRange(day);
          const isStart = day && isStartDate(day);
          const isEnd = day && isEndDate(day);

          return (
            <button
              key={idx}
              onClick={() => day && !isDisabled && handleDateClick(day)}
              disabled={isDisabled}
              className={`py-2 px-1 text-sm rounded-md cursor-pointer transition-all ${
                isDisabled
                  ? 'text-muted-foreground opacity-50 cursor-not-allowed'
                  : isStart || isEnd
                    ? 'bg-primary text-white font-semibold hover:bg-primary/90'
                    : isInRange
                      ? 'bg-primary/20 text-foreground hover:bg-primary/30'
                      : 'hover:bg-muted text-foreground'
              }`}
            >
              {day?.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t space-y-2">
        <div className="text-sm">
          <span className="text-muted-foreground">Check-in: </span>
          <span className="font-semibold">{tempCheckIn.toLocaleDateString()}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Check-out: </span>
          <span className="font-semibold">
            {tempCheckOut ? tempCheckOut.toLocaleDateString() : 'Not selected'}
          </span>
        </div>
        {tempCheckIn && tempCheckOut && (
          <div className="text-sm pt-2 border-t">
            <span className="text-muted-foreground">Duration: </span>
            <span className="font-semibold">
              {Math.ceil((tempCheckOut.getTime() - tempCheckIn.getTime()) / (1000 * 60 * 60 * 24))} nights
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          onClick={() => onConfirm(tempCheckIn, tempCheckOut)}
          disabled={!tempCheckIn || !tempCheckOut}
          className="flex-1 cursor-pointer"
        >
          Confirm Dates
        </Button>
      </div>
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({
  title,
  description,
  confirmText,
  cancelText,
  isDangerous,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-start gap-3">
            {isDangerous ? (
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-1" />
            ) : (
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-1" />
            )}
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{description}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onCancel} className="cursor-pointer">
              {cancelText}
            </Button>
            <Button
              variant={isDangerous ? 'destructive' : 'default'}
              onClick={onConfirm}
              className="cursor-pointer"
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Reservation Card Component
const ReservationCard = ({
  reservation,
  onCancel,
  onModify,
}: {
  reservation: Reservation;
  onCancel: (id: string) => void;
  onModify: (id: string) => void;
}) => {
  const checkInDate = new Date(reservation.checkIn);
  const checkOutDate = new Date(reservation.checkOut);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const today = new Date();
  const isUpcoming = checkInDate > today;

  // const { data: roomType, isLoading } = useGetRoomTypeByIdQuery(reservation.room);
  const roomType = {
    id: 'roomType1',
    name: 'Deluxe Suite',
    pricePerNight: 150,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVsdXhlJTIwc3VpdGV8ZW58MHx8MHx8fDA%3D&w=1000&q=80',
    ],
  };

  return (
    <Card className="overflow-hidden pt-0">
      {/* Image Section */}
      <div className="relative h-54 bg-gray-200 overflow-hidden">
        <img
          src={roomType?.images[0]}
          alt={roomType?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-muted text-primary px-3 py-1 rounded-full text-xs font-semibold">
          {reservation.status === 'completed' ? 'Completed' : 'Upcoming'}
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="pt-6 space-y-4">
        {/* Hotel and Room Info */}
        <div>
          {/* <p className="text-sm text-muted-foreground">{reservation.hotelName}</p> */}
          <h3 className="text-lg font-semibold">{roomType?.name}</h3>
          {/* <p className="text-sm text-muted-foreground">{reservation.confirmationNumber}</p> */}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Check-in</p>
            <p className="font-semibold">{checkInDate.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Check-out</p>
            <p className="font-semibold">{checkOutDate.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Duration</p>
            <p className="font-semibold">{nights} nights</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Guests</p>
            <p className="font-semibold">{reservation.numGuests}</p>
          </div>
        </div>

        {/* Price Section */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              ${roomType?.pricePerNight} × {nights} nights
            </span>
            <span className="font-semibold">${(roomType?.pricePerNight ?? 0) * nights}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span className="text-primary">${reservation.totalPrice}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {isUpcoming && (
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              // onClick={() => onModify(reservation.id)}
              className="flex-1 gap-2 cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
              Modify
            </Button>
            <Button
              variant="destructive"
              size="sm"
              // onClick={() => onCancel(reservation.id)}
              className="flex-1 gap-2 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Modify Reservation Dialog
// const ModifyReservationDialog = ({
//   reservation,
//   onClose,
//   onConfirm,
// }: {
//   reservation: (typeof initialReservations)[0];
//   onClose: () => void;
//   onConfirm: (checkInDate: Date, checkOutDate: Date, roomType: string) => void;
// }) => {
//   const [roomType, setRoomType] = useState(reservation.roomType);
//   const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Family', 'Ocean View', 'Penthouse'];

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0">
//           <div>
//             <CardTitle>Modify Reservation</CardTitle>
//             <CardDescription>{reservation.confirmationNumber}</CardDescription>
//           </div>
//           <Button variant="ghost" size="sm" onClick={onClose}>
//             <X className="h-4 w-4" />
//           </Button>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           {/* Date Selection */}
//           <div>
//             <h3 className="text-sm font-semibold mb-4">Update Check-in and Check-out Dates</h3>
//             <DateRangePicker
//               initialCheckIn={new Date(reservation.checkInDate)}
//               initialCheckOut={new Date(reservation.checkOutDate)}
//               onConfirm={(checkIn, checkOut) => {
//                 onConfirm(checkIn, checkOut, roomType);
//               }}
//             />
//           </div>

//           {/* Room Type Selection */}
//           <div className="border-t pt-6">
//             <h3 className="text-sm font-semibold mb-4">Change Room Type</h3>
//             <div className="relative">
//               <select
//                 value={roomType}
//                 onChange={(e) => setRoomType(e.target.value)}
//                 className="w-full px-4 py-3 border border-input rounded-md bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
//               >
//                 {roomTypes.map((type) => (
//                   <option key={type} value={type}>
//                     {type}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
//             </div>
//           </div>

//           {/* Close Button */}
//           <div className="flex gap-2 justify-end pt-4 border-t">
//             <Button variant="outline" onClick={onClose} className="cursor-pointer">
//               Cancel
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// Main Reservations Page
export default function Reservations() {

  const { data: reservations, isLoading } = useGetReservationsQuery();
    const dispatch = useAppDispatch();
  
    useEffect(() => {
      if (reservations) {
        dispatch(setUserReservations(reservations));
      }
    }, [reservations]);

  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);
  const [modifyDialogId, setModifyDialogId] = useState<string | null>(null);

  const today = new Date();
  const upcomingReservations = reservations?.filter(
    (r) => new Date(r.checkIn) > today
  );
  const pastReservations = reservations?.filter(
    (r) => new Date(r.checkIn) <= today
  );

  const handleCancelReservation = (id: string) => {
    // setReservations((prev) =>
    //   prev.filter((r) => r.id !== id)
    // );
    // setCancelDialogId(null);
  };

  const handleModifyReservation = (id: string, checkIn: string, checkOut: string, roomType: string) => {
    // setReservations((prev) =>
    //   prev.map((r) =>
    //     r.id === id
    //       ? {
    //           ...r,
    //           checkInDate: checkIn,
    //           checkOutDate: checkOut,
    //           roomType: roomType,
    //         }
    //       : r
    //   )
    // );
    // setModifyDialogId(null);
  };

  if (isLoading) return <Loader />;
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="py-12 px-4 md:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">My Reservations</h1>
          <p className="text-lg text-muted-foreground">
            Manage your hotel reservations, view booking details, and make changes when needed.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Upcoming Reservations */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <h2 className="text-2xl font-bold">Upcoming Reservations</h2>
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

          {/* Past Reservations */}
          {(pastReservations ?? []).length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                <h2 className="text-2xl font-bold">Past Reservations</h2>
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

      {/* Cancel Confirmation Dialog */}
      {/* {cancelDialogId !== null && (
        <ConfirmationDialog
          title="Cancel Reservation?"
          description={`Are you sure you want to cancel reservation ${
            reservations?.find((r) => r.id === cancelDialogId)?.confirmationNumber
          }? This action cannot be undone.`}
          confirmText="Yes, Cancel Reservation"
          cancelText="Keep Reservation"
          isDangerous={true}
          onConfirm={() => handleCancelReservation(cancelDialogId)}
          onCancel={() => setCancelDialogId(null)}
        />
      )} */}

      {/* Modify Reservation Dialog */}
      {/* {modifyDialogId !== null && (
        <ModifyReservationDialog
          reservation={reservations?.find((r) => r.id === modifyDialogId)!}
          onClose={() => setModifyDialogId(null)}
          onConfirm={(checkIn, checkOut, roomType) =>
            handleModifyReservation(modifyDialogId, checkIn, checkOut, roomType)
          }
        />
      )} */}
    </div>
  );
}
