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
  Download,
  Eye,
  Search,
  DollarSign,
  Clock,
  RotateCcw,
  X,
  Mail,
  Calendar,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';

// Mock transaction data
const mockTransactions = [
  {
    id: 'TXN001',
    reservationId: 'RSV67890',
    guest: 'John Doe',
    email: 'john@example.com',
    amount: 249.99,
    method: 'Credit Card',
    status: 'Paid',
    date: new Date(2025, 1, 14),
    roomType: 'Suite',
    roomNumber: '305',
    checkInDate: new Date(2025, 1, 14),
    checkOutDate: new Date(2025, 1, 17),
    subtotal: 230.00,
    tax: 19.99,
    fee: 0,
    refundHistory: [],
  },
  {
    id: 'TXN002',
    reservationId: 'RSV67891',
    guest: 'Jane Smith',
    email: 'jane@example.com',
    amount: 449.50,
    method: 'PayPal',
    status: 'Paid',
    date: new Date(2025, 1, 13),
    roomType: 'Deluxe Room',
    roomNumber: '201',
    checkInDate: new Date(2025, 1, 15),
    checkOutDate: new Date(2025, 1, 18),
    subtotal: 420.00,
    tax: 29.50,
    fee: 0,
    refundHistory: [],
  },
  {
    id: 'TXN003',
    reservationId: 'RSV67892',
    guest: 'Michael Johnson',
    email: 'michael@example.com',
    amount: 549.99,
    method: 'Stripe',
    status: 'Pending',
    date: new Date(2025, 1, 12),
    roomType: 'Penthouse',
    roomNumber: '801',
    checkInDate: new Date(2025, 1, 20),
    checkOutDate: new Date(2025, 1, 24),
    subtotal: 520.00,
    tax: 29.99,
    fee: 0,
    refundHistory: [],
  },
  {
    id: 'TXN004',
    reservationId: 'RSV67893',
    guest: 'Sarah Williams',
    email: 'sarah@example.com',
    amount: 179.99,
    method: 'Credit Card',
    status: 'Failed',
    date: new Date(2025, 1, 11),
    roomType: 'Standard Room',
    roomNumber: '102',
    checkInDate: new Date(2025, 2, 1),
    checkOutDate: new Date(2025, 2, 3),
    subtotal: 160.00,
    tax: 19.99,
    fee: 0,
    refundHistory: [],
  },
  {
    id: 'TXN005',
    reservationId: 'RSV67894',
    guest: 'Robert Brown',
    email: 'robert@example.com',
    amount: 349.99,
    method: 'PayPal',
    status: 'Refunded',
    date: new Date(2025, 1, 10),
    roomType: 'Family Room',
    roomNumber: '405',
    checkInDate: new Date(2025, 2, 5),
    checkOutDate: new Date(2025, 2, 7),
    subtotal: 320.00,
    tax: 29.99,
    fee: 0,
    refundHistory: [{ date: new Date(2025, 1, 11), amount: 349.99, reason: 'Guest request' }],
  },
  {
    id: 'TXN006',
    reservationId: 'RSV67895',
    guest: 'Emily Davis',
    email: 'emily@example.com',
    amount: 629.99,
    method: 'Credit Card',
    status: 'Paid',
    date: new Date(2025, 1, 9),
    roomType: 'Suite',
    roomNumber: '304',
    checkInDate: new Date(2025, 2, 10),
    checkOutDate: new Date(2025, 2, 14),
    subtotal: 600.00,
    tax: 29.99,
    fee: 0,
    refundHistory: [],
  },
  {
    id: 'TXN007',
    reservationId: 'RSV67896',
    guest: 'David Martinez',
    email: 'david@example.com',
    amount: 299.99,
    method: 'Stripe',
    status: 'Paid',
    date: new Date(2025, 1, 8),
    roomType: 'Deluxe Room',
    roomNumber: '202',
    checkInDate: new Date(2025, 2, 12),
    checkOutDate: new Date(2025, 2, 15),
    subtotal: 280.00,
    tax: 19.99,
    fee: 0,
    refundHistory: [],
  },
  {
    id: 'TXN008',
    reservationId: 'RSV67897',
    guest: 'Lisa Anderson',
    email: 'lisa@example.com',
    amount: 199.99,
    method: 'Credit Card',
    status: 'Pending',
    date: new Date(2025, 1, 7),
    roomType: 'Standard Room',
    roomNumber: '101',
    checkInDate: new Date(2025, 2, 8),
    checkOutDate: new Date(2025, 2, 10),
    subtotal: 180.00,
    tax: 19.99,
    fee: 0,
    refundHistory: [],
  },
  {
    id: 'TXN009',
    reservationId: 'RSV67898',
    guest: 'James Taylor',
    email: 'james@example.com',
    amount: 799.99,
    method: 'PayPal',
    status: 'Paid',
    date: new Date(2025, 1, 6),
    roomType: 'Penthouse',
    roomNumber: '802',
    checkInDate: new Date(2025, 3, 1),
    checkOutDate: new Date(2025, 3, 5),
    subtotal: 760.00,
    tax: 39.99,
    fee: 0,
    refundHistory: [],
  },
  {
    id: 'TXN010',
    reservationId: 'RSV67899',
    guest: 'Maria Garcia',
    email: 'maria@example.com',
    amount: 429.99,
    method: 'Stripe',
    status: 'Paid',
    date: new Date(2025, 1, 5),
    roomType: 'Deluxe Room',
    roomNumber: '203',
    checkInDate: new Date(2025, 3, 3),
    checkOutDate: new Date(2025, 3, 6),
    subtotal: 400.00,
    tax: 29.99,
    fee: 0,
    refundHistory: [],
  },
  {
    id: 'TXN011',
    reservationId: 'RSV67900',
    guest: 'Thomas Wilson',
    email: 'thomas@example.com',
    amount: 299.99,
    method: 'Credit Card',
    status: 'Failed',
    date: new Date(2025, 1, 4),
    roomType: 'Family Room',
    roomNumber: '406',
    checkInDate: new Date(2025, 3, 10),
    checkOutDate: new Date(2025, 3, 12),
    subtotal: 280.00,
    tax: 19.99,
    fee: 0,
    refundHistory: [],
  },
  {
    id: 'TXN012',
    reservationId: 'RSV67901',
    guest: 'Jennifer Lee',
    email: 'jennifer@example.com',
    amount: 349.99,
    method: 'PayPal',
    status: 'Paid',
    date: new Date(2025, 1, 3),
    roomType: 'Suite',
    roomNumber: '306',
    checkInDate: new Date(2025, 3, 15),
    checkOutDate: new Date(2025, 3, 18),
    subtotal: 320.00,
    tax: 29.99,
    fee: 0,
    refundHistory: [],
  },
  {
    id: 'TXN013',
    reservationId: 'RSV67902',
    guest: 'Christopher Harris',
    email: 'christopher@example.com',
    amount: 499.99,
    method: 'Stripe',
    status: 'Pending',
    date: new Date(2025, 1, 2),
    roomType: 'Penthouse',
    roomNumber: '803',
    checkInDate: new Date(2025, 4, 1),
    checkOutDate: new Date(2025, 4, 5),
    subtotal: 470.00,
    tax: 29.99,
    fee: 0,
    refundHistory: [],
  },
  {
    id: 'TXN014',
    reservationId: 'RSV67903',
    guest: 'Jessica White',
    email: 'jessica@example.com',
    amount: 239.99,
    method: 'Credit Card',
    status: 'Paid',
    date: new Date(2025, 1, 1),
    roomType: 'Standard Room',
    roomNumber: '103',
    checkInDate: new Date(2025, 4, 5),
    checkOutDate: new Date(2025, 4, 7),
    subtotal: 220.00,
    tax: 19.99,
    fee: 0,
    refundHistory: [],
  },
];

// Badge component for status
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    Paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
    Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    Failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
    Refunded: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Refunded' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Enhanced Calendar Component for date range selection
const TransactionDateRangeCalendar = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateInRange = (date: Date): boolean => {
    if (!startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  const isStartDate = (date: Date): boolean => {
    return startDate ? date.toDateString() === startDate.toDateString() : false;
  };

  const isEndDate = (date: Date): boolean => {
    return endDate ? date.toDateString() === endDate.toDateString() : false;
  };

  const handleDateClick = (date: Date) => {
    if (!startDate) {
      onStartDateChange(date);
    } else if (!endDate) {
      if (date > startDate) {
        onEndDateChange(date);
      } else {
        onStartDateChange(date);
      }
    } else {
      onStartDateChange(date);
      onEndDateChange(null as any);
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

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-muted rounded-md transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-semibold text-lg">{monthYear}</p>
        <button
          onClick={handleNextMonth}
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
          const isDisabled = !day;
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

      {/* Date Range Display */}
      {(startDate || endDate) && (
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Start: </span>
            <span className="font-semibold">{startDate ? startDate.toLocaleDateString() : 'Not selected'}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">End: </span>
            <span className="font-semibold">{endDate ? endDate.toLocaleDateString() : 'Not selected'}</span>
          </div>
          {startDate && endDate && (
            <div className="text-sm pt-2 border-t">
              <span className="text-muted-foreground">Range: </span>
              <span className="font-semibold">
                {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Improved date range picker with Popover
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
          <TransactionDateRangeCalendar
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

// Transaction Details Sheet
const TransactionDetailsSheet = ({
  transaction,
  onClose,
}: {
  transaction: (typeof mockTransactions)[0] | null;
  onClose: () => void;
}) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex">
      <div className="ml-auto bg-muted w-full max-w-md h-full shadow-lg overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-muted border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Transaction Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transaction ID */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Transaction ID</p>
            <p className="font-mono text-sm font-semibold">{transaction.id}</p>
          </div>

          {/* Guest Info */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Guest Information</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-semibold">{transaction.guest}</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <a href={`mailto:${transaction.email}`} className="text-primary hover:underline text-sm">
                  {transaction.email}
                </a>
              </div>
            </div>
          </div>

          {/* Room Info */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Room Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room Type:</span>
                <span className="font-semibold">{transaction.roomType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room Number:</span>
                <span className="font-semibold">{transaction.roomNumber}</span>
              </div>
            </div>
          </div>

          {/* Reservation Dates */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Reservation Dates</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-in:</span>
                <span className="font-semibold">{transaction.checkInDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-out:</span>
                <span className="font-semibold">{transaction.checkOutDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-semibold">
                  {Math.ceil(
                    (transaction.checkOutDate.getTime() - transaction.checkInDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  nights
                </span>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Payment Breakdown</p>
            <div className="space-y-2 text-sm bg-muted/50 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">${transaction.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-semibold">${transaction.tax.toFixed(2)}</span>
              </div>
              {transaction.fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee:</span>
                  <span className="font-semibold">${transaction.fee.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                <span>Total:</span>
                <span className="text-primary">${transaction.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method & Status */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Payment Information</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="font-semibold">{transaction.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={transaction.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-semibold">{transaction.date.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Refund History */}
          {transaction.refundHistory.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Refund History</p>
              <div className="space-y-2">
                {transaction.refundHistory.map((refund, idx) => (
                  <div key={idx} className="bg-blue-50 p-3 rounded-lg text-sm">
                    <p className="text-muted-foreground mb-1">
                      {refund.date.toLocaleDateString()}
                    </p>
                    <p className="font-semibold">${refund.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{refund.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-4 space-y-2">
            <Button className="w-full gap-2 cursor-pointer" variant="outline">
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
            {transaction.status === 'Paid' && (
              <Button className="w-full gap-2 cursor-pointer" variant="destructive">
                <RotateCcw className="h-4 w-4" />
                Issue Refund
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Transactions Page
export default function Transactions() {
  const [transactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [selectedTransaction, setSelectedTransaction] = useState<(typeof mockTransactions)[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        txn.id.toLowerCase().includes(searchLower) ||
        txn.guest.toLowerCase().includes(searchLower) ||
        txn.reservationId.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = !statusFilter || txn.status === statusFilter;

      // Method filter
      const matchesMethod = !methodFilter || txn.method === methodFilter;

      // Date range filter
      const matchesDate =
        (!dateRange.start || txn.date >= dateRange.start) &&
        (!dateRange.end || txn.date <= dateRange.end);

      return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });
  }, [transactions, searchTerm, statusFilter, methodFilter, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Analytics calculations
  const analytics = useMemo(() => {
    const paidTransactions = transactions.filter((t) => t.status === 'Paid');
    const pendingTransactions = transactions.filter((t) => t.status === 'Pending');
    const refundedTransactions = transactions.filter((t) => t.status === 'Refunded');

    const totalRevenue = paidTransactions.reduce((sum, t) => sum + t.amount, 0);
    const pendingPayments = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalRefunds = refundedTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalRevenue,
      pendingPayments,
      totalRefunds,
      totalTransactions: transactions.length,
    };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="py-12 px-4 md:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Transactions</h1>
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
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {transactions.filter((t) => t.status === 'Paid').length} paid transactions
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
                <div className="text-2xl font-bold">${analytics.pendingPayments.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {transactions.filter((t) => t.status === 'Pending').length} transactions
                </p>
              </CardContent>
            </Card>

            {/* Total Refunds */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
                <RotateCcw className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.totalRefunds.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {transactions.filter((t) => t.status === 'Refunded').length} refunded transactions
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

                {/* Status Filter */}
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
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                </div>

                {/* Method Filter */}
                <div className="relative">
                  <select
                    value={methodFilter}
                    onChange={(e) => {
                      setMethodFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="">All Methods</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Stripe">Stripe</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                </div>

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
              <CardTitle>
                Transactions
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredTransactions.length} results)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Transaction ID</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Guest</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Reservation ID</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Amount</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Method</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Status</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Date</TableCell>
                      <TableCell className="font-semibold text-xs uppercase text-muted-foreground py-3">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((txn) => (
                      <TableRow key={txn.id} className="hover:bg-muted/50">
                        <TableCell className="py-3 font-semibold">{txn.id}</TableCell>
                        <TableCell className="py-3">{txn.guest}</TableCell>
                        <TableCell className="py-3 text-muted-foreground">{txn.reservationId}</TableCell>
                        <TableCell className="py-3 font-semibold">${txn.amount.toFixed(2)}</TableCell>
                        <TableCell className="py-3 text-muted-foreground">{txn.method}</TableCell>
                        <TableCell className="py-3"><StatusBadge status={txn.status} /></TableCell>
                        <TableCell className="py-3 text-muted-foreground">{txn.date.toLocaleDateString()}</TableCell>
                        <TableCell className="py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedTransaction(txn)}
                              className="gap-1 cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
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

      {/* Transaction Details Sheet */}
      {selectedTransaction && (
        <TransactionDetailsSheet
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
