package com.skillstorm.backend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "room_types")
public class RoomType {

    @Id
    private long typeId;

    private String name;

    private String description;

    private int nightlyPrice;

    private byte maxGuests;

    private String amenities;
    
    private int squareFootage;
}
