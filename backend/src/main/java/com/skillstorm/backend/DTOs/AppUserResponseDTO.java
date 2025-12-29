package com.skillstorm.backend.DTOs;

import com.skillstorm.backend.Models.AppUser;

public record AppUserResponseDTO(
    String id,
    String email,
    String role,
    String firstName,
    String lastName,
    String phone,
    boolean isGoogleUser,
    AppUser.Preferences preferences
) {}

