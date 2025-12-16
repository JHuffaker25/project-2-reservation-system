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


import { useGetTransactionsQuery } from '@/features/transaction/transactionApi';
import type { Transaction } from '@/types/types';
// Badge component for status (updated for new model)
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    CAPTURED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Captured' },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    FAILED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
    REFUNDED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Refunded' },
  };
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
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

// Transaction Details Sheet (updated for new model)
const TransactionDetailsSheet = ({
  transaction,
  onClose,
}: {
  transaction: Transaction | null;
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

          {/* Payment Info */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Payment Information</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Intent ID:</span>
                <span className="font-semibold">{transaction.paymentIntentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={transaction.transactionStatus} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">{transaction.currency} ${transaction.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Authorized At:</span>
                <span className="font-semibold">{new Date(transaction.authorizedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Captured At:</span>
                <span className="font-semibold">{new Date(transaction.capturedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-4 space-y-2">
            <Button className="w-full gap-2 cursor-pointer" variant="outline">
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
            {transaction.transactionStatus === 'CAPTURED' && (
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


export default function ViewTransactions() {
  const { data: transactions = [], isLoading, error } = useGetTransactionsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transactions (updated for new model)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const searchLower = searchTerm.toLowerCase();
      const idStr = typeof txn.id === 'string' ? txn.id : '';
      const intentStr = typeof txn.paymentIntentId === 'string' ? txn.paymentIntentId : '';
      const matchesSearch =
        idStr.toLowerCase().includes(searchLower) ||
        intentStr.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = !statusFilter || txn.transactionStatus === statusFilter;

      // Date range filter (use capturedAt)
      const txnDate = new Date(txn.capturedAt);
      const matchesDate =
        (!dateRange.start || txnDate >= dateRange.start) &&
        (!dateRange.end || txnDate <= dateRange.end);

      // No method filter in new model
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [transactions, searchTerm, statusFilter, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Analytics calculations (updated for new model)
  const analytics = useMemo(() => {
    const captured = transactions.filter((t) => t.transactionStatus === 'CAPTURED');
    const pending = transactions.filter((t) => t.transactionStatus === 'PENDING');
    const refunded = transactions.filter((t) => t.transactionStatus === 'REFUNDED');

    const totalRevenue = captured.reduce((sum, t) => sum + t.amount, 0);
    const pendingPayments = pending.reduce((sum, t) => sum + t.amount, 0);
    const totalRefunds = refunded.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalRevenue,
      pendingPayments,
      totalRefunds,
      totalTransactions: transactions.length,
    };
  }, [transactions]);

  if (isLoading) return <div className="p-8">Loading transactions...</div>;
  if (error) return <div className="p-8 text-red-600">Failed to load transactions.</div>;

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
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {transactions.filter((t) => t.transactionStatus === 'CAPTURED').length} captured transactions
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
                  From {transactions.filter((t) => t.transactionStatus === 'PENDING').length} transactions
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
                  From {transactions.filter((t) => t.transactionStatus === 'REFUNDED').length} refunded transactions
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
                    <option value="CAPTURED">Captured</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
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
                        <TableCell className="py-3">N/A</TableCell>
                        <TableCell className="py-3 text-muted-foreground">N/A</TableCell>
                        <TableCell className="py-3 font-semibold">{txn.currency} ${txn.amount.toFixed(2)}</TableCell>
                        <TableCell className="py-3 text-muted-foreground">N/A</TableCell>
                        <TableCell className="py-3"><StatusBadge status={txn.transactionStatus} /></TableCell>
                        <TableCell className="py-3 text-muted-foreground">{new Date(txn.capturedAt).toLocaleDateString()}</TableCell>
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
