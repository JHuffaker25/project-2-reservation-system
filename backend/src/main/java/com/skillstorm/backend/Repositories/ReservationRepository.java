package com.skillstorm.backend.Repositories;

import com.skillstorm.backend.Models.Reservation;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReservationRepository extends MongoRepository<Reservation, String> {
    
    // Find all reservations by userId
    List<Reservation> findByUserId(String userId);
}
