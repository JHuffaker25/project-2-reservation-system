import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface DateRangeCalendarProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  onChange?: (dates: { checkInDate: Date | null; checkOutDate: Date | null }) => void;
  disabled?: boolean;
}

export default function DateRangeCalendar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
  onChange,
  disabled = false,
}: DateRangeCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startDate || new Date());
  const gridRef = useRef<HTMLDivElement>(null);

  // Helper functions
  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const isDateInRange = (date: Date): boolean => {
    if (!startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };
  const isStartDate = (date: Date): boolean =>
    !!startDate && date.toDateString() === startDate.toDateString();
  const isEndDate = (date: Date): boolean =>
    !!endDate && date.toDateString() === endDate.toDateString();
  const isDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Handle date selection logic
  const handleDateClick = (date: Date) => {
    if (disabled) return;
    let newCheckIn = startDate;
    let newCheckOut = endDate;

    if (startDate && date.toDateString() === startDate.toDateString()) {
      onStartDateChange(null);
      newCheckIn = null;
      if (onChange) onChange({ checkInDate: null, checkOutDate: endDate });
      return;
    }
    if (endDate && date.toDateString() === endDate.toDateString()) {
      onEndDateChange(null);
      newCheckOut = null;
      if (onChange) onChange({ checkInDate: startDate, checkOutDate: null });
      return;
    }
    if (!startDate && endDate) {
      if (date < endDate) {
        onStartDateChange(date);
        newCheckIn = date;
      } else if (date > endDate) {
        onStartDateChange(endDate);
        onEndDateChange(date);
        newCheckIn = endDate;
        newCheckOut = date;
      }
      if (onChange) onChange({ checkInDate: newCheckIn, checkOutDate: newCheckOut });
      return;
    }
    if (startDate && !endDate) {
      if (date > startDate) {
        onEndDateChange(date);
        newCheckOut = date;
      } else {
        onStartDateChange(date);
        onEndDateChange(null);
        newCheckIn = date;
        newCheckOut = null;
      }
      if (onChange) onChange({ checkInDate: newCheckIn, checkOutDate: newCheckOut });
      return;
    }
    if (startDate && endDate) {
      if (date < startDate) {
        onStartDateChange(date);
        newCheckIn = date;
      } else if (date > startDate) {
        onEndDateChange(date);
        newCheckOut = date;
      }
      if (onChange) onChange({ checkInDate: newCheckIn, checkOutDate: newCheckOut });
      return;
    }
    onStartDateChange(date);
    onEndDateChange(null);
    newCheckIn = date;
    newCheckOut = null;
    if (onChange) onChange({ checkInDate: newCheckIn, checkOutDate: newCheckOut });
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, day: Date | null, idx: number) => {
    if (!day || isDisabled(day)) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDateClick(day);
    }
    // Arrow navigation
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const buttons = gridRef.current?.querySelectorAll('button:not(:disabled)');
      if (!buttons) return;
      let nextIdx = idx;
      if (e.key === 'ArrowLeft') nextIdx = idx - 1;
      if (e.key === 'ArrowRight') nextIdx = idx + 1;
      if (e.key === 'ArrowUp') nextIdx = idx - 7;
      if (e.key === 'ArrowDown') nextIdx = idx + 7;
      if (nextIdx >= 0 && nextIdx < buttons.length) {
        (buttons[nextIdx] as HTMLButtonElement).focus();
      }
    }
  };

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
    <div className="w-full space-y-4" aria-disabled={disabled}>
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-muted rounded-md transition-colors cursor-pointer"
          aria-label="Previous month"
          disabled={disabled}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-semibold text-lg" aria-live="polite">{monthYear}</p>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-muted rounded-md transition-colors cursor-pointer"
          aria-label="Next month"
          disabled={disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-3">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2" aria-hidden="true">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2" ref={gridRef}>
        {days.map((day, idx) => {
          const disabledDay = !day || isDisabled(day) || disabled;
          const inRange = day && isDateInRange(day);
          const start = day && isStartDate(day);
          const end = day && isEndDate(day);
          return (
            <button
              key={idx}
              type="button"
              tabIndex={disabledDay ? -1 : 0}
              aria-label={day ? day.toLocaleDateString() : undefined}
              aria-disabled={disabledDay}
              aria-selected={!!(start || end)}
              onClick={() => day && !disabledDay && handleDateClick(day)}
              onKeyDown={(e) => handleKeyDown(e, day, idx)}
              disabled={disabledDay}
              className={`py-2 px-1 text-sm rounded-md transition-all cursor-pointer outline-none ${
                disabledDay
                  ? 'text-muted-foreground opacity-50 cursor-not-allowed'
                  : start || end
                  ? 'bg-primary text-white font-semibold hover:bg-primary/90'
                  : inRange
                  ? 'bg-primary/20 text-foreground hover:bg-primary/30'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              {day?.getDate()}
            </button>
          );
        })}
      </div>
      {/* {(startDate || endDate) && (
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
      )} */}
    </div>
  );
}
