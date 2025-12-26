// RoomTypesSection component extracted from UpdateRooms.tsx
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import AddEditRoomTypeModal from './AddEditRoomTypeModal';
import type { RoomType, Room } from '../../types/types';
import { useDeleteRoomTypeMutation, useUpdateRoomTypeMutation, useCreateRoomTypeMutation } from '@/features/roomType/roomTypeApi';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface RoomTypesSectionProps {
  roomTypes: RoomType[];
  rooms: Room[];
  onEditType?: (type: any) => void;
  onAddType?: () => void;
  onRoomTypesChanged?: () => void;
}

const RoomTypesSection = ({ roomTypes, rooms, onRoomTypesChanged }: RoomTypesSectionProps) => {
    // Add Type Modal State
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [addTypeError, setAddTypeError] = useState<string | null>(null);
    const [isAddingType, setIsAddingType] = useState(false);
    const [createRoomType] = useCreateRoomTypeMutation();

    // Compute all unique amenities from all room types
    const allAmenities = Array.from(new Set(roomTypes.flatMap(rt => rt.amenities || []))).sort();

    // Add Type handler
    const handleAddTypeSave = async (form: Partial<RoomType>) => {
      setAddTypeError(null);
      setIsAddingType(true);
      if (!form.name?.trim()) {
        setAddTypeError('Type name is required.');
        setIsAddingType(false);
        return;
      }
      if (!form.description?.trim()) {
        setAddTypeError('Description is required.');
        setIsAddingType(false);
        return;
      }
      if (!form.pricePerNight || isNaN(Number(form.pricePerNight))) {
        setAddTypeError('Valid price per night is required.');
        setIsAddingType(false);
        return;
      }
      if (!form.maxGuests || isNaN(Number(form.maxGuests))) {
        setAddTypeError('Valid max guests is required.');
        setIsAddingType(false);
        return;
      }
      if (!form.squareFootage || isNaN(Number(form.squareFootage))) {
        setAddTypeError('Valid square footage is required.');
        setIsAddingType(false);
        return;
      }
      try {
        const result = await createRoomType(form).unwrap();
        setLocalRoomTypes(prev => [...prev, result]);
        setAddDialogOpen(false);
        if (onRoomTypesChanged) onRoomTypesChanged();
      } catch (err: any) {
        setAddTypeError(err?.data?.message || err?.data || 'Failed to add room type');
      } finally {
        setIsAddingType(false);
      }
    };
  const [deleteRoomType, { isLoading: isDeleting }] = useDeleteRoomTypeMutation();
  const [updateRoomType, { isLoading: isUpdatingType }] = useUpdateRoomTypeMutation();
  const [localRoomTypes, setLocalRoomTypes] = useState(roomTypes);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTypeData, setEditTypeData] = useState<RoomType | null>(null);
  const [editTypeError, setEditTypeError] = useState<string | null>(null);

  useEffect(() => {
    setLocalRoomTypes(roomTypes);
  }, [roomTypes]);

  const openDeleteDialog = (id: string) => {
    setDeleteTarget(id);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteRoomType(deleteTarget).unwrap();
      setLocalRoomTypes(prev => prev.filter(rt => rt.id !== deleteTarget));
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      if (onRoomTypesChanged) onRoomTypesChanged();
    } catch (err) {
      setDeleteError('Failed to delete room type.');
    }
  };

  const openEditDialog = (type: RoomType) => {
    setEditTypeData(type);
    setEditDialogOpen(true);
    setEditTypeError(null);
  };

  const handleEditSave = (updated: Partial<RoomType> & { id?: string }) => {
    setEditTypeError(null);
    if (!updated.id) {
      setEditTypeError('Room type ID is required.');
      return;
    }
    // Always send amenities, fallback to current if not present
    const current = localRoomTypes.find(rt => rt.id === updated.id);
    const amenities = updated.amenities !== undefined ? updated.amenities : current?.amenities || [];
    (async () => {
      try {
        const result = await updateRoomType({ ...updated, amenities } as Partial<RoomType> & { id: string }).unwrap();
        setLocalRoomTypes(prev => prev.map(rt => rt.id === result.id ? result : rt));
        setEditDialogOpen(false);
        setEditTypeData(null);
        if (onRoomTypesChanged) onRoomTypesChanged();
      } catch (err) {
        setEditTypeError('Failed to update room type.');
      }
    })();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Room Types</h2>
        <Button size="sm" variant="outline" onClick={() => setAddDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Type</Button>
            {/* Add Room Type Modal (identical UI to Edit) */}
            <AddEditRoomTypeModal
              open={addDialogOpen}
              type={null}
              onClose={() => { setAddDialogOpen(false); setAddTypeError(null); }}
              onSave={handleAddTypeSave}
              isSaving={isAddingType}
              error={addTypeError}
              allAmenities={allAmenities}
              mode="add"
            />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localRoomTypes.map(type => {
          const count = rooms.filter(r => r.typeId === type.id).length;
          return (
            <Card
              key={type.id}
              className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300 pt-0"
            >
              <div className="relative w-full h-54 overflow-hidden bg-gray-200">
                {type.images && type.images[0] ? (
                  <img
                    src={type.images[0]}
                    alt={type.name}
                    className="w-full h-full object-cover transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">No Image</div>
                )}
                <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded shadow">{count} room{count !== 1 ? 's' : ''}</span>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">{type.name}
                  <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded">ID: {type.id}</span>
                </CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="border-l-2 border-primary pl-3">
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-semibold">{type.squareFootage} sq ft</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <p className="text-muted-foreground">Guests</p>
                    <p className="font-semibold">Up to {type.maxGuests}</p>
                  </div>
                </div>
                <div className="flex flex-col flex-1 mt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {type.amenities && type.amenities.length > 0 ? (
                      type.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg text-xs">
                          {/* Optionally add an AmenityIcon here if available */}
                          <span>{amenity}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No amenities listed</span>
                    )}
                  </div>
                </div>
                <div className="border-t pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs">Per Night</p>
                    <p className="text-2xl font-bold text-primary">${type.pricePerNight}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(type)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit Type
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(type.id ?? '')} disabled={isDeleting}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Dialog open={deleteDialogOpen} onOpenChange={open => {
        setDeleteDialogOpen(open);
        if (!open) {
          setDeleteTarget(null);
          setDeleteError(null);
        }
      }}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogTitle>Delete Room Type</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this room type? This action cannot be undone.
          </DialogDescription>
          {deleteError && <div className="text-red-600 text-sm text-center mb-2">{deleteError}</div>}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <AddEditRoomTypeModal
        open={editDialogOpen}
        type={editTypeData}
        onClose={() => { setEditDialogOpen(false); setEditTypeData(null); }}
        onSave={handleEditSave}
        isSaving={isUpdatingType}
        error={editTypeError}
        allAmenities={allAmenities}
        mode="edit"
      />
    </div>
  );
};

export default RoomTypesSection;
