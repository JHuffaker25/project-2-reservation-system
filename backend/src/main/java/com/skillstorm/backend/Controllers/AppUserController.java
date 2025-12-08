package com.skillstorm.backend.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class AppUserController {
    // CRUD endpoints to be implemented


    //SPRING SECURITY TESTING ONLY, DELETE THIS/////////////////////////////////////////
    @GetMapping("/hello")
    public String hello(){
        return "Hello User!";
    }

    @GetMapping("/private-info")
    public String privateInfo(){
        return "This is private user information.";
    }
    //SPRING SECURITY TESTING ONLY, DELETE THIS/////////////////////////////////////////
}
