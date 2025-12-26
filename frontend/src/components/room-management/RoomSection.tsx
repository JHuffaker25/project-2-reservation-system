import React, { useState, useMemo } from 'react';
import { useCreateRoomMutation, useUpdateRoomMutation, useDeleteRoomMutation } from '@/features/room/roomApi';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FilterPanel from '@/components/room-management/FilterPanel';
import Loader from '@/components/loader';
import RoomTable from '@/components/room-management/RoomTable';
import RoomAvailabilityModal from '@/components/room-management/RoomAvailabilityModal';
import AddEditRoomModal from '@/components/room-management/AddEditRoomModal';
import type { Room, RoomType } from '@/types/types';

const PAGE_SIZE = 10;

interface RoomSectionProps {
    rooms: Room[];
    setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
    roomTypes: RoomType[];
    isLoading: boolean;
    isError: boolean;
}

const RoomSection: React.FC<RoomSectionProps> = ({ rooms, setRooms, roomTypes, isLoading, isError }) => {
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addRoomError, setAddRoomError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        available: '',
        priceMin: '',
        priceMax: '',
        amenity: '',
        roomType: '',
        floor: '',
    });
    const floorOptions = Array.from(
        new Set(
            rooms
                .map(r => String(r.roomNumber)[0])
                .filter(f => f && !isNaN(Number(f)))
        )
    ).sort();
    const [selected, setSelected] = useState<string[]>([]);
    const [page, setPage] = useState(1);

    // Filtering
    const filteredRooms = useMemo(() => {
        return rooms.filter(r => {
            const searchLower = search.toLowerCase();
            if (
                searchLower &&
                !(String(r.roomNumber).toLowerCase().includes(searchLower)) &&
                !(r.typeId?.toLowerCase().includes(searchLower))
            ) {
                return false;
            }
            // Availability
            if (filters.available && ((filters.available === 'true' && r.status !== 'AVAILABLE') || (filters.available === 'false' && r.status !== 'UNAVAILABLE'))) {
                return false;
            }
            // Room Type
            if (filters.roomType && r.typeId !== filters.roomType) {
                return false;
            }
            // Floor
            if (filters.floor && String(r.roomNumber)[0] !== filters.floor) {
                return false;
            }
            return true;
        });
    }, [rooms, search, filters]);

    // Pagination
    const totalPages = Math.ceil(filteredRooms.length / PAGE_SIZE);
    const paginatedRooms = filteredRooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Edit Room Modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editRoom, setEditRoom] = useState<Room | null>(null);
    const [editRoomError, setEditRoomError] = useState<string | null>(null);
    // Delete Room Dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deleteRoomError, setDeleteRoomError] = useState<string | null>(null);
    // Room Availability Modal state
    const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
    const [availabilityRoom, setAvailabilityRoom] = useState<Room | null>(null);

    // API hooks
    const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
    const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
    const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();

    // Add Room handler using API
    const handleAddRoom = async (formRoom: any) => {
        setAddRoomError(null);
        // Build payload with required fields
        const payload = {
            // id: formRoom.id || `room${formRoom.roomNumber}`,
            roomNumber: formRoom.roomNumber,
            typeId: formRoom.typeId,
            status: formRoom.status,
            datesReserved: [],
        };
        try {
            const result = await createRoom(payload).unwrap();
            // Sort by roomNumber after adding
            setRooms([...rooms, result].sort((a, b) => {
                const numA = Number(a.roomNumber);
                const numB = Number(b.roomNumber);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return String(a.roomNumber).localeCompare(String(b.roomNumber));
            }));
            setAddModalOpen(false);
        } catch (err: any) {
            setAddRoomError(err?.data?.message || err?.message || 'Failed to add room.');
        }
    };

    // Edit Room handler using API
    const handleEditRoom = (room: Room) => {
        setEditRoom(room);
        setEditModalOpen(true);
        setEditRoomError(null);
    };

    const handleEditRoomSave = async (updatedRoom: Room) => {
        setEditRoomError(null);
        // Prevent duplicate room number (except for the current room)
        if (
            rooms.some(
                r =>
                    String(r.roomNumber).trim().toLowerCase() === String(updatedRoom.roomNumber).trim().toLowerCase() &&
                    r.id !== updatedRoom.id
            )
        ) {
            setEditRoomError('A room with this number already exists.');
            return;
        }
        try {
            const result = await updateRoom({ ...updatedRoom, id: updatedRoom.id }).unwrap();
            // Sort by roomNumber after editing
            setRooms(
                rooms
                    .map(r => (r.id === result.id ? result : r))
                    .sort((a, b) => {
                        const numA = Number(a.roomNumber);
                        const numB = Number(b.roomNumber);
                        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                        return String(a.roomNumber).localeCompare(String(b.roomNumber));
                    })
            );
            setEditModalOpen(false);
            setEditRoom(null);
        } catch (err) {
            setEditRoomError('Failed to update room.');
        }
    };

    // Delete Room handler using API
    const handleDeleteRoom = (id: string) => {
        setDeleteTarget(id);
        setDeleteDialogOpen(true);
        setDeleteRoomError(null);
    };

    const handleDeleteRoomConfirm = async () => {
        if (!deleteTarget) return;
        setDeleteRoomError(null);
        try {
            await deleteRoom(deleteTarget).unwrap();
            setRooms(rooms.filter(r => r.id !== deleteTarget));
            setSelected(selected.filter(sid => sid !== deleteTarget));
            setDeleteDialogOpen(false);
            setDeleteTarget(null);
        } catch (err) {
            setDeleteRoomError('Failed to delete room.');
        }
    };

    return (
        <div>
            <FilterPanel
                search={search}
                onSearch={setSearch}
                filters={filters}
                onFilterChange={setFilters}
                roomTypes={roomTypes}
                floorOptions={floorOptions}
            />
            <div className="pt-6">
                <AddEditRoomModal
                    open={addModalOpen}
                    room={null}
                    onClose={() => setAddModalOpen(false)}
                    onSave={handleAddRoom}
                    roomTypes={roomTypes}
                    isSaving={isCreating}
                    error={addRoomError}
                    setAddRoomError={setAddRoomError}
                    rooms={rooms}
                />
            </div>
            {isLoading ? (
                <Loader />
            ) : isError ? (
                <div className="text-center py-8 text-red-600">Failed to load rooms.</div>
            ) : (
                <RoomTable
                    rooms={paginatedRooms as Room[]}
                    onEdit={handleEditRoom}
                    onDelete={handleDeleteRoom}
                    roomTypes={roomTypes}
                    setAddModalOpen={setAddModalOpen}
                    onViewAvailability={(room) => {
                        setAvailabilityRoom(room);
                        setAvailabilityModalOpen(true);
                    }}
                />
            )}
            {/* Room Availability Modal */}
            <RoomAvailabilityModal
                open={availabilityModalOpen}
                room={availabilityRoom}
                onClose={() => setAvailabilityModalOpen(false)}
            />
            {/* Edit Room Modal */}
            <AddEditRoomModal
                open={editModalOpen}
                room={editRoom}
                onClose={() => { setEditModalOpen(false); setEditRoom(null); }}
                onSave={handleEditRoomSave}
                roomTypes={roomTypes}
                isSaving={isUpdating}
                error={editRoomError}
                rooms={rooms}
            />
            {/* Delete Room Dialog */}
            <div>
                {deleteDialogOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                            <h2 className="text-lg font-semibold mb-2">Delete Room</h2>
                            <p className="mb-4">Are you sure you want to delete this room? This action cannot be undone.</p>
                            {deleteRoomError && <div className="text-red-600 text-sm text-center mb-2">{deleteRoomError}</div>}
                            <div className="flex gap-2 justify-end pt-2">
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
                                <Button variant="destructive" onClick={handleDeleteRoomConfirm} disabled={isDeleting}>
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
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
        </div>
    );
};

export default RoomSection;
