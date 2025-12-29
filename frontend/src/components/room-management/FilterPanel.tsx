// FilterPanel component extracted from UpdateRooms.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ChevronDown, Search } from 'lucide-react';
import type { RoomType } from '../../types/types';

interface FilterPanelProps {
  search: string;
  onSearch: (val: string) => void;
  filters: {
    available: string;
    priceMin: string;
    priceMax: string;
    amenity: string;
    roomType: string;
    floor: string;
  };
  onFilterChange: (filters: any) => void;
  roomTypes: RoomType[];
  floorOptions: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  search,
  onSearch,
  filters,
  onFilterChange,
  roomTypes,
  floorOptions,
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
            placeholder="Search by room number or type..."
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
        {/* Availability Filter */}
        <div className="relative">
          <select
            value={filters.available}
            onChange={e => onFilterChange({ ...filters, available: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            <option value="">All Availability</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        </div>
        {/* Room Type Filter */}
        <div className="relative">
          <select
            value={filters.roomType}
            onChange={e => onFilterChange({ ...filters, roomType: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            <option value="">All Room Types</option>
            {roomTypes.map(rt => (
              <option key={rt.id} value={rt.id}>{rt.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        </div>
        {/* Floor Filter */}
        <div className="relative">
          <select
            value={filters.floor}
            onChange={e => onFilterChange({ ...filters, floor: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            <option value="">All Floors</option>
            {floorOptions.map(floor => (
              <option key={floor} value={floor}>{floor}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default FilterPanel;
