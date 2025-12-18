package com.skillstorm.backend.Controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.backend.Models.RoomType;
import com.skillstorm.backend.Services.RoomTypeService;


@RestController
@RequestMapping("/room-types")
public class RoomTypeController {

//Service injection
    private final RoomTypeService roomTypeService;

    public RoomTypeController(RoomTypeService roomTypeService) {
        this.roomTypeService = roomTypeService;
    }


    
//GET MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    //GET all room types
    @GetMapping("/all")
    public ResponseEntity<List<RoomType>> getAllRoomTypes() {
        List<RoomType> roomTypes = roomTypeService.getAllRoomTypes();
        return ResponseEntity.ok(roomTypes);
    }

    //GET room type by ID
    @GetMapping("/{id}")
    public ResponseEntity<RoomType> findRoomById(@PathVariable String id){
        try {
             RoomType roomType = roomTypeService.findRoomById(id);
            return new ResponseEntity<>(roomType, HttpStatus.OK);
            
        }catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "There were no room type matches found").body(null);

        }catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").body(null);
        }
    }

    // GET room type by reservationId
    @GetMapping("/by-reservation/{reservationId}")
    public ResponseEntity<RoomType> getRoomTypeByReservationId(@PathVariable String reservationId) {
        try {
            RoomType roomType = roomTypeService.getRoomTypeByReservationId(reservationId);
            return ResponseEntity.ok(roomType);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }



//POST MAPPINGS///////////////////////////////////////////////////////////////////////////////////////////

    //Create new room type (Required fields: name, pricePerNight, maxGuests, squareFootage)
    @PostMapping("/create")
    public ResponseEntity<RoomType> createRoomType(@RequestBody RoomType roomType) {
        try {
            RoomType savedRoomType = roomTypeService.createRoomType(roomType);
            return new ResponseEntity<>(savedRoomType, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Invalid room type data: " + e.getMessage()).body(null);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").body(null);
        }
    }



//DELETE MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    //DELETE room type by ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteRoomType(@PathVariable String id) {
        try {
            roomTypeService.deleteRoomType(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Room type not found: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }
    
}
