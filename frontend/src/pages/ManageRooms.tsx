import React, { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, X, Plus, Edit, Trash2, Image as ImageIcon, CheckCircle2, Ban, ChevronDown, Search } from 'lucide-react';

// Dummy amenities and room types
const allAmenities = [
  { name: 'Wi-Fi', icon: <CheckCircle2 className="h-4 w-4" /> },
  { name: 'TV', icon: <CheckCircle2 className="h-4 w-4" /> },
  { name: 'Mini-bar', icon: <CheckCircle2 className="h-4 w-4" /> },
  { name: 'Air Conditioning', icon: <CheckCircle2 className="h-4 w-4" /> },
  { name: 'Coffee Maker', icon: <CheckCircle2 className="h-4 w-4" /> },
];

const dummyRoomTypes = [
  {
    id: 'type1',
    name: 'Standard',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&h=150&fit=crop',
    amenities: ['Wi-Fi', 'TV', 'Mini-bar'],
  },
  {
    id: 'type2',
    name: 'Deluxe',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=200&h=150&fit=crop',
    amenities: ['Wi-Fi', 'TV', 'Mini-bar', 'Air Conditioning'],
  },
  {
    id: 'type3',
    name: 'Suite',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&h=150&fit=crop',
    amenities: ['Wi-Fi', 'TV', 'Mini-bar', 'Air Conditioning', 'Coffee Maker'],
  },
];

const dummyRooms = [
  {
    id: 'room101',
    number: '101',
    type: 'Standard',
    price: 99,
    amenities: ['Wi-Fi', 'TV', 'Mini-bar'],
    available: true,
    image: dummyRoomTypes[0].image,
  },
  {
    id: 'room201',
    number: '201',
    type: 'Deluxe',
    price: 149,
    amenities: ['Wi-Fi', 'TV', 'Mini-bar', 'Air Conditioning'],
    available: false,
    image: dummyRoomTypes[1].image,
  },
  {
    id: 'room305',
    number: '305',
    type: 'Suite',
    price: 249,
    amenities: ['Wi-Fi', 'TV', 'Mini-bar', 'Air Conditioning', 'Coffee Maker'],
    available: true,
    image: dummyRoomTypes[2].image,
  },
];

// FilterPanel
const FilterPanel = ({
  search,
  onSearch,
  filters,
  onFilterChange,
}: {
  search: string;
  onSearch: (val: string) => void;
  filters: {
    available: string;
    priceMin: string;
    priceMax: string;
    amenity: string;
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

        {/* Amenity Filter */}
        <div className="relative">
          <select
            value={filters.amenity}
            onChange={e => onFilterChange({ ...filters, amenity: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            <option value="">All Amenities</option>
            {allAmenities.map(a => (
              <option key={a.name} value={a.name}>{a.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        </div>

        {/* Price Range */}
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            min={0}
            placeholder="Min $"
            value={filters.priceMin}
            onChange={e => onFilterChange({ ...filters, priceMin: e.target.value })}
            className="w-full"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            min={0}
            placeholder="Max $"
            value={filters.priceMax}
            onChange={e => onFilterChange({ ...filters, priceMax: e.target.value })}
            className="w-full"
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Room Table
const RoomTable = ({ rooms, onEdit, onDelete, selected, onSelect }: {
  rooms: typeof dummyRooms;
  onEdit: (room: any) => void;
  onDelete: (id: string) => void;
  selected: string[];
  onSelect: (ids: string[]) => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Rooms</CardTitle>
    </CardHeader>
    <CardContent className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell><Checkbox checked={selected.length === rooms.length && rooms.length > 0} onCheckedChange={checked => onSelect(checked ? rooms.map(r => r.id) : [])} /></TableCell>
            <TableCell>Room Number</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Amenities</TableCell>
            <TableCell>Availability</TableCell>
            <TableCell>Image</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map(room => (
            <TableRow key={room.id} className="">
              <TableCell><Checkbox checked={selected.includes(room.id)} onCheckedChange={checked => onSelect(checked ? [...selected, room.id] : selected.filter(id => id !== room.id))} /></TableCell>
              <TableCell>{room.number}</TableCell>
              <TableCell>{room.type}</TableCell>
              <TableCell>${room.price}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {room.amenities.map(a => (
                    <span key={a} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs">{a}</span>
                  ))}
                </div>
              </TableCell>
              <TableCell>{room.available ? <span className="text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Available</span> : <span className="text-red-600 font-semibold flex items-center gap-1"><Ban className="h-4 w-4" /> Unavailable</span>}</TableCell>
              <TableCell><img src={room.image} alt={room.type} className="w-16 h-12 object-cover rounded" /></TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(room)}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(room.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rooms.length === 0 && <div className="text-center py-8 text-muted-foreground">No rooms found.</div>}
    </CardContent>
  </Card>
);

// Room Types Section
const RoomTypesSection = ({ roomTypes, rooms, onEditType, onAddType }: {
  roomTypes: typeof dummyRoomTypes;
  rooms: typeof dummyRooms;
  onEditType: (type: any) => void;
  onAddType: () => void;
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">Room Types</h2>
      <Button size="sm" variant="outline" onClick={onAddType}><Plus className="h-4 w-4 mr-1" /> Add Type</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roomTypes.map(type => {
        const count = rooms.filter(r => r.type === type.name).length;
        return (
          <Card key={type.id} className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <img src={type.image} alt={type.name} className="w-16 h-12 object-cover rounded" />
                <div>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                  <CardDescription>{count} room{count !== 1 ? 's' : ''}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-2">
                {type.amenities.map(a => (
                  <span key={a} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs">{a}</span>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={() => onEditType(type)}><Edit className="h-4 w-4 mr-1" /> Edit Type</Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
);

// Add/Edit Room Modal
const AddEditRoomModal = ({ open, room, onClose, onSave, roomTypes }: {
  open: boolean;
  room: any;
  onClose: () => void;
  onSave: (room: any) => void;
  roomTypes: typeof dummyRoomTypes;
}) => {
  const [form, setForm] = useState(room || {
    id: '',
    number: '',
    type: roomTypes[0]?.name || '',
    price: '',
    amenities: [],
    available: true,
    image: roomTypes[0]?.image || '',
  });
  // Validate uniqueness and price
  const isValid = form.number && form.type && form.price && Number(form.price) > 0;
  return (
    <Dialog open={open} onOpenChange={val => { if (!val) onClose(); }}>
      <DialogContent className="max-w-lg mx-auto">
        <Card className="shadow-none border-none">
          <CardHeader>
            <CardTitle>{room ? 'Edit Room' : 'Add Room'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Room Number</label>
              <Input
                value={form.number}
                onChange={e => setForm({ ...form, number: e.target.value })}
                placeholder="Room Number"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Room Type</label>
              <select
                className="w-full px-3 py-2 h-10 border border-input rounded-md bg-background text-foreground text-sm"
                value={form.type}
                onChange={e => {
                  const selectedType = roomTypes.find(t => t.name === e.target.value);
                  setForm({ ...form, type: e.target.value, image: selectedType?.image || form.image });
                }}
              >
                {roomTypes.map(type => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Price per Night</label>
              <Input
                type="number"
                min={1}
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="Price"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {allAmenities.map(a => (
                  <label key={a.name} className="flex items-center gap-1 cursor-pointer">
                    <Checkbox
                      checked={form.amenities.includes(a.name)}
                      onCheckedChange={checked => {
                        setForm({
                          ...form,
                          amenities: checked
                            ? [...form.amenities, a.name]
                            : form.amenities.filter((am: string) => am !== a.name),
                        });
                      }}
                    />
                    {a.icon}
                    <span className="text-xs">{a.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold">Availability</label>
              <Checkbox
                checked={form.available}
                onCheckedChange={checked => setForm({ ...form, available: checked })}
                className="ml-2"
              />
              <span className="ml-2 text-xs">{form.available ? 'Available' : 'Unavailable'}</span>
            </div>
            <div>
              <label className="text-sm font-semibold">Image</label>
              <div className="flex items-center gap-2">
                <img src={form.image} alt="Room" className="w-16 h-12 object-cover rounded" />
                <Button size="sm" variant="outline">
                  <ImageIcon className="h-4 w-4 mr-1" /> Upload
                </Button>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button disabled={!isValid} onClick={() => onSave(form)}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

// Main ManageRooms page
const PAGE_SIZE = 5;
const ManageRooms: React.FC = () => {
  const [rooms, setRooms] = useState(dummyRooms);
  const [roomTypes, setRoomTypes] = useState(dummyRoomTypes);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    available: '',
    priceMin: '',
    priceMax: '',
    amenity: '',
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<any | null>(null);
  const [editTypeModalOpen, setEditTypeModalOpen] = useState(false);
  const [editType, setEditType] = useState<any | null>(null);
  const [page, setPage] = useState(1);

  // Filtering
  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      // Search
      const searchLower = search.toLowerCase();
      if (
        searchLower &&
        !r.number.toLowerCase().includes(searchLower) &&
        !r.type.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
      // Availability
      if (filters.available && String(r.available) !== filters.available) {
        return false;
      }
      // Price
      if (filters.priceMin && r.price < Number(filters.priceMin)) {
        return false;
      }
      if (filters.priceMax && r.price > Number(filters.priceMax)) {
        return false;
      }
      // Amenity
      if (filters.amenity && !r.amenities.includes(filters.amenity)) {
        return false;
      }
      return true;
    });
  }, [rooms, search, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / PAGE_SIZE);
  const paginatedRooms = filteredRooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Room actions
  const handleEditRoom = (room: any) => {
    setEditRoom(room);
    setEditModalOpen(true);
  };
  const handleSaveRoom = (room: any) => {
    // Uniqueness validation
    if (
      rooms.some(r => r.number === room.number && r.id !== room.id)
    ) {
      alert('Room number must be unique.');
      return;
    }
    if (room.id) {
      setRooms(rooms.map(r => (r.id === room.id ? { ...room } : r)));
    } else {
      setRooms([...rooms, { ...room, id: `room${room.number}` }]);
    }
    setEditModalOpen(false);
    setEditRoom(null);
  };
  const handleDeleteRoom = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
    setSelected(selected.filter(sid => sid !== id));
  };
  const handleBulkUnavailable = () => {
    setRooms(rooms.map(r => selected.includes(r.id) ? { ...r, available: false } : r));
    setSelected([]);
  };

  // Room type actions (dummy, not full modal)
  const handleEditType = (type: any) => {
    setEditType(type);
    setEditTypeModalOpen(true);
  };
  const handleAddType = () => {
    setEditType(null);
    setEditTypeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-12 px-4 md:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Manage Rooms</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            View, add, edit, and manage all hotel rooms and room types.
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

          {/* Bulk Actions */}
          {selected.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm">{selected.length} selected</span>
              <Button size="sm" variant="destructive" onClick={handleBulkUnavailable}>Mark as Unavailable</Button>
            </div>
          )}

          {/* Room Table */}
          <RoomTable
            rooms={paginatedRooms}
            onEdit={handleEditRoom}
            onDelete={handleDeleteRoom}
            selected={selected}
            onSelect={setSelected}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 text-sm">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Room Types Section */}
          <RoomTypesSection
            roomTypes={roomTypes}
            rooms={rooms}
            onEditType={handleEditType}
            onAddType={handleAddType}
          />
        </div>
      </div>
      {/* Add/Edit Room Modal */}
      <AddEditRoomModal
        open={editModalOpen}
        room={editRoom}
        onClose={() => { setEditModalOpen(false); setEditRoom(null); }}
        onSave={handleSaveRoom}
        roomTypes={roomTypes}
      />
      {/* Dummy Room Type Modal (not implemented) */}
      {/* You can add a similar modal for room type editing/adding if needed */}
    </div>
  );
};

export default ManageRooms;
