package com.skillstorm.backend.Controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.backend.Models.Room;
import com.skillstorm.backend.Services.RoomService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.time.LocalDate;
import java.util.stream.Collectors;
import java.util.List;


@RestController
@RequestMapping("/rooms")
public class RoomController {

//Service injection
    private final RoomService roomService;

     public RoomController(RoomService roomService){
        this.roomService = roomService;
    }



//GET MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    //GET all rooms
	@GetMapping ("/all")
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }

    //GET room by ID
    @GetMapping("/{id}")
    public ResponseEntity<Room> findRoomById(@PathVariable String id){
        try {
            Room room = roomService.findRoomById(id);
            return new ResponseEntity<>(room, HttpStatus.OK);
                    
        }catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "No room found with id: " + id).body(null);

        }catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").body(null);
        }
    }

    //GET available rooms by dates, with optional typeId as path variable (/{typeId}/available)

    @GetMapping({"/available", "/{typeId}/available"})
    public ResponseEntity<List<Room>> getAvailableRooms(
            @RequestParam List<String> dates,
            @PathVariable(required = false) String typeId) {
        try {
            //Parse date strings to LocalDate
            List<LocalDate> requestedDates = dates.stream()
                    .map(LocalDate::parse)
                    .collect(Collectors.toList());
            List<Room> availableRooms = roomService.findAvailableRooms(requestedDates, typeId);
            return ResponseEntity.ok(availableRooms);
        } catch (Exception e) {
            return ResponseEntity.badRequest().header("Error", "Invalid request: " + e.getMessage()).body(null);
        }
    }
    
   
//POST MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////    

    //CREATE new room (Fields required: roomNumber, typeId, status, datesReserved)
    @PostMapping("/new")
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        try {
            Room createdRoom = roomService.createRoom(room);
            return new ResponseEntity<>(createdRoom, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Invalid room data: " + e.getMessage()).body(null);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").body(null);
        }
    }



//DELETE MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    //DELETE room by ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String id) {
        try {
            roomService.deleteRoom(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Room not found: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }

    
}
    
