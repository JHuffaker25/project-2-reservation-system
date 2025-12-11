package com.skillstorm.backend.Services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skillstorm.backend.Models.AppUser;
import com.skillstorm.backend.Repositories.AppUserRepository;

@Service
public class AppUserService {
	
//Repo injection
    private final AppUserRepository appUserRepository;

	public AppUserService(AppUserRepository appUserRepository) {
		this.appUserRepository = appUserRepository;
	}



//GET METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //GET all users
    public List<AppUser> getAllUsers() {
        return appUserRepository.findAll();
    }
}
