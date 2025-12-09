package com.skillstorm.backend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "rooms")
public class Room {

    @Id
    private long roomId;

    private long typeId;

    private int roomNumber;
    
    private String status;
}
