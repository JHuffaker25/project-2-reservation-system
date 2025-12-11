package com.skillstorm.backend.Controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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

}
