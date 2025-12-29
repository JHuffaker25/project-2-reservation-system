import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  DollarSign,
  Clock,
  RotateCcw,
  X,
  Calendar,
  Receipt,
  Download,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import ReceiptDialog from '@/components/ReceiptDialog';


import { useGetTransactionsQuery } from '@/features/transaction/transactionApi';
import { useGetRoomTypeByReservationIdQuery } from '@/features/roomType/roomTypeApi';
import { useGetReservationByIdQuery } from '@/features/reservation/reservationApi';
import { useGetReservationTransactionQuery } from '@/features/reservation/reservationApi';

// Badge component for status (updated for new model)
const StatusBadge = ({ status }: { status: string }) => {
  // Normalize status to uppercase for consistent lookup
  const normalizedStatus = (status || '').toUpperCase();
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    CAPTURED: { bg: 'bg-green-100', text: 'text-green-800', label: 'CAPTURED' },
    REQUIRES_CAPTURE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'PENDING' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'CANCELLED' },
  };
  const config = statusConfig[normalizedStatus] || statusConfig.REQUIRES_CAPTURE;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};


import DateRangeCalendar from '@/components/date-range-calendar';

const DateRangePicker = ({
  onApply,
  startDate,
  endDate,
}: {
  onApply: (startDate: Date | null, endDate: Date | null) => void;
  startDate: Date | null;
  endDate: Date | null;
}) => {
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);

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
          <DateRangeCalendar
            startDate={tempStartDate}
            endDate={tempEndDate}
            onStartDateChange={setTempStartDate}
            onEndDateChange={setTempEndDate}
          />
        </div>
        {tempStartDate || tempEndDate ? (
          <div className="border-t p-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTempStartDate(null);
                setTempEndDate(null);
                onApply(null, null); // Also clear the date filtering
              }}
              className="flex-1 cursor-pointer"
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onApply(tempStartDate, tempEndDate);
              }}
              className="flex-1 cursor-pointer"
            >
              Apply
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};




export default function ViewTransactions() {
  // Debug: log all transactions
  // eslint-disable-next-line no-console
  const { data: transactions = [], isLoading, error } = useGetTransactionsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showReservationDetails, setShowReservationDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Sorting state
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'authorizedAt', direction: 'desc' });

  // Fetch reservation, roomType, and transaction for selected reservationId
  const { data: selectedReservation } = useGetReservationByIdQuery(selectedReservationId ?? '', { skip: !selectedReservationId });
  const { data: selectedRoomType } = useGetRoomTypeByReservationIdQuery(selectedReservationId ?? '', { skip: !selectedReservationId });
  const { data: selectedTransaction } = useGetReservationTransactionQuery(selectedReservationId ?? '', { skip: !selectedReservationId });

  // Filter transactions (updated for new model)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const searchLower = searchTerm.toLowerCase();
      const idStr = typeof txn.id === 'string' ? txn.id : '';
      const guestName = `${txn.firstName ?? ''} ${txn.lastName ?? ''}`.trim();
      const reservationIdStr = typeof txn.reservationId === 'string' ? txn.reservationId : '';
      // Use authorizedAt for date search (could also use capturedAt if needed)
      const dateStr = txn.authorizedAt ? new Date(txn.authorizedAt).toLocaleDateString().toLowerCase() : '';

      const matchesSearch =
        idStr.toLowerCase().includes(searchLower) ||
        guestName.toLowerCase().includes(searchLower) ||
        reservationIdStr.toLowerCase().includes(searchLower) ||
        dateStr.includes(searchLower);

      // Status filter (case-insensitive, handles undefined/null)
      const txnStatus = (txn.transactionStatus || '').toString().toLowerCase();
      const filterStatus = (statusFilter || '').toString().toLowerCase();
      const matchesStatus = !filterStatus || txnStatus === filterStatus;

      // Date range filter (use capturedAt)
      const txnDate = new Date(txn.capturedAt);
      const matchesDate =
        (!dateRange.start || txnDate >= dateRange.start) &&
        (!dateRange.end || txnDate <= dateRange.end);

      // No method filter in new model
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [transactions, searchTerm, statusFilter, dateRange]);

  // Sorting logic (similar to RoomTable)
  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions];
    sorted.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sort.key) {
        case 'id':
          aVal = a.id;
          bVal = b.id;
          break;
        case 'guest':
          aVal = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim().toLowerCase();
          bVal = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim().toLowerCase();
          break;
        case 'reservationId':
          aVal = a.reservationId;
          bVal = b.reservationId;
          break;
        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
          break;
        case 'status':
          aVal = a.transactionStatus;
          bVal = b.transactionStatus;
          break;
        case 'authorizedAt':
          aVal = new Date(a.authorizedAt).getTime();
          bVal = new Date(b.authorizedAt).getTime();
          break;
        default:
          aVal = '';
          bVal = '';
      }
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredTransactions, sort]);

  // Pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Chevron for sort direction
  const getChevron = (key: string) => {
    if (sort.key !== key) return <ChevronDown className="inline h-4 w-4 text-muted-foreground opacity-50" />;
    return sort.direction === 'asc' ? <ChevronDown className="inline h-4 w-4 text-muted-foreground rotate-180" /> : <ChevronDown className="inline h-4 w-4 text-muted-foreground" />;
  };

  // Handle sort change
  const handleSort = (key: string) => {
    setSort(prev => prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' });
    setCurrentPage(1);
  };

  // Analytics calculations (monthly revenue, pending, refunds)
  const analytics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Only include captured transactions from the current month
    const captured = transactions.filter((t) => {
      if (t.transactionStatus !== 'CAPTURED') return false;
      const date = t.capturedAt ? new Date(t.capturedAt) : null;
      return (
        date &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });



    // Normalize status to uppercase for comparison
    const pending = transactions.filter((t) => {
      const status = (t.transactionStatus || '').toUpperCase();
      return status === 'REQUIRES_CAPTURE';
    });
    const cancelled = transactions.filter((t) => (t.transactionStatus || '').toUpperCase() === 'CANCELLED');

    // Ensure we use the correct amount field for pending transactions
    const getAmount = (txn: any) => typeof txn.amount === 'number' ? txn.amount : 0;

    const totalRevenue = captured.reduce((sum, t) => sum + getAmount(t), 0);
    const pendingPayments = pending.reduce((sum, t) => sum + getAmount(t), 0);
    const totalCancelled = cancelled.reduce((sum, t) => sum + getAmount(t), 0);

    // Month label (e.g., December 2025)
    const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    return {
      totalRevenue,
      pendingPayments,
      totalRefunds: totalCancelled,
      totalTransactions: transactions.length,
      monthLabel,
      capturedCount: captured.length,
    };
  }, [transactions]);

  if (isLoading) return <div className="p-8">Loading transactions...</div>;
  if (error) return <div className="p-8 text-red-600">Failed to load transactions.</div>;
console.log('All transactions:', transactions);
const totalAmount = transactions.reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0);
console.log('Sum of all transaction amounts:', totalAmount);

 function generateCSV() {
    // Business/accounting-friendly CSV export
    const headers = [
      'Transaction ID',
      'Guest Name',
      'Reservation ID',
      'Transaction Type',
      'Status',
      'Amount (USD)',
      'Currency',
      'Payment Method Last4',
      'Authorized At (ISO)',
      'Captured At (ISO)',
      'Cancelled At (ISO)',
      'Notes'
    ];
    // Use sortedTransactions for business reporting (filtered and sorted)
    const rows = sortedTransactions.map((txn) => {
      // Transaction type: Payment, Refund, Pending, etc.
      let type = 'Payment';
      if ((txn.transactionStatus || '').toUpperCase() === 'CANCELLED') type = 'Refund';
      else if ((txn.transactionStatus || '').toUpperCase() === 'REQUIRES_CAPTURE') type = 'Pending';
      // Notes for accounting (e.g., failed, partial, etc.)
      let notes = '';
      if ((txn.transactionStatus || '').toUpperCase() === 'REQUIRES_CAPTURE') notes = 'Pending capture';
      if ((txn.transactionStatus || '').toUpperCase() === 'CANCELLED') notes = 'Refunded/cancelled';
      if ((txn.transactionStatus || '').toUpperCase() === 'FAILED') notes = 'Failed';
      return [
        txn.id,
        `${txn.firstName ?? ''} ${txn.lastName ?? ''}`.trim(),
        txn.reservationId,
        type,
        (txn.transactionStatus || '').toString().toUpperCase(),
        typeof txn.amount === 'number' ? (txn.amount / 100).toFixed(2) : '0.00',
        txn.currency ? txn.currency.toUpperCase() : '',
        txn.last4 ? `**** **** **** ${txn.last4}` : 'N/A',
        txn.authorizedAt ? new Date(txn.authorizedAt).toISOString() : '',
        txn.capturedAt ? new Date(txn.capturedAt).toISOString() : '',
        txn.cancelledAt ? new Date(txn.cancelledAt).toISOString() : '',
        notes
      ];
    });

    // Add summary row for totals (for accounting)
    const total = sortedTransactions.reduce((sum, txn) => sum + (typeof txn.amount === 'number' ? txn.amount : 0), 0);
    const summaryRow = [
      '', '', '', 'TOTAL', '', (total / 100).toFixed(2), 'USD', '', '', '', '', ''
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(',')), summaryRow.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link); // Required for FF

    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="py-12 px-4 md:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">View Transactions</h1>
          <p className="text-lg text-muted-foreground">
            Manage and monitor all financial transactions, payments, and refunds.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Analytics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                  <span className="ml-2 text-xs text-muted-foreground font-normal">({analytics.monthLabel})</span>
                </CardTitle>
                <DollarSign className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(analytics.totalRevenue / 100).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {analytics.capturedCount} captured transactions
                </p>
              </CardContent>
            </Card>

            {/* Pending Payments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(analytics.pendingPayments / 100).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {transactions.filter((t) => (t.transactionStatus || '').toUpperCase() === 'REQUIRES_CAPTURE').length} transactions
                </p>
              </CardContent>
            </Card>

            {/* Total Cancelled */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
                <RotateCcw className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(analytics.totalRefunds / 100).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {transactions.filter((t) => (t.transactionStatus || '').toUpperCase() === 'CANCELLED').length} cancelled transactions
                </p>
              </CardContent>
            </Card>

            
          </div>

          {/* Filters Section */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Bar */}
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by ID, name, or reservation..."
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {/* Status Filter (updated for new model) */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="">All Status</option>
                    <option value="Captured">Captured</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                </div>

                {/* Method Filter (removed, not in new model) */}

                {/* Date Range */}
                <DateRangePicker
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  onApply={(start, end) => {
                    setDateRange({ start, end });
                    setCurrentPage(1);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Transactions
               

                <div className="flex items-end md:items-center justify-end mb-4">

                     
                    <button
                    onClick={generateCSV}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-primary/90 transition-colors text-sm font-semibold"
                    title="Download CSV Report"
                    >
                    <Download className="h-4 w-4" />
                    Generate Report
                    </button>
                    <span className="ml-6 text-sm font-normal text-muted-foreground">
                  ({filteredTransactions.length} results)
                </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3 cursor-pointer select-none" onClick={() => handleSort('id')}>
                        Transaction ID {getChevron('id')}
                      </TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3 cursor-pointer select-none" onClick={() => handleSort('guest')}>
                        Guest {getChevron('guest')}
                      </TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3 cursor-pointer select-none" onClick={() => handleSort('reservationId')}>
                        Reservation ID {getChevron('reservationId')}
                      </TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3 cursor-pointer select-none" onClick={() => handleSort('amount')}>
                        Amount {getChevron('amount')}
                      </TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Payment Method</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3 cursor-pointer select-none" onClick={() => handleSort('status')}>
                        Status {getChevron('status')}
                      </TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3 cursor-pointer select-none" onClick={() => handleSort('authorizedAt')}>
                        Date {getChevron('authorizedAt')}
                      </TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((txn) => (
                      <TableRow key={txn.id} className="hover:bg-muted/50">
                        <TableCell className="py-3 font-semibold">{txn.id}</TableCell>
                        <TableCell className="py-3">{txn.firstName} {txn.lastName}</TableCell>
                        <TableCell className="py-3 text-muted-foreground">{txn.reservationId}</TableCell>
                        <TableCell className="py-3 font-semibold">{txn.currency.toUpperCase()} ${(txn.amount / 100).toFixed(2)}</TableCell>
                        <TableCell className="py-3 text-muted-foreground">{"**** **** **** " + (txn.last4 ?? "XXXX")}</TableCell>
                        <TableCell className="py-3"><StatusBadge status={txn.transactionStatus} /></TableCell>
                        <TableCell className="py-3 text-muted-foreground">{new Date(txn.authorizedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="py-3">
                          <div className="flex gap-2">
                            {/* Receipt button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedReservationId(txn.reservationId);
                                setShowReceipt(true);
                              }}
                              className="gap-1 cursor-pointer"
                              title="View Receipt"
                            >
                              <Receipt className="h-4 w-4" />
                            </Button>
                            {/* View Reservation Details button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedReservationId(txn.reservationId);
                                setShowReservationDetails(true);
                              }}
                              className="gap-1 cursor-pointer"
                              title="View Reservation Details"
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {paginatedTransactions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No transactions found.</div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 text-sm">
                <p className="text-muted-foreground">
                  Page {currentPage} of {totalPages || 1}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
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

      {/* Receipt Dialog for selected reservation */}
      {selectedReservation && showReceipt && (
        <ReceiptDialog
          open={showReceipt}
          onClose={() => setShowReceipt(false)}
          reservation={selectedReservation}
          roomType={selectedRoomType ?? null}
          transaction={selectedTransaction ?? null}
          checkInDateStr={selectedReservation.checkIn ? new Date(selectedReservation.checkIn).toLocaleDateString() : 'placeholder'}
          checkOutDateStr={selectedReservation.checkOut ? new Date(selectedReservation.checkOut).toLocaleDateString() : 'placeholder'}
          nights={selectedReservation.checkIn && selectedReservation.checkOut ? Math.max(1, Math.round((new Date(selectedReservation.checkOut).getTime() - new Date(selectedReservation.checkIn).getTime()) / (1000 * 60 * 60 * 24))) : 1}
        />
      )}

      {/* Reservation Details Sidebar */}
      {selectedReservation && showReservationDetails && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/20"
            onClick={() => setShowReservationDetails(false)}
            style={{ cursor: 'pointer' }}
          />
          {/* Sidebar */}
          <aside className="w-full max-w-md h-full bg-white shadow-2xl animate-slide-in-right relative flex flex-col">
            <button
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 z-10 transition-colors duration-150"
              onClick={() => setShowReservationDetails(false)}
              title="Close"
            >
              <X className="h-7 w-7" />
            </button>
            <div className="p-10 pt-16 flex-1 flex flex-col overflow-y-auto">
              <h2 className="text-3xl font-black mb-8 text-primary tracking-tight">Reservation Details</h2>
              <div className="space-y-8">
                {/* IDs and Status */}
                <div className="flex flex-col gap-3 pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-500">Res ID:</span>
                    <span className="font-bold text-primary select-all">{selectedReservation.id}</span>
                  </div>
                  {selectedReservation.userId && (
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-500">User ID:</span>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded select-all">{selectedReservation.userId}</span>
                    </div>
                  )}
                  {selectedReservation.roomId && (
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-500">Room ID:</span>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded select-all">{selectedReservation.roomId}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-500">Status:</span>
                    <span className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide">{selectedReservation.status}</span>
                  </div>
                </div>

                {/* Guest Info */}
                <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-bold mb-3 text-gray-700 tracking-tight">Guest Information</h3>
                  <div className="flex flex-col gap-2 text-gray-700">
                    <span><span className="font-semibold">Name:</span> {selectedReservation.firstName} {selectedReservation.lastName}</span>
                    {/* {selectedReservation.email && <span><span className="font-semibold">Email:</span> {selectedReservation.email}</span>}
                    {selectedReservation.phone && <span><span className="font-semibold">Phone:</span> {selectedReservation.phone}</span>} */}
                  </div>
                </div>

                {/* Dates & Room */}
                <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-bold mb-3 text-gray-700 tracking-tight">Stay Details</h3>
                  <div className="flex flex-col gap-2 text-gray-700">
                    <span><span className="font-semibold">Check-in:</span> {selectedReservation.checkIn ? new Date(selectedReservation.checkIn).toLocaleDateString() : 'N/A'}</span>
                    <span><span className="font-semibold">Check-out:</span> {selectedReservation.checkOut ? new Date(selectedReservation.checkOut).toLocaleDateString() : 'N/A'}</span>
                    {selectedRoomType && <span><span className="font-semibold">Room Type:</span> {selectedRoomType.name}</span>}
                  </div>
                </div>

                {/* Other fields */}
                <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-bold mb-3 text-gray-700 tracking-tight">Other Information</h3>
                  <div className="flex flex-col gap-2 text-gray-700">
                    {Object.entries(selectedReservation)
                      .filter(([key]) => !['id','userId','roomId','status','firstName','lastName','email','phone','checkIn','checkOut'].includes(key))
                      .map(([key, value]) => {
                        // Convert camelCase to Title Case
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        // Format currency fields
                        if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price') || key.toLowerCase().includes('total')) {
                          let currency = 'USD';
                          let formatted = typeof value === 'number' ? `${currency.toUpperCase()} $${(value / 100).toFixed(2)}` : String(value);
                          return (
                            <span key={key}><span className="font-semibold">{label}:</span> <span className="font-mono text-green-700">{formatted}</span></span>
                          );
                        }
                        return (
                          <span key={key}><span className="font-semibold">{label}:</span> {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}</span>
                        );
                      })}
                  </div>
                </div>
              </div>
              <div className="mt-10 flex flex-col gap-2">
                <Button variant="outline" className="font-semibold py-3 text-base" onClick={() => setShowReservationDetails(false)}>
                  Close
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
