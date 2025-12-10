// package com.skillstorm.backend.Config;

// import org.springframework.context.annotation.Configuration;
// import jakarta.annotation.PostConstruct;
// import org.springframework.beans.factory.annotation.Value;
// import com.stripe.Stripe;

// @Configuration
// public class StripeConfig {
// 	// Inject the private key from application.yml
//     // Do not hardcode this key here for security reasons
// 	@Value("${stripe.private-key}")
// 	private String apiKey;

//     // Initialize the Stripe API with the secret key after the bean is constructed
//     @PostConstruct
// 	public void init() {
// 		Stripe.apiKey = apiKey;
// 	}
// }
