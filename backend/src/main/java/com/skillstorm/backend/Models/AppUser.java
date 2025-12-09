package com.skillstorm.backend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class AppUser {
	
	@Id
	private long userId;

	private String email;

	private String password;

	private Boolean role;

	private String firstName;

	private String lastName;

	private int phone;

	private String preferences;

	private String paymentDetails;
}
