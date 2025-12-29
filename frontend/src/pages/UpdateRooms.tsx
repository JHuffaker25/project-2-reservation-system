import React, { useState, useEffect } from 'react';
import { useGetRoomTypesQuery } from '@/features/roomType/roomTypeApi';

import Loader from '@/components/loader';
import RoomSection from '@/components/room-management/RoomSection';
import RoomTypesSection from '@/components/room-management/RoomTypesSection';


import { useGetAllRoomsQuery } from "@/features/room/roomApi";

import type { Room, RoomType } from "@/types/types";

const UpdateRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const { data: apiRoomTypes = [], isLoading: isRoomTypesLoading, isError: isRoomTypesError, refetch: refetchRoomTypes } = useGetRoomTypesQuery();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  useEffect(() => {
    setRoomTypes(apiRoomTypes);
  }, [apiRoomTypes]);

  // Handler to refresh room types from API
  const refreshRoomTypes = async () => {
    // Force a refetch from the API so all consumers get the latest
    await refetchRoomTypes();
  };

  // Fetch rooms from API
  const { data: apiRooms = [], isLoading, isError } = useGetAllRoomsQuery();
  useEffect(() => {
    setRooms(apiRooms);
  }, [apiRooms]);

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
          <RoomSection
            rooms={rooms}
            setRooms={setRooms}
            roomTypes={roomTypes}
            isLoading={isLoading}
            isError={isError}
          />
          <div className="border-t my-16"></div>
          {isRoomTypesLoading ? (
            <Loader />
          ) : isRoomTypesError ? (
            <div className="text-center py-8 text-red-600">Failed to load room types.</div>
          ) : (
            <RoomTypesSection
              roomTypes={roomTypes}
              rooms={rooms}
              onRoomTypesChanged={refreshRoomTypes}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateRooms;
