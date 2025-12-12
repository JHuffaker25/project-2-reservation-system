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


//POST METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //CREATE new user
    public AppUser createUser(AppUser user) {
        // Validate all required fields
        if (user.getEmail() == null || user.getPassword() == null || user.getRole() == null ||
            user.getFirstName() == null || user.getLastName() == null || user.getPhone() == null) {
            throw new IllegalArgumentException("Missing required fields: email, password, role, firstName, lastName, phone");
        }
        
        //WILL NEED TO HASH PASSWORD HERE BEFORE SAVING TO DB AND MODEL

        return appUserRepository.save(user);
    }


    
//DELETE METHODS////////////////////////////////////////////////////////////////////////////////////////////

    // Delete a user by ID
    public void deleteUser(String id) {
        if (!appUserRepository.existsById(id)) {
            throw new IllegalArgumentException("User with id " + id + " does not exist");
        }
        appUserRepository.deleteById(id);
    }
}
