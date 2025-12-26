import React from 'react';
import type { Room } from '@/types/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { parseISO } from 'date-fns';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RoomAvailabilityModalProps {
  open: boolean;
  room: Room | null;
  onClose: () => void;
}

const RoomAvailabilityModal: React.FC<RoomAvailabilityModalProps> = ({ open, room, onClose }) => {
  if (!room) return null;

  // datesReserved is an array of ISO date strings
  const reservations = room.datesReserved || [];

  // Convert reserved dates to Date objects
  const reservedDates = reservations.map(date => parseISO(date));


  // Helper: check if a date is reserved
  const isReserved = (date: Date) => reservedDates.some(d => d.toDateString() === date.toDateString());

  // Calendar state
  const [currentMonth, setCurrentMonth] = React.useState(() => reservedDates[0] || new Date());

  // Calendar helpers
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  // Build days grid
  const days: (Date | null)[] = [];
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Room {room.roomNumber} Availability</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          {reservations.length === 0 ? (
            <div className="text-green-600">This room is fully available.</div>
          ) : (
            <div>
              {/* Inline calendar UI */}
              <div className="w-full max-w-xs mx-auto my-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-muted rounded-md transition-colors cursor-pointer"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <p className="font-semibold text-lg" aria-live="polite">{monthYear}</p>
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-muted rounded-md transition-colors cursor-pointer"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2" aria-hidden="true">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, idx) => {
                    const reserved = day && isReserved(day);
                    return (
                      <div
                        key={idx}
                        className={`py-2 px-1 text-sm rounded-md text-center transition-all select-none ${
                          !day
                            ? 'bg-transparent'
                            : reserved
                            ? 'bg-red-500 text-white font-semibold'
                            : 'bg-muted text-foreground'
                        }`}
                        aria-disabled={!day}
                        aria-label={day ? day.toLocaleDateString() : undefined}
                      >
                        {day ? day.getDate() : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Reserved dates are highlighted in red.</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomAvailabilityModal;
