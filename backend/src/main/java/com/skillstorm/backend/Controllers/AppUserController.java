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
import org.springframework.web.servlet.view.RedirectView;

import com.skillstorm.backend.Models.AppUser;
import com.skillstorm.backend.Services.AppUserService;

@RestController
@RequestMapping("/users")
public class AppUserController {


//Service injection
	private final AppUserService appUserService;

	public AppUserController(AppUserService appUserService) {
		this.appUserService = appUserService;
	}

	
//GET MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

	//Initiate login/redirect to frontend
	@GetMapping("/login")
	public RedirectView loginRedirect() {
		return new RedirectView("http://localhost:5173"); //May need to change this once deployed to AWS
	}

	//GET all users
	@GetMapping ("/all")
    public ResponseEntity<List<AppUser>> getAllUsers() {
        List<AppUser> users = appUserService.getAllUsers();
        return ResponseEntity.ok(users);
    }



//POST MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////    

	//CREATE new user (required fields: email, password, role, firstName, lastName, phone)
	@PostMapping("/new")
	public ResponseEntity<AppUser> createUser(@RequestBody AppUser user) {
		try {
			AppUser createdUser = appUserService.createUser(user);
			return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().header("Error", "Invalid user data: " + e.getMessage()).body(null);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().header("Error", "There was an internal server error").body(null);
		}
	}



//DELETE MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

	//DELETE user by ID
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable String id) {
		try {
			appUserService.deleteUser(id);
			return ResponseEntity.noContent().build();
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().header("Error", "User not found: " + e.getMessage()).build();
		} catch (Exception e) {
			return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
		}
	}

}
