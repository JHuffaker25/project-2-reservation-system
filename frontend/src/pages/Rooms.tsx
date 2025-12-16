import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronDown } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { setRoomTypes } from '@/features/roomType/roomTypeSlice';
import { useGetRoomTypesQuery } from '@/features/roomType/roomTypeApi';
import type { RoomType } from '@/features/roomType/roomTypeSlice';
import Loader from '@/components/loader';
import { useNavigate } from 'react-router';
import AmenityIcon from '@/components/amenity-icon';

const RoomCard: React.FC<RoomType> = ({ id, name, description, images, amenities, squareFootage, maxGuests, pricePerNight }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  return (
    <Card
      className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300 pt-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-54 overflow-hidden bg-gray-200">
        <img
          src={images[0]}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="border-l-2 border-primary pl-3">
            <p className="text-muted-foreground">Size</p>
            <p className="font-semibold">{squareFootage} sq ft</p>
          </div>
          <div className="border-l-2 border-primary pl-3">
            <p className="text-muted-foreground">Guests</p>
            <p className="font-semibold">Up to {maxGuests}</p>
          </div>
        </div>
        <div className="flex flex-col flex-1 mt-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg text-xs">
                <AmenityIcon amenity={amenity} />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t pt-4 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs">Per Night</p>
            <p className="text-2xl font-bold text-primary">${pricePerNight}</p>
          </div>
          <Button size="sm" className="shrink-0 cursor-pointer" onClick={() => navigate(`/rooms/${id}/book`)}>
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SearchBar = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
  <div className="relative w-full col-span-3">
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

const FilterPanel = ({
  filters,
  onFilterChange,
  searchQuery,
  onSearch,
  sortBy,
  onSortByChange,
}: {
  filters: {
    checkInDate: Date | null;
    checkOutDate: Date | null;
    guests: number;
  };
  onFilterChange: (newFilters: typeof filters) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
}) => {

  const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  const sortOptions = [
    { label: 'Name', value: 'name' },
    { label: 'Price', value: 'price' },
    { label: 'Square Footage', value: 'squareFootage' },
  ];

  const clearAllFilters = () => {
    onFilterChange({
      checkInDate: null,
      checkOutDate: null,
      guests: 2,
    });
    onSearch('');
    onSortByChange('name');
  };

  const hasActiveFilters =
    filters.checkInDate || filters.checkOutDate || filters.guests !== 2 || searchQuery || sortBy !== 'name';

  return (
    <Card className="border-2 shadow-sm gap-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Find Your Perfect Room</CardTitle>
            <CardDescription className="mt-1">Search and filter available room types.</CardDescription>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">

          <SearchBar value={searchQuery} onChange={onSearch} />

          <div className="space-y-2">
            <label htmlFor="sort-by" className="text-sm font-semibold">
              Sort By
            </label>
            <div className="relative col-span-2 lg:col-span-1">
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="w-full px-3 py-2 h-10 border border-input rounded-md bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2 col-span-2 lg:col-span-1">
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

        </div>
      </CardContent>
    </Card>
  );
};

export default function Rooms() {
  const { data: roomTypes, isLoading } = useGetRoomTypesQuery();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (roomTypes) {
      dispatch(setRoomTypes(roomTypes));
    }
  }, [roomTypes]);

  const [filters, setFilters] = useState({
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    guests: 2,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Filter and sort rooms based on criteria and search
  const filteredRooms: RoomType[] = useMemo(() => {
    let rooms = roomTypes?.filter((roomType) => {

      // Search filter by name or description
      const searchLower = searchQuery.toLowerCase();
      if (
        searchLower &&
        !roomType.name.toLowerCase().includes(searchLower) &&
        !roomType.description.toLowerCase().includes(searchLower)
      ) {
        return false;
      }

      // Filter by guest count
      if (roomType.maxGuests < filters.guests) {
        return false;
      }

      return true;
    }) ?? [];

    // Sorting
    if (sortBy === 'name') {
      rooms = rooms.slice().sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price') {
      rooms = rooms.slice().sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortBy === 'squareFootage') {
      rooms = rooms.slice().sort((a, b) => a.squareFootage - b.squareFootage);
    }
    return rooms;
  }, [filters, searchQuery, roomTypes, sortBy]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-12 px-4 md:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Our Rooms & Suites</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Choose from our selection of elegantly designed rooms for your perfect stay.
          </p>
        </div>
      </div>

      <div className="py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredRooms?.length}</span> room{filteredRooms?.length !== 1 ? 's' : ''}
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

          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((roomType: RoomType) => (
                <RoomCard key={roomType.id} {...roomType} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-muted-foreground text-lg mb-4">
                No rooms match your criteria. Please adjust your filters.
              </p>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  setFilters({
                    checkInDate: null,
                    checkOutDate: null,
                    guests: 2,
                  });
                  setSearchQuery('');
                  setSortBy('name');
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
