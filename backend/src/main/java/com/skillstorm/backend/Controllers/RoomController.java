package com.skillstorm.backend.Controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.backend.Models.Room;
import com.skillstorm.backend.Services.RoomService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    // GET room by ID
    @GetMapping("/{id}")
    public ResponseEntity<List<Room>> findRoomById(@PathVariable String id){
        try {
            List <Room> rooms = roomService.findRoomById(id);
            return new ResponseEntity<>(rooms, HttpStatus.OK);
            
        }catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "There were no room matches found").body(null);

        }catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").body(null);
        }
    }
}
    
