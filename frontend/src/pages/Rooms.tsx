import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wifi, Tv, Wine, Wind, Coffee, Calendar, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

// Sample room data
const rooms = [
  {
    id: 1,
    name: 'Standard Room',
    type: 'Standard',
    squareFootage: 250,
    maxGuests: 2,
    price: 99,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
    amenities: ['Wi-Fi', 'TV', 'Mini-bar'],
    description: 'Cozy room perfect for couples',
  },
  {
    id: 2,
    name: 'Deluxe Room',
    type: 'Deluxe',
    squareFootage: 350,
    maxGuests: 2,
    price: 149,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop',
    amenities: ['Wi-Fi', 'TV', 'Mini-bar', 'Air Conditioning'],
    description: 'Spacious room with premium amenities',
  },
  {
    id: 3,
    name: 'Suite',
    type: 'Suite',
    squareFootage: 500,
    maxGuests: 4,
    price: 249,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    amenities: ['Wi-Fi', 'TV', 'Mini-bar', 'Air Conditioning', 'Coffee Maker'],
    description: 'Luxurious suite with separate living area',
  },
  {
    id: 4,
    name: 'Family Room',
    type: 'Family',
    squareFootage: 450,
    maxGuests: 6,
    price: 199,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop',
    amenities: ['Wi-Fi', 'TV', 'Mini-bar', 'Air Conditioning'],
    description: 'Perfect for families with multiple beds',
  },
  {
    id: 5,
    name: 'Ocean View Room',
    type: 'Ocean View',
    squareFootage: 320,
    maxGuests: 2,
    price: 179,
    image: 'https://images.unsplash.com/photo-1609602126247-4ab7188b4aa1?w=400&h=300&fit=crop',
    amenities: ['Wi-Fi', 'TV', 'Mini-bar', 'Air Conditioning'],
    description: 'Stunning ocean views from your balcony',
  },
  {
    id: 6,
    name: 'Penthouse',
    type: 'Penthouse',
    squareFootage: 800,
    maxGuests: 8,
    price: 499,
    image: 'https://images.unsplash.com/photo-1645916540716-42cca809ac9c?w=400&h=300&fit=crop',
    amenities: ['Wi-Fi', 'TV', 'Mini-bar', 'Air Conditioning', 'Coffee Maker'],
    description: 'Top-floor luxury penthouse with panoramic views',
  },
];


// Amenity icon mapper
const AmenityIcon = ({ amenity }: { amenity: string }) => {
  const iconProps = { className: 'w-4 h-4' };
  
  switch (amenity) {
    case 'Wi-Fi':
      return <Wifi {...iconProps} />;
    case 'TV':
      return <Tv {...iconProps} />;
    case 'Mini-bar':
      return <Wine {...iconProps} />;
    case 'Air Conditioning':
      return <Wind {...iconProps} />;
    case 'Coffee Maker':
      return <Coffee {...iconProps} />;
    default:
      return null;
  }
};

// Room Card Component
const RoomCard = ({ room }: { room: typeof rooms[0] }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300 pt-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative w-full h-54 overflow-hidden bg-gray-200">
        <img
          src={room.image}
          alt={room.name}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
        />
        <div className="absolute top-3 right-3 bg-muted text-primary px-3 py-1 rounded-full text-xs font-semibold">
          {room.type}
        </div>
      </div>

      {/* Content */}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{room.name}</CardTitle>
        <CardDescription>{room.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-4">
        {/* Room Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="border-l-2 border-primary pl-3">
            <p className="text-muted-foreground">Size</p>
            <p className="font-semibold">{room.squareFootage} sq ft</p>
          </div>
          <div className="border-l-2 border-primary pl-3">
            <p className="text-muted-foreground">Guests</p>
            <p className="font-semibold">Up to {room.maxGuests}</p>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-col flex-1 mt-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {room.amenities.map((amenity) => (
              <div
                key={amenity}
                className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg text-xs"
              >
                <AmenityIcon amenity={amenity} />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price and CTA */}
        <div className="border-t pt-4 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs">Per Night</p>
            <p className="text-2xl font-bold text-primary">${room.price}</p>
          </div>
          <Button size="sm" className="shrink-0 cursor-pointer">
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Calendar Component with date range selection
const RangeCalendar = ({
  checkInDate,
  checkOutDate,
  onCheckInChange,
  onCheckOutChange,
}: {
  checkInDate: Date | null;
  checkOutDate: Date | null;
  onCheckInChange: (date: Date) => void;
  onCheckOutChange: (date: Date) => void;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateInRange = (date: Date): boolean => {
    if (!checkInDate || !checkOutDate) return false;
    return date > checkInDate && date < checkOutDate;
  };

  const isStartDate = (date: Date): boolean => {
    return checkInDate ? date.toDateString() === checkInDate.toDateString() : false;
  };

  const isEndDate = (date: Date): boolean => {
    return checkOutDate ? date.toDateString() === checkOutDate.toDateString() : false;
  };

  const isTodayOrLater = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const handleDateClick = (date: Date) => {
    if (!checkInDate) {
      onCheckInChange(date);
    } else if (!checkOutDate) {
      if (date > checkInDate) {
        onCheckOutChange(date);
      } else {
        onCheckInChange(date);
        onCheckOutChange(null as any);
      }
    } else {
      onCheckInChange(date);
      onCheckOutChange(null as any);
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
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-semibold text-lg">{monthYear}</p>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-muted rounded-md transition-colors"
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
          const isRangeStart = isStart;
          const isRangeEnd = isEnd;

          return (
            <button
              key={idx}
              onClick={() => day && !isDisabled && handleDateClick(day)}
              disabled={isDisabled}
              className={`py-2 px-1 text-sm rounded-md transition-all ${
                isDisabled
                  ? 'text-muted-foreground opacity-50 cursor-not-allowed'
                  : isRangeStart || isRangeEnd
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
      {(checkInDate || checkOutDate) && (
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Check-in: </span>
            <span className="font-semibold">
              {checkInDate ? checkInDate.toLocaleDateString() : 'Not selected'}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Check-out: </span>
            <span className="font-semibold">
              {checkOutDate ? checkOutDate.toLocaleDateString() : 'Not selected'}
            </span>
          </div>
          {checkInDate && checkOutDate && (
            <div className="text-sm pt-2 border-t">
              <span className="text-muted-foreground">Duration: </span>
              <span className="font-semibold">
                {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))} nights
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// SearchBar component styled like Transactions page
const SearchBar = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
  <div className="relative lg:col-span-2">
    <svg
      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
    </svg>
    <input
      type="text"
      placeholder="Search by room name or description..."
      className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

// Improved Filter Panel Component with SearchBar
const FilterPanel = ({
  filters,
  onFilterChange,
  searchQuery,
  onSearch,
}: {
  filters: {
    checkInDate: Date | null;
    checkOutDate: Date | null;
    roomType: string;
    guests: number;
  };
  onFilterChange: (newFilters: typeof filters) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}) => {
  const roomTypes = ['All Types', 'Standard', 'Deluxe', 'Suite', 'Family', 'Ocean View', 'Penthouse'];
  const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  const clearAllFilters = () => {
    onFilterChange({
      checkInDate: null,
      checkOutDate: null,
      roomType: '',
      guests: 2,
    });
    onSearch('');
  };

  const hasActiveFilters =
    filters.checkInDate || filters.checkOutDate || filters.roomType || filters.guests !== 2 || searchQuery;

  return (
    <Card className="border-2 shadow-sm gap-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Find Your Perfect Room</CardTitle>
            <CardDescription>Filter by name, dates, room type, and number of guests</CardDescription>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* SearchBar at the top */}
          

          {/* Date Range Picker */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Check-in & Check-out Dates</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-10 cursor-pointer"
                >
                  <Calendar className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {filters.checkInDate && filters.checkOutDate
                      ? `${filters.checkInDate.toLocaleDateString()} - ${filters.checkOutDate.toLocaleDateString()}`
                      : filters.checkInDate
                        ? `From ${filters.checkInDate.toLocaleDateString()}`
                        : 'Select dates'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4">
                  <RangeCalendar
                    checkInDate={filters.checkInDate}
                    checkOutDate={filters.checkOutDate}
                    onCheckInChange={(date) =>
                      onFilterChange({ ...filters, checkInDate: date })
                    }
                    onCheckOutChange={(date) =>
                      onFilterChange({ ...filters, checkOutDate: date })
                    }
                  />
                </div>
                {filters.checkInDate || filters.checkOutDate ? (
                  <div className="border-t p-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onFilterChange({ ...filters, checkInDate: null, checkOutDate: null })}
                      className="flex-1"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                ) : null}
              </PopoverContent>
            </Popover>
            
          </div>

          {/* Room Type Dropdown */}
          <div className="space-y-2">
            <label htmlFor="room-type" className="text-sm font-semibold">
              Room Type
            </label>
            <div className="relative">
              <select
                id="room-type"
                value={filters.roomType}
                onChange={(e) => onFilterChange({ ...filters, roomType: e.target.value })}
                className="w-full px-3 py-2 h-10 border border-input rounded-md bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {roomTypes.map((type) => (
                  <option key={type} value={type === 'All Types' ? '' : type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          {/* Guest Count Dropdown */}
          <div className="space-y-2">
            <label htmlFor="guests" className="text-sm font-semibold">
              Number of Guests
            </label>
            <div className="relative">
              <select
                id="guests"
                value={filters.guests}
                onChange={(e) => onFilterChange({ ...filters, guests: parseInt(e.target.value) })}
                className="w-full px-3 py-2 h-10 border border-input rounded-md bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {guestOptions.map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          {/* Search/Apply Button */}
          <div className="flex items-end">
            <Button
              onClick={() => {
                // Real-time filtering is applied, this can trigger analytics or API calls
              }}
              className="w-full h-10 cursor-pointer"
            >
              Search Rooms
            </Button>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-4">
          <SearchBar value={searchQuery} onChange={onSearch} />
        </div>
      </CardContent>
    </Card>
  );
};

// Main Rooms Page

export default function Rooms() {
  const [filters, setFilters] = useState({
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    roomType: '',
    guests: 2,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Filter rooms based on criteria and search
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Search filter by name or description
      const searchLower = searchQuery.toLowerCase();
      if (
        searchLower &&
        !room.name.toLowerCase().includes(searchLower) &&
        !room.description.toLowerCase().includes(searchLower)
      ) {
        return false;
      }

      // Filter by room type
      if (filters.roomType && room.type !== filters.roomType) {
        return false;
      }

      // Filter by guest count
      if (room.maxGuests < filters.guests) {
        return false;
      }

      // If both dates are selected, you could add availability checking here
      // For now, we'll just show the filtered rooms
      return true;
    });
  }, [filters, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="py-12 px-4 md:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Our Rooms & Suites</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Choose from our selection of elegantly designed rooms for your perfect stay.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Filter Panel - Properly Aligned */}
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
          />

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredRooms.length}</span> room{filteredRooms.length !== 1 ? 's' : ''}
                {filters.checkInDate && filters.checkOutDate && (
                  <span>
                    {' '}
                    from {filters.checkInDate.toLocaleDateString()} to{' '}
                    {filters.checkOutDate.toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Rooms Grid */}
          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-muted-foreground text-lg mb-4">
                No rooms match your criteria. Please adjust your filters.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    checkInDate: null,
                    checkOutDate: null,
                    roomType: '',
                    guests: 2,
                  });
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
