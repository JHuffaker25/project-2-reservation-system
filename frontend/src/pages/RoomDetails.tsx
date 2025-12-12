import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useParams } from 'react-router';
import { useGetRoomTypeByIdQuery } from '@/features/rooms/roomApi';
import { useAppDispatch } from '@/app/hooks';
import { setRoomType } from '@/features/rooms/roomSlice';
import AmenityIcon from '@/components/amenity-icon';
import DateRangeCalendar from '@/components/date-range-calendar';
import Loader from '@/components/loader';

export default function RoomDetails() {
  const [userInput, setUserInput] = useState({
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    guests: 1,
  });

  const { id } = useParams<{ id: string }>();
  const { data: roomType, error, isLoading } = useGetRoomTypeByIdQuery(id!);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (roomType) {
      dispatch(setRoomType(roomType));
    }
  }, [roomType, dispatch]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-destructive">Room Not Found</h2>
          <p className="text-muted-foreground">We couldn't find the room you're looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-12 px-4 md:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Book Your Stay</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Please enter your booking details below to reserve your room.
          </p>
        </div>
      </div>
      <div className="py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Card className="p-0 space-x-6 border-none shadow-none">
            <CardContent className="p-0 grid grid-cols-2 gap-x-6 rounded-t-lg overflow-hidden">
              <div className="flex flex-col col-span-2 lg:col-span-1">
                <img
                  src={roomType?.images[0]}
                  alt={roomType?.name}
                  className="w-full h-96 object-cover rounded-lg shadow-md"
                />
                <div className="flex flex-col mt-4">
                  <h2 className="text-2xl font-bold mb-2">{roomType?.name}</h2>
                  <p className="text-muted-foreground mb-4">{roomType?.description}</p>
                  <div className="flex items-center mb-4">
                    <span className="text-lg font-semibold mr-4">
                      ${roomType?.pricePerNight} / night
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {roomType?.squareFootage} sq ft • Max {roomType?.maxGuests} guests
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {roomType?.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-2 bg-muted/50 px-3 py-1 rounded-full text-sm"
                      >
                        <AmenityIcon amenity={amenity} />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col col-span-2 lg:col-span-1 border rounded-2xl p-6 shadow-sm">
                <div className="space-y-4 px-1">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Date Range</label>
                    <DateRangeCalendar
                      startDate={userInput.checkInDate}
                      endDate={userInput.checkOutDate}
                      onStartDateChange={(date) =>
                        setUserInput((prev) => ({ ...prev, checkInDate: date }))
                      }
                      onEndDateChange={(date) =>
                        setUserInput((prev) => ({ ...prev, checkOutDate: date }))
                      }
                      minDate={new Date()}
                      onChange={({ checkInDate, checkOutDate }) =>
                        setUserInput((prev) => ({ ...prev, checkInDate, checkOutDate }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="guests" className="text-sm font-semibold">
                      Number of Guests
                    </label>
                    <div className="relative">
                      <select
                        id="guests"
                        value={userInput.guests}
                        onChange={(e) =>
                          setUserInput((prev) => ({
                            ...prev,
                            guests: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 h-10 border border-input rounded-md bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      >
                        {roomType &&
                          Array.from({ length: roomType.maxGuests }, (_, i) => i + 1).map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? 'Guest' : 'Guests'}
                            </option>
                          ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    disabled={!userInput.checkInDate || !userInput.checkOutDate}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}