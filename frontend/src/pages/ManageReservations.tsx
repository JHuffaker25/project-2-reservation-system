import React, { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
// import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar, X, Search, ChevronDown } from 'lucide-react';
import { useGetReservationsQuery } from '@/features/reservation/reservationApi';
import Loader from '@/components/loader';

const roomTypes = ['All types', 'Standard', 'Deluxe', 'Suite', 'Family', 'Ocean View', 'Penthouse'];
const statuses = ['All statuses', 'Upcoming', 'Completed', 'Canceled', 'Current'];

// Calendar-based date range picker from Transactions page
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
            <Button variant="outline" size="sm" onClick={() => { setTempStartDate(null); setTempEndDate(null); }} className="flex-1 cursor-pointer">
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
    roomType: string;
    status: string;
  };
  onFilterChange: (filters: any) => void;
}) => (
  <Card>
    <CardHeader>
        <CardTitle>Filters & Search</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">

        {/* Search Bar */}
        <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
            type="text"
            placeholder="Search by guest or room..."
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={e => onSearch(e.target.value)}
            />
        </div>
        {/* Type Filter */}
        <div className="relative">
            <select
            value={filters.roomType}
            onChange={e => onFilterChange({ ...filters, roomType: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
            {roomTypes.map(type => (
              <option key={type} value={type === 'All types' ? '' : type}>{type}</option>
            ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        </div>
        {/* Status Filter */}
        <div className="relative">
            <select
            value={filters.roomType}
            onChange={e => onFilterChange({ ...filters, roomType: e.target.value })}
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
  const config: Record<string, { bg: string; text: string }> = {
    Upcoming: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    Completed: { bg: 'bg-green-100', text: 'text-green-800' },
    Canceled: { bg: 'bg-red-100', text: 'text-red-800' },
    Ongoing: { bg: 'bg-blue-100', text: 'text-blue-800' },
  };
  const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{status}</span>;
};

// Edit Reservation Dialog
// const EditReservationModal = ({
//   open,
//   reservation,
//   onClose,
//   onSave,
// }: {
//   open: boolean;
//   reservation: any;
//   onClose: () => void;
//   onSave: (updated: any) => void;
// }) => {
//   const [form, setForm] = useState(reservation);
  
//   useEffect(() => {
//     setForm(reservation);
//   }, [reservation]);

//   if (!reservation || !form) return null;

//   return (
//     <Dialog open={open} onOpenChange={val => { if (!val) onClose(); }}>
//       <DialogContent className="max-w-lg mx-auto">
//         {open && reservation && (
//           <Card className="shadow-none border-none">
//             <CardHeader>
//               <CardTitle>Edit Reservation</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <label className="text-sm font-semibold">First Name</label>
//                 <Input
//                   value={form.firstName}
//                   onChange={e => setForm({ ...form, firstName: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-semibold">Last Name</label>
//                 <Input
//                   value={form.lastName}
//                   onChange={e => setForm({ ...form, lastName: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-semibold">Email</label>
//                 <Input
//                   value={form.email}
//                   onChange={e => setForm({ ...form, email: e.target.value })}
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <div>
//                   <label className="text-sm font-semibold">Check-in</label>
//                   <Input
//                     type="date"
//                     value={form.checkIn ? form.checkIn.toISOString().slice(0, 10) : ''}
//                     onChange={e => setForm({ ...form, checkIn: new Date(e.target.value) })}
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-semibold">Check-out</label>
//                   <Input
//                     type="date"
//                     value={form.checkOut ? form.checkOut.toISOString().slice(0, 10) : ''}
//                     onChange={e => setForm({ ...form, checkOut: new Date(e.target.value) })}
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="text-sm font-semibold">Guests</label>
//                 <Input
//                   type="number"
//                   min={1}
//                   value={form.guests}
//                   onChange={e => setForm({ ...form, guests: Number(e.target.value) })}
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-semibold">Room Type</label>
//                 <select
//                   className="w-full px-3 py-2 h-10 border border-input rounded-md bg-background text-foreground text-sm"
//                   value={form.roomType}
//                   onChange={e => setForm({ ...form, roomType: e.target.value })}
//                 >
//                   {roomTypes.filter(t => t !== 'All').map(type => (
//                     <option key={type} value={type}>{type}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="text-sm font-semibold">Status</label>
//                 <select
//                   className="w-full px-3 py-2 h-10 border border-input rounded-md bg-background text-foreground text-sm"
//                   value={form.status}
//                   onChange={e => setForm({ ...form, status: e.target.value })}
//                 >
//                   {statuses.filter(s => s !== 'All').map(status => (
//                     <option key={status} value={status}>{status}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex gap-2 justify-end pt-4">
//                 <Button variant="outline" onClick={onClose} className="cursor-pointer">Cancel</Button>
//                 <Button
//                   disabled={!(form.checkIn && form.checkOut && form.checkOut > form.checkIn && form.guests > 0)}
//                   onClick={() => onSave(form)}
//                   className="cursor-pointer"
//                 >
//                   Save Changes
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// Main ManageReservations page
const PAGE_SIZE = 5;
type SortKey = 'checkIn' | 'guestName' | 'status';
// const sortOptions = [
//   { label: 'Check-in Date', value: 'checkIn' },
//   { label: 'Guest Name', value: 'guestName' },
//   { label: 'Status', value: 'status' },
// ] as const;


const ManageReservations: React.FC = () => {
  const { data: reservations = [], isLoading, error } = useGetReservationsQuery();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    dateStart: null as Date | null,
    dateEnd: null as Date | null,
    roomType: '',
    status: '',
  });
  const [sortBy, ] = useState<SortKey>('checkIn');
  const [sortDir, ] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [, setEditModalOpen] = useState(false);
  const [, setEditReservation] = useState<any | null>(null);

  // Filtering and searching (updated for API model)
  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const searchLower = search.toLowerCase();
      if (
        searchLower &&
        !r.userId.toLowerCase().includes(searchLower) &&
        !(r.id && r.id.toLowerCase().includes(searchLower))
      ) {
        return false;
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
      let valA: string | Date = (() => {
        switch (sortBy) {
          case 'checkIn': return a.checkIn ? new Date(a.checkIn) : new Date(0);
          case 'guestName': return a.userId ?? '';
          case 'status': return a.status ?? '';
          default: return '';
        }
      })();
      let valB: string | Date = (() => {
        switch (sortBy) {
          case 'checkIn': return b.checkIn ? new Date(b.checkIn) : new Date(0);
          case 'guestName': return b.userId ?? '';
          case 'status': return b.status ?? '';
          default: return '';
        }
      })();
      if (valA instanceof Date && valB instanceof Date) {
        return sortDir === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [filteredReservations, sortBy, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedReservations.length / PAGE_SIZE);
  const paginatedReservations = sortedReservations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary counts (optional, can update if needed)

  // Actions (edit/save/cancel/complete would require API mutation endpoints)
  const handleEdit = (reservation: any) => {
    setEditReservation(reservation);
    setEditModalOpen(true);
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
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Guest Name</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Room</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Check-in</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Check-out</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Status</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Total Price</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReservations.map(r => (
                      <TableRow key={r.id} className="hover:bg-muted/50">
                        <TableCell className="py-3">{r.userId}</TableCell>
                        <TableCell className="py-3">{r.roomId}</TableCell>
                        <TableCell className="py-3 text-muted-foreground">{new Date(r.checkIn).toLocaleDateString()}</TableCell>
                        <TableCell className="py-3 text-muted-foreground">{new Date(r.checkOut).toLocaleDateString()}</TableCell>
                        <TableCell className="py-3 font-semibold"><StatusBadge status={r.status ?? ''} /></TableCell>
                        <TableCell className="py-3">${r.totalPrice}</TableCell>
                        <TableCell className="py-3 w-1/6">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(r)} className="cursor-pointer">Edit</Button>
                            {/* Cancel/Complete actions would require API mutation */}
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
      {/* <EditReservationModal
        open={editModalOpen}
        reservation={editReservation}
        onClose={() => { setEditModalOpen(false); setEditReservation(null); }}
        onSave={handleSaveEdit}
      /> */}
    </div>
  );
};

// Chevron icons for sorting
// const ChevronDownIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;
// const ChevronUpIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>;

export default ManageReservations;
