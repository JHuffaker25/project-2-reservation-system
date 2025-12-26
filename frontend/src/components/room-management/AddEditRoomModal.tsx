// AddEditRoomModal component extracted from UpdateRooms.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import type { RoomType } from '../../types/types';
import { Button } from '../ui/button';

interface AddEditRoomModalProps {
  open: boolean;
  room: any;
  onClose: () => void;
  onSave: (room: any) => void;
  roomTypes: RoomType[];
  isSaving?: boolean;
  error?: string | null;
  setAddRoomError?: (err: string | null) => void;
  rooms?: any[]; // Pass all rooms for validation
}

const AddEditRoomModal = ({ open, room, onClose, onSave, roomTypes, isSaving, error, setAddRoomError, rooms = [] }: AddEditRoomModalProps) => {
    const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState(() => {
    if (room) return room;
    return {
      id: '',
      roomNumber: '',
      typeId: roomTypes[0]?.id || '',
      status: 'AVAILABLE',
      datesReserved: [],
    };
  });

  // Reset form when room changes (for editing different rooms)
  useEffect(() => {
    if (room) {
      setForm(room);
    } else {
      setForm({
        id: '',
        roomNumber: '',
        typeId: roomTypes[0]?.id || '',
        status: 'AVAILABLE',
        datesReserved: [],
      });
    }
  }, [room, roomTypes]);

  // Update form.typeId if roomTypes changes and no type is selected
  useEffect(() => {
    if (!form.typeId && roomTypes.length > 0) {
      setForm((f: any) => ({ ...f, typeId: roomTypes[0].id }));
    }
  }, [roomTypes]);
  // Live duplicate check as user types
  useEffect(() => {
    if (!form.roomNumber) {
      setLocalError(null);
      return;
    }
    // Allow a room to reuse its own number when editing
    const isDuplicate = rooms.some((r) => {
      const sameNumber = String(r.roomNumber).trim().toLowerCase() === String(form.roomNumber).trim().toLowerCase();
      // If editing, allow the current room to reuse its own number (handle id type coercion)
      if (room && r.id != null && room.id != null && String(r.id) === String(room.id)) return false;
      return sameNumber;
    });
    if (isDuplicate) {
      setLocalError('A room with this number already exists.');
    } else {
      setLocalError(null);
    }
  }, [form.roomNumber, rooms, room]);
  const isValid = form.roomNumber && form.typeId && form.status && !localError;
  return (
    <Dialog open={open} onOpenChange={val => { if (!val) onClose(); }}>
      <DialogContent className="max-w-lg mx-auto">
        {/* Accessible DialogTitle and DialogDescription for screen readers */}
        <DialogTitle>{room ? 'Edit Room' : 'Add Room'}</DialogTitle>
        <DialogDescription>
          {room ? 'Edit the details for this room.' : 'Enter the details for the new room.'}
        </DialogDescription>
        <Card className="shadow-none border-none">
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Room Number</label>
              <Input
                value={form.roomNumber}
                onChange={e => {
                  setForm({ ...form, roomNumber: e.target.value });
                  if (setAddRoomError) setAddRoomError(null);
                }}
                placeholder="Room Number"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Room Type</label>
              <select
                className="w-full px-3 py-2 h-10 border border-input rounded-md bg-background text-foreground text-sm"
                value={form.typeId}
                onChange={e => setForm({ ...form, typeId: e.target.value })}
              >
                {roomTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Status</label>
              <select
                className="w-full px-3 py-2 h-10 border border-input rounded-md bg-background text-foreground text-sm"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="AVAILABLE">Available</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            {localError && <div className="text-red-600 text-center mt-2 text-sm">{localError}</div>}
            {!localError && error && <div className="text-red-600 text-center mt-2 text-sm">{error}</div>}
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                disabled={!isValid || isSaving}
                onClick={() => {
                  if (localError) return;
                  onSave(form);
                }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
            
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditRoomModal;
