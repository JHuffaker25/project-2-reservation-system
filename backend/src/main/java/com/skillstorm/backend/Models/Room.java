package com.skillstorm.backend.Models;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "rooms")
public class Room {

    // Fields
    @Id
    private String id;

    private Integer roomNumber;

    private String typeId;
    
    private String status;

    private List<LocalDate> datesReserved;

    // Constructors
    public Room() {}

    public Room(Integer roomNumber, String typeId, String status, List<LocalDate> datesReserved) {
        this.roomNumber = roomNumber;
        this.typeId = typeId;
        this.status = status;
        this.datesReserved = datesReserved;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(Integer roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getTypeId() {
        return typeId;
    }

    public void setTypeId(String typeId) {
        this.typeId = typeId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<LocalDate> getDatesReserved() {
        return datesReserved;
    }

    public void setDatesReserved(List<LocalDate> datesReserved) {
        this.datesReserved = datesReserved;
    }
}
