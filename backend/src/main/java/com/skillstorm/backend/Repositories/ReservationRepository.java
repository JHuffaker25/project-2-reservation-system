package com.skillstorm.backend.Repositories;

import com.skillstorm.backend.Models.Reservation;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReservationRepository extends MongoRepository<Reservation, String> {
    // Custom query methods if needed
}
