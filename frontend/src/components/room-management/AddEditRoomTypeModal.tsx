// EditRoomTypeModal component extracted from UpdateRooms.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import type { RoomType } from '../../types/types';

interface AddEditRoomTypeModalProps {
  open: boolean;
  type: RoomType | null;
  onClose: () => void;
  onSave: (type: Partial<RoomType> & { id?: string }) => void;
  isSaving?: boolean;
  error?: string | null;
  allAmenities?: string[];
  mode?: 'edit' | 'add';
}

const AddEditRoomTypeModal: React.FC<AddEditRoomTypeModalProps> = ({ open, type, onClose, onSave, isSaving, error, allAmenities, mode = 'edit' }) => {
  const initialForm: Partial<RoomType> = mode === 'add'
    ? { name: '', description: '', pricePerNight: 0, maxGuests: 0, amenities: [], squareFootage: 0, images: [''] }
    : (type || {});
  const [form, setForm] = useState<Partial<RoomType>>(initialForm);
  useEffect(() => {
    setForm(initialForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, open, mode]);
  if (mode === 'edit' && !type) return null;
  const isValid = form.name && form.pricePerNight && form.maxGuests && form.squareFootage;
  return (
    <Dialog open={open} onOpenChange={val => { if (!val) onClose(); }}>
      <DialogContent className="max-w-lg mx-auto">
        <DialogTitle>{mode === 'add' ? 'Add Room Type' : 'Edit Room Type'}</DialogTitle>
        {error && (
          <div className="text-red-500 text-sm mb-2">{error}</div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
              value={form.name || ''}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              disabled={isSaving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
              value={form.description || ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              disabled={isSaving}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price Per Night</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                value={form.pricePerNight || ''}
                onChange={e => setForm(f => ({ ...f, pricePerNight: Number(e.target.value) }))}
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Guests</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                value={form.maxGuests || ''}
                onChange={e => setForm(f => ({ ...f, maxGuests: Number(e.target.value) }))}
                disabled={isSaving}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Square Footage</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
              value={form.squareFootage || ''}
              onChange={e => setForm(f => ({ ...f, squareFootage: Number(e.target.value) }))}
              disabled={isSaving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
              value={form.images && form.images[0] ? form.images[0] : ''}
              onChange={e => setForm(f => ({ ...f, images: [e.target.value] }))}
              disabled={isSaving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amenities</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {allAmenities && allAmenities.length === 0 && (
                <span className="text-muted-foreground text-xs">No amenities found. Add a type with amenities first.</span>
              )}
              {allAmenities && allAmenities.map(a => {
                const selected = (form.amenities || []).includes(a);
                return (
                  <button
                    type="button"
                    key={a}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors focus:outline-none ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground border-muted-foreground hover:bg-accent'} `}
                    onClick={() => setForm(f => ({
                      ...f,
                      amenities: selected ? (f.amenities || []).filter(am => am !== a) : [...(f.amenities || []), a],
                    }))}
                    disabled={isSaving}
                  >
                    {a}
                    {selected ? (
                      <span className="ml-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></span>
                    ) : (
                      <span className="ml-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button
            onClick={() => {
              if (mode === 'add') {
                onSave({
                  ...form,
                  pricePerNight: Number(form.pricePerNight),
                  maxGuests: Number(form.maxGuests),
                  squareFootage: Number(form.squareFootage),
                  images: form.images?.filter(Boolean) || [],
                });
              } else {
                onSave({ ...form, id: type?.id ?? '' });
              }
            }}
            disabled={!isValid || isSaving}
          >
            {isSaving ? (mode === 'add' ? 'Adding...' : 'Saving...') : (mode === 'add' ? 'Add' : 'Save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditRoomTypeModal;
