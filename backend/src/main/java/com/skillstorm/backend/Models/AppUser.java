package com.skillstorm.backend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class AppUser {
	
	@Id
	private String id;

	private String email;

	private String password;

	private String role;

	private String firstName;

	private String lastName;

	private String phone;

	private Preferences preferences;

	private String stripeCustomerId;

	// Embedded Preferences class
	public static class Preferences {
		
		private Boolean emailNotifications;
		private String display; // "dark" or "light"

		public Preferences() {}

		public Preferences(Boolean emailNotifications, String display) {
	
			this.emailNotifications = emailNotifications;
			this.display = display;
		}

		public Boolean getEmailNotifications() {
			return emailNotifications;
		}

		public void setEmailNotifications(Boolean emailNotifications) {
			this.emailNotifications = emailNotifications;
		}

		public String getDisplay() {
			return display;
		}

		public void setDisplay(String display) {
			this.display = display;
		}
	}

	// Constructors
	public AppUser() {}

	public AppUser(String email, String password, String role, String firstName, String lastName, 
				   String phone, Preferences preferences, String stripeCustomerId) {
		this.email = email;
		this.password = password;
		this.role = role;
		this.firstName = firstName;
		this.lastName = lastName;
		this.phone = phone;
		this.preferences = preferences;
		this.stripeCustomerId = stripeCustomerId;
	}

	// Getters and Setters
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public Preferences getPreferences() {
		return preferences;
	}

	public void setPreferences(Preferences preferences) {
		this.preferences = preferences;
	}

	public String getStripeCustomerId() {
		return stripeCustomerId;
	}

	public void setStripeCustomerId(String stripeCustomerId) {
		this.stripeCustomerId = stripeCustomerId;
	}
}
