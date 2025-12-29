import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { Reservation, RoomType } from '@/types/types';

interface ReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation;
  roomType: RoomType | null | undefined;
  transaction: any;
  checkInDateStr: string;
  checkOutDateStr: string;
  nights: number;
}

const ReceiptDialog: React.FC<ReceiptDialogProps> = ({ open, onClose, reservation, roomType, transaction, checkInDateStr, checkOutDateStr, nights }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="flex flex-col items-center bg-transparent shadow-none border-none text-force-dark" showCloseButton={false}>
      <DialogTitle asChild>
        <VisuallyHidden>Receipt</VisuallyHidden>
      </DialogTitle>
      <DialogDescription asChild>
        <VisuallyHidden>This dialog displays a detailed receipt for your reservation and payment.</VisuallyHidden>
      </DialogDescription>
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
          <span>{roomType?.name}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Guest</span>
          <span>{reservation?.firstName} {reservation?.lastName}</span>
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
          <span>{reservation?.numGuests}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Nights</span>
          <span>{nights}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Price/Night</span>
          <span>${roomType?.pricePerNight}.00</span>
        </div>
        <div className="border-b border-dashed border-gray-300 my-2" />
        <div className="flex justify-between font-bold text-base mb-1">
          <span>Total Paid</span>
          <span>
            ${reservation?.totalPrice}.00
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
            {transaction?.authorizedAt
              ? new Date(transaction?.authorizedAt).toLocaleDateString()
              : checkInDateStr}
          </span>
        </div>
        <div className="border-b border-dashed border-gray-300 my-2" />
        <div className="flex flex-col gap-1 mb-1">
          <div className="flex items-center justify-between gap-2 text-[10px] text-gray-400">
            <span className="font-mono text-gray-400">Reservation ID:</span>
            <span className="font-mono py-0.5 rounded">{reservation?.id}</span>
          </div>
          {transaction?.id && (
            <div className="flex items-center justify-between gap-2 text-[10px] text-gray-400">
              <span className="font-mono text-gray-400">Transaction ID:</span>
              <span className="font-monopx-2 py-0.5 rounded">{transaction?.id}</span>
            </div>
          )}
        </div>
        <div className="border-b border-dashed border-gray-300 my-2" />
        <div className="text-center text-xs text-gray-400 mt-2">Thank you for your stay!</div>
        <div className="flex justify-center mt-3">
          <Button onClick={onClose} type="button" className="cursor-pointer">Close</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default ReceiptDialog;
