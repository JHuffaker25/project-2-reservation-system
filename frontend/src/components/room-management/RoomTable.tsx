import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table, TableHeader, TableBody, TableCell, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Ban, CheckCircle2, ChevronDown, Edit, Plus, Trash2, Calendar } from 'lucide-react';
import type { Room, RoomType } from '../../types/types';

interface RoomTableProps {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
  roomTypes: RoomType[];
  setAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onViewAvailability?: (room: Room) => void; // Optional callback for viewing availability
}

const RoomTable = ({ rooms, onEdit, onDelete, roomTypes, setAddModalOpen, onViewAvailability }: RoomTableProps) => {
  const [sort, setSort] = React.useState<{ key: 'roomNumber' | 'type' | 'status'; direction: 'asc' | 'desc' }>({ key: 'roomNumber', direction: 'asc' });

  const sortedRooms = React.useMemo(() => {
    const sorted = [...rooms];
    sorted.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sort.key) {
        case 'roomNumber':
          aVal = Number(a.roomNumber);
          bVal = Number(b.roomNumber);
          break;
        case 'type':
          aVal = roomTypes.find(rt => rt.id === a.typeId)?.name || '';
          bVal = roomTypes.find(rt => rt.id === b.typeId)?.name || '';
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
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
  }, [rooms, sort, roomTypes]);

  const getChevron = (key: string) => {
    if (sort.key !== key) return <ChevronDown className="inline h-4 w-4 text-muted-foreground opacity-50" />;
    return sort.direction === 'asc' ? <ChevronDown className="inline h-4 w-4 text-muted-foreground rotate-180" /> : <ChevronDown className="inline h-4 w-4 text-muted-foreground" />;
  };

  const handleSort = (key: 'roomNumber' | 'type' | 'status') => {
    setSort(prev => prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' });
  };

  return (
    <>
      <Card className="gap-0">
        <CardHeader>
          <CardTitle className="justify-between flex">Hotel Rooms
            <Button size="sm" variant="outline" onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Room
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="cursor-pointer select-none" onClick={() => handleSort('roomNumber')}>
                  Room Number {getChevron('roomNumber')}
                </TableCell>
                <TableCell className="cursor-pointer select-none" onClick={() => handleSort('type')}>
                  Type {getChevron('type')}
                </TableCell>
                <TableCell className="text-right cursor-pointer select-none" onClick={() => handleSort('status')}>
                  Status {getChevron('status')}
                </TableCell>
                <TableCell className="text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRooms.map(room => (
                <TableRow key={room.id} className="">
                  <TableCell>{room.roomNumber}</TableCell>
                  <TableCell>{roomTypes.find(rt => rt.id === room.typeId)?.name || 'Unassigned'}</TableCell>
                  <TableCell className="text-right">{room.status === "AVAILABLE" ? <span className="text-green-600 font-semibold flex items-center justify-end gap-1">Available<CheckCircle2 className="h-4 w-4" /></span> : <span className="text-red-600 font-semibold flex items-center justify-end gap-1"><Ban className="h-4 w-4" /> Unavailable</span>}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => onViewAvailability && onViewAvailability(room)} title="View Availability">
                        <Calendar className="h-4 w-4" />
                        <span className="sr-only">View Availability</span>
                      </Button>
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
    </>
  );
};

export default RoomTable;
