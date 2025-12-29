import React, { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Calendar, X, Search, ChevronDown, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGetAllRoomsQuery } from '@/features/room/roomApi';
import { useGetRoomTypeByReservationIdQuery } from '@/features/roomType/roomTypeApi';
import DateRangeCalendar from '@/components/date-range-calendar';
import {
  useGetReservationsQuery,
  useCheckInReservationMutation,
  useCheckOutReservationMutation,
  useCancelReservationMutation,
  useUpdateReservationMutation
} from '@/features/reservation/reservationApi';
import Loader from '@/components/loader';

const statuses = ['All statuses', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const CalendarDateRangePicker = ({ startDate, endDate, onChange }: {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
}) => {
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);

  // Calendar logic
  const [currentMonth, setCurrentMonth] = useState(tempStartDate || new Date());
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const isDateInRange = (date: Date): boolean => {
    if (!tempStartDate || !tempEndDate) return false;
    return date > tempStartDate && date < tempEndDate;
  };
  const isStartDate = (date: Date): boolean => tempStartDate ? date.toDateString() === tempStartDate.toDateString() : false;
  const isEndDate = (date: Date): boolean => tempEndDate ? date.toDateString() === tempEndDate.toDateString() : false;
  const isTodayOrLater = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };
  const handleDateClick = (date: Date) => {
    if (!tempStartDate) {
      setTempStartDate(date);
    } else if (!tempEndDate) {
      if (date > tempStartDate) {
        setTempEndDate(date);
      } else {
        setTempStartDate(date);
        setTempEndDate(null);
      }
    } else {
      setTempStartDate(date);
      setTempEndDate(null);
    }
  };
  const days: (Date | null)[] = [];
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 w-full cursor-pointer">
          <Calendar className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {tempStartDate && tempEndDate
              ? `${tempStartDate.toLocaleDateString()} - ${tempEndDate.toLocaleDateString()}`
              : tempStartDate
                ? `From ${tempStartDate.toLocaleDateString()}`
                : 'Select Date Range'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between mb-6">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-muted rounded-md transition-colors cursor-pointer">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="font-semibold text-lg">{monthYear}</p>
              <button onClick={handleNextMonth} className="p-2 hover:bg-muted rounded-md transition-colors cursor-pointer">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">{day}</div>
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
                    className={`py-2 px-1 text-sm rounded-md transition-all cursor-pointer ${
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
            {(tempStartDate || tempEndDate) && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Check-in: </span>
                  <span className="font-semibold">{tempStartDate ? tempStartDate.toLocaleDateString() : 'Not selected'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Check-out: </span>
                  <span className="font-semibold">{tempEndDate ? tempEndDate.toLocaleDateString() : 'Not selected'}</span>
                </div>
                {tempStartDate && tempEndDate && (
                  <div className="text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-semibold">{Math.ceil((tempEndDate.getTime() - tempStartDate.getTime()) / (1000 * 60 * 60 * 24))} nights</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {(tempStartDate || tempEndDate) && (
          <div className="border-t p-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTempStartDate(null);
                setTempEndDate(null);
                onChange(null, null); // Also clear in parent
              }}
              className="flex-1 cursor-pointer"
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
            <Button size="sm" onClick={() => onChange(tempStartDate, tempEndDate)} className="flex-1 cursor-pointer">
              Apply
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

// FilterPanel component
const FilterPanel = ({
  search,
  onSearch,
  filters,
  onFilterChange,
}: {
  search: string;
  onSearch: (val: string) => void;
  filters: {
    dateStart: Date | null;
    dateEnd: Date | null;
    status: string;
  };
  onFilterChange: (filters: any) => void;
}) => (
  <Card>
    <CardHeader>
        <CardTitle>Filters & Search</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

        {/* Search Bar */}
        <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
            type="text"
            placeholder="Search by guest, room #, or dates."
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={e => onSearch(e.target.value)}
            />
        </div>
        {/* Status Filter */}
        <div className="relative">
            <select
            value={filters.status}
            onChange={e => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
            {statuses.map(status => (
              <option key={status} value={status === 'All statuses' ? '' : status}>{status}</option>
            ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        </div>
        {/* Date Range */}
        <div className="">
          <CalendarDateRangePicker
            startDate={filters.dateStart}
            endDate={filters.dateEnd}
            onChange={(start, end) => onFilterChange({ ...filters, dateStart: start, dateEnd: end })}
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Reservation status badge
const StatusBadge = ({ status }: { status: string }) => {
  // Map status to color classes
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    ONGOING: 'bg-blue-100 text-blue-800',
    UPCOMING: 'bg-yellow-100 text-yellow-800',
  };
  const colorClass = statusColors[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>{status}</span>;
};

// Main ManageReservations page
const PAGE_SIZE = 10;
type SortKey = 'checkIn' | 'guestName' | 'status' | 'roomNumber' | 'totalPrice' | 'checkOut';
// const sortOptions = [
//   { label: 'Check-in Date', value: 'checkIn' },
//   { label: 'Guest Name', value: 'guestName' },
//   { label: 'Status', value: 'status' },
// ] as const;


const ManageReservations: React.FC = () => {
  const { data: reservations = [], isLoading, error, refetch } = useGetReservationsQuery();
  const [checkInReservation, { isLoading: isCheckingIn }] = useCheckInReservationMutation();
  const [checkOutReservation, { isLoading: isCheckingOut }] = useCheckOutReservationMutation();
  const [cancelReservation, { isLoading: isCancelling }] = useCancelReservationMutation();
    // Handlers for actions
    const handleCheckIn = async (id: string) => {
      try {
        await checkInReservation(id).unwrap();
        refetch();
      } catch (e) {
        // Optionally show error
      }
    };
    const handleCheckOut = async (id: string) => {
      try {
        await checkOutReservation(id).unwrap();
        refetch();
      } catch (e) {
        // Optionally show error
      }
    };
    const handleCancel = async (id: string) => {
      try {
        await cancelReservation(id).unwrap();
        refetch();
      } catch (e) {
        // Optionally show error
      }
    };
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    dateStart: null as Date | null,
    dateEnd: null as Date | null,
    roomType: '',
    status: '',
  });
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'checkIn', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editReservation, setEditReservation] = useState<any | null>(null);

  // Filtering and searching (updated for API model)
  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const searchLower = search.toLowerCase();
      // Search by guest name, room number, check-in, or check-out
      if (searchLower) {
        const guestName = `${r.firstName ?? ''} ${r.lastName ?? ''}`.toLowerCase();
        const roomNumber = (r.roomNumber ?? '').toString().toLowerCase();
        const checkIn = r.checkIn ? new Date(r.checkIn).toLocaleDateString().toLowerCase() : '';
        const checkOut = r.checkOut ? new Date(r.checkOut).toLocaleDateString().toLowerCase() : '';
        if (
          !guestName.includes(searchLower) &&
          !roomNumber.includes(searchLower) &&
          !checkIn.includes(searchLower) &&
          !checkOut.includes(searchLower)
        ) {
          return false;
        }
      }
      // Date range
      if (
        (filters.dateStart && new Date(r.checkIn) < filters.dateStart) ||
        (filters.dateEnd && new Date(r.checkOut) > filters.dateEnd)
      ) {
        return false;
      }
      // Room type (not available in model, skip or add if available)
      // Status
      if (filters.status && r.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [reservations, search, filters]);

  // Sorting (updated for API model)
  const sortedReservations = useMemo(() => {
    return [...filteredReservations].sort((a, b) => {
      let valA: string | number | Date = (() => {
        switch (sort.key) {
          case 'checkIn': return a.checkIn ? new Date(a.checkIn) : new Date(0);
          case 'checkOut': return a.checkOut ? new Date(a.checkOut) : new Date(0);
          case 'guestName': return `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim().toLowerCase();
          case 'status': return a.status ?? '';
          case 'roomNumber': return a.roomNumber ?? '';
          case 'totalPrice': return typeof a.totalPrice === 'number' ? a.totalPrice : Number(a.totalPrice ?? 0);
          default: return '';
        }
      })();
      let valB: string | number | Date = (() => {
        switch (sort.key) {
          case 'checkIn': return b.checkIn ? new Date(b.checkIn) : new Date(0);
          case 'checkOut': return b.checkOut ? new Date(b.checkOut) : new Date(0);
          case 'guestName': return `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim().toLowerCase();
          case 'status': return b.status ?? '';
          case 'roomNumber': return b.roomNumber ?? '';
          case 'totalPrice': return typeof b.totalPrice === 'number' ? b.totalPrice : Number(b.totalPrice ?? 0);
          default: return '';
        }
      })();
      if (valA instanceof Date && valB instanceof Date) {
        return sort.direction === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sort.direction === 'asc' ? valA - valB : valB - valA;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sort.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [filteredReservations, sort]);
  // Chevron for sort direction
  const getChevron = (key: SortKey) => {
    if (sort.key !== key) return <ChevronDown className="inline h-4 w-4 text-muted-foreground opacity-50" />;
    return sort.direction === 'asc' ? <ChevronDown className="inline h-4 w-4 text-muted-foreground rotate-180" /> : <ChevronDown className="inline h-4 w-4 text-muted-foreground" />;
  };

  // Handle sort change
  const handleSort = (key: SortKey) => {
    setSort(prev => prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' });
    setPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(sortedReservations.length / PAGE_SIZE);
  const paginatedReservations = sortedReservations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary counts (optional, can update if needed)

  // Actions (edit/save/cancel/complete would require API mutation endpoints)
  const handleEdit = (reservation: any) => {
    setEditReservation(reservation);
    setEditModalOpen(true);
  };

  // Attractive, consistent Edit Modal UI
  const EditReservationModal = ({ open, reservation, onClose }: { open: boolean, reservation: any, onClose: () => void }) => {
    const { data: rooms = [] } = useGetAllRoomsQuery();
    // Fetch room type by reservation id for price calculation
    const { data: roomTypeByReservation } = useGetRoomTypeByReservationIdQuery(reservation?.id, { skip: !reservation?.id });
    const [form, setForm] = useState(() => reservation ? {
      firstName: reservation.firstName || '',
      lastName: reservation.lastName || '',
      roomNumber: reservation.roomNumber || '',
      checkIn: reservation.checkIn ? new Date(reservation.checkIn) : null,
      checkOut: reservation.checkOut ? new Date(reservation.checkOut) : null,
      totalPrice: reservation.totalPrice || 0,
      numGuests: reservation.numGuests || 1,
    } : null);

    const [updateReservation, { isLoading: isSaving }] = useUpdateReservationMutation();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    React.useEffect(() => {
      if (reservation) {
        setForm({
          firstName: reservation.firstName || '',
          lastName: reservation.lastName || '',
          roomNumber: reservation.roomNumber || '',
          checkIn: reservation.checkIn ? new Date(reservation.checkIn) : null,
          checkOut: reservation.checkOut ? new Date(reservation.checkOut) : null,
          totalPrice: reservation.totalPrice || 0,
          numGuests: reservation.numGuests || 1,
        });
      }
    }, [reservation]);

    // Use price from roomTypeByReservation (API fetch by reservation id)
    const pricePerNight = roomTypeByReservation?.pricePerNight || 0;
    const nights = form?.checkIn && form?.checkOut ? Math.max(1, Math.ceil((form.checkOut.getTime() - form.checkIn.getTime()) / (1000 * 60 * 60 * 24))) : 1;
    const dynamicTotal = pricePerNight * nights;

    React.useEffect(() => {
      if (form && form.checkIn && form.checkOut && pricePerNight) {
        setForm(f => f ? { ...f, totalPrice: dynamicTotal } : f);
      }
      // eslint-disable-next-line
    }, [form?.checkIn, form?.checkOut, pricePerNight]);

    const handleSave = async () => {
      setErrorMsg(null);
      if (!form || !form.checkIn || !form.checkOut || !form.roomNumber) return;
      try {
        await updateReservation({
          id: reservation.id,
          checkIn: form.checkIn.toISOString(),
          checkOut: form.checkOut.toISOString(),
          numGuests: form.numGuests,
          totalPrice: dynamicTotal,
          roomNumber: form.roomNumber,
        }).unwrap();
        onClose();
        if (typeof refetch === 'function') refetch();
      } catch (e: any) {
        setErrorMsg(e?.data?.message || 'Failed to update reservation.');
      }
    };

    if (!open || !form) return null;
    return (
      <Dialog open={open} onOpenChange={val => { if (!val) onClose(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
          </DialogHeader>
          <Card className="shadow-none border-none">
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">Guest First Name</label>
                  <Input
                    value={form.firstName}
                    onChange={e => setForm(f => f ? { ...f, firstName: e.target.value } : f)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Guest Last Name</label>
                  <Input
                    value={form.lastName}
                    onChange={e => setForm(f => f ? { ...f, lastName: e.target.value } : f)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Guests</label>
                  <Input
                    type="number"
                    min={1}
                    value={form.numGuests}
                    onChange={e => setForm(f => f ? { ...f, numGuests: Number(e.target.value) } : f)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">Room Number</label>
                  <select
                    className="w-full px-3 py-2 h-10 border border-input rounded-md bg-background text-foreground text-sm"
                    value={form.roomNumber}
                    onChange={e => setForm(f => f ? { ...f, roomNumber: e.target.value } : f)}
                  >
                    <option value="">Select a room</option>
                    {rooms.map((room: any) => (
                      <option key={room.id} value={room.roomNumber}>{room.roomNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">Date Range</label>
                  <DateRangeCalendar
                    startDate={form.checkIn}
                    endDate={form.checkOut}
                    onStartDateChange={date => setForm(f => f ? { ...f, checkIn: date } : f)}
                    onEndDateChange={date => setForm(f => f ? { ...f, checkOut: date } : f)}
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-between mt-2">
                  <span className="font-semibold text-base">Total Price:</span>
                  <span className="text-lg font-bold">${dynamicTotal.toLocaleString()}</span>
                </div>
                {errorMsg && <div className="md:col-span-2 text-red-600 text-sm">{errorMsg}</div>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving || !form.checkIn || !form.checkOut || !form.roomNumber || !form.numGuests}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
    );
  };
//   const handleSaveEdit = (updated: any) => {
//     // TODO: Implement API update
//     setEditModalOpen(false);
//     setEditReservation(null);
//   };
//   const handleCancel = (id: string) => {
//     // TODO: Implement API cancel
//   };
//   const handleComplete = (id: string) => {
//     // TODO: Implement API complete
//   };

  if (isLoading) return <Loader />;
  if (error) return <div className="p-8 text-red-600">Failed to load reservations.</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="py-12 px-4 md:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Manage Reservations</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            View, edit, and manage all hotel reservations.
          </p>
        </div>
      </div>
      <div className="py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* FilterPanel */}
          <FilterPanel
            search={search}
            onSearch={setSearch}
            filters={filters}
            onFilterChange={setFilters}
          />

          <Card>
            <CardHeader>
              <CardTitle>
                Reservations
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredReservations.length} results)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3 cursor-pointer select-none" onClick={() => handleSort('guestName')}
                      >Guest Name {getChevron('guestName')}</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3 cursor-pointer select-none" onClick={() => handleSort('roomNumber')}
                      >Room {getChevron('roomNumber')}</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3 cursor-pointer select-none" onClick={() => handleSort('checkIn')}
                      >Check-in {getChevron('checkIn')}</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3 cursor-pointer select-none" onClick={() => handleSort('checkOut')}
                      >Check-out {getChevron('checkOut')}</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3 cursor-pointer select-none" onClick={() => handleSort('status')}
                      >Status {getChevron('status')}</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3 cursor-pointer select-none" onClick={() => handleSort('totalPrice')}
                      >Total Price {getChevron('totalPrice')}</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReservations.map(r => (
                      <TableRow key={r.id} className="hover:bg-muted/50">
                        <TableCell className="py-3">{r.firstName} {r.lastName}</TableCell>
                        <TableCell className="py-3">{r.roomNumber}</TableCell>
                        <TableCell className="py-3 text-muted-foreground">{(() => { const d = new Date(r.checkIn); d.setMinutes(d.getMinutes() + d.getTimezoneOffset()); return d.toLocaleDateString(); })()}</TableCell>
                        <TableCell className="py-3 text-muted-foreground">{(() => { const d = new Date(r.checkOut); d.setMinutes(d.getMinutes() + d.getTimezoneOffset()); return d.toLocaleDateString(); })()}</TableCell>
                        <TableCell className="py-3 font-semibold"><StatusBadge status={r.status ?? ''} /></TableCell>
                        <TableCell className="py-3">${r.totalPrice}</TableCell>
                        <TableCell className="py-3 w-1/6 align-middle">
                          <div className="flex flex-row items-center justify-end gap-2 min-h-10">
                            {r.status === 'PENDING' && (
                              <Button size="sm" variant="outline" onClick={() => handleEdit(r)} className="cursor-pointer min-w-8 shrink-0"><Edit className="h-4 w-4" /></Button>
                            )}
                            {r.status === 'PENDING' && (
                              <Button
                                size="sm"
                                variant="default"
                                className="cursor-pointer bg-green-600 hover:bg-green-700 text-white min-w-20 shrink-0"
                                onClick={() => handleCheckIn(r.id ?? '')}
                                disabled={isCheckingIn}
                              >
                                {isCheckingIn ? 'Checking In...' : 'Check In'}
                              </Button>
                            )}
                            {r.status === 'PENDING' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="cursor-pointer border-red-600 text-red-600 hover:bg-red-50 min-w-20 shrink-0"
                                onClick={() => handleCancel(r.id ?? '')}
                                disabled={isCancelling}
                              >
                                {isCancelling ? 'Cancelling...' : 'Cancel'}
                              </Button>
                            )}
                            {r.status === 'CONFIRMED' && (
                              <Button
                                size="sm"
                                variant="default"
                                className="cursor-pointer bg-red-600 hover:bg-red-700 text-white min-w-20 shrink-0"
                                onClick={() => handleCheckOut(r.id ?? '')}
                                disabled={isCheckingOut}
                              >
                                {isCheckingOut ? 'Checking Out...' : 'Check Out'}
                              </Button>
                            )}
                            {r.status === 'CANCELLED' && (
                              <Button
                                size="sm"
                                variant="default"
                                className="cursor-not-allowed bg-gray-300 text-gray-500 min-w-20 shrink-0"
                                disabled
                              >
                                Cancelled
                              </Button>
                            )}
                            {r.status === 'COMPLETED' && (
                              <Button
                                size="sm"
                                variant="default"
                                className="cursor-not-allowed bg-gray-300 text-gray-500 min-w-20 shrink-0"
                                disabled
                              >
                                Completed
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {paginatedReservations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No reservations found.</div>
                )}
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 text-sm">
                <p className="text-muted-foreground">
                  Page {page} of {totalPages || 1}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Edit Modal */}
      <EditReservationModal
        open={editModalOpen}
        reservation={editReservation}
        onClose={() => { setEditModalOpen(false); setEditReservation(null); }}
      />
    </div>
  );
};

// Chevron icons for sorting
// const ChevronDownIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;
// const ChevronUpIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>;

export default ManageReservations;
