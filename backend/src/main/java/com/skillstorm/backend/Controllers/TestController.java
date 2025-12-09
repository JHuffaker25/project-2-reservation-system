package com.skillstorm.backend.Controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

//THIS CONTROLLER IS FOR TESTING PURPOSES ONLY///////////////////////////////////////////////////
@Controller
@RequestMapping("/tests")
public class TestController {
    
    
    @GetMapping("/hello")
    @ResponseBody //Sends back data as JSON
    public String hello(){
        return "Hello User!";
    }

    
    @GetMapping("/private-info")
    @ResponseBody //Sends back data as JSON
    public String privateInfo(){
        return "This is private user information.";
    }
    

}
//THIS CONTROLLER IS FOR TESTING PURPOSES ONLY///////////////////////////////////////////////////