package com.skillstorm.backend.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//THIS CONTROLLER IS FOR TESTING PURPOSES ONLY///////////////////////////////////////////////////
@RestController
@RequestMapping("/tests")
public class TestController {
    
    
    @GetMapping("/hello")
    public String hello(){
        return "Hello User!";
    }

    
    @GetMapping("/private-info")
    public String privateInfo(){
        return "This is private user information.";
    }
    
}
//THIS CONTROLLER IS FOR TESTING PURPOSES ONLY///////////////////////////////////////////////////