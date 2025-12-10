package com.skillstorm.backend.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/users")
public class AppUserController {

	@GetMapping("/login")
	public RedirectView loginRedirect() {
		return new RedirectView("http://localhost:5173"); //May need to change this once deployed to AWS
	}



}
