package com.skillstorm.backend.Controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.backend.DTOs.AppUserResponseDTO;
import com.skillstorm.backend.Models.AppUser;
import com.skillstorm.backend.Services.AppUserService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentMethod;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/users")
public class AppUserController {

    private final AppUserService appUserService;

    public AppUserController(AppUserService appUserService) {
        this.appUserService = appUserService;
    }
    


//GET MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    @GetMapping("/all")
    public ResponseEntity<List<AppUser>> getAllUsers() {
        List<AppUser> users = appUserService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // In AppUserController.java - add GET endpoint
    @GetMapping("/user/{id}")
    public ResponseEntity<AppUserResponseDTO> getUserById(@PathVariable String id) {
    try {
        AppUser user = appUserService.getUserById(id);
        return ResponseEntity.ok(new AppUserResponseDTO(
            user.getId(),
            user.getEmail(),
            user.getRole(),
            user.getFirstName(),
            user.getLastName(),
            user.getPhone(),
            user.getIsGoogleUser(),
            user.getPreferences()
        ));
    } catch (IllegalArgumentException e) {
        return ResponseEntity.notFound().build();
    } catch (Exception e) {
        return ResponseEntity.internalServerError().build();
    }
}
    //GET payment methods for a user
    @GetMapping("/{userId}/payment-methods")
    public ResponseEntity<Object> getPaymentMethods(@PathVariable String userId) {
        try {
            //Need to clean up all the garbage and unnecessary output that STRIPE gives and get what we want
            List<Map<String, Object>> paymentMethods = appUserService.getPaymentMethods(userId)
                .stream()
                .map(this::toPaymentMethodResponse)
                .toList();
            return new ResponseEntity<>(paymentMethods, HttpStatus.OK);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().header("Error", "Stripe error: " + e.getMessage()).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Invalid user data: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }

    // GET user DTO by email, returns AppUserResponseDTO (all fields except password)
    @GetMapping("/me")
    public ResponseEntity<Object> getUserByEmail(org.springframework.security.core.Authentication authentication) {
        try {
            String email = authentication.getName();
            AppUser user = appUserService.getUserByEmail(email);
            AppUserResponseDTO dto = new AppUserResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getIsGoogleUser(),
                user.getPreferences()
            );
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "User not found: " + e.getMessage()).body(null);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").body(null);
        }
    }

    // Endpoint to expose CSRF token for frontend
    @GetMapping("/csrf")
    @ResponseBody
    public CsrfToken csrf(CsrfToken token) {
        return token;
    }


        
//PUT MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    //Update user details
    @PutMapping("/update/{id}")
    public ResponseEntity<Object> updateUserDetails(@PathVariable String id, @RequestBody Map<String, String> updates) {
        try {
            AppUser updatedUser = appUserService.updateUserDetails(id,
                updates.get("firstName"),
                updates.get("lastName"),
                updates.get("email"),
                updates.get("phone")
            );
            return ResponseEntity.ok(new AppUserResponseDTO(
                updatedUser.getId(),
                updatedUser.getEmail(),
                updatedUser.getRole(),
                updatedUser.getFirstName(),
                updatedUser.getLastName(),
                updatedUser.getPhone(),
                updatedUser.getIsGoogleUser(),
                updatedUser.getPreferences()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Internal server error");
        }
    }

    //Update user preferences
    @PutMapping("/update-preferences/{id}")
    public ResponseEntity<Object> updateUserPreferences(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        try {
            Boolean emailNotifications = updates.get("emailNotifications") != null ? (Boolean) updates.get("emailNotifications") : null;
            Boolean darkMode = updates.get("darkMode") != null ? (Boolean) updates.get("darkMode") : null;
            AppUser updatedUser = appUserService.updateUserPreferences(id, emailNotifications, darkMode);
            return ResponseEntity.ok(new AppUserResponseDTO(
                updatedUser.getId(),
                updatedUser.getEmail(),
                updatedUser.getRole(),
                updatedUser.getFirstName(),
                updatedUser.getLastName(),
                updatedUser.getPhone(),
                updatedUser.getIsGoogleUser(),
                updatedUser.getPreferences()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Internal server error");
        }
    }



//POST MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    //To be adjusted to account for authentication
    //required fields: email, password, role, firstName, lastName, phone
    @PostMapping("/create")
    public ResponseEntity<Object> createUser(@RequestBody(required = false) AppUser user) {
        System.out.println("=== CREATE USER ENDPOINT CALLED ===");
        System.out.println("Request body user object: " + user);

        try {
            if (user == null) {
                System.out.println("ERROR: User object is null");
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Request body is null or could not be parsed");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            System.out.println("User email: " + user.getEmail());
            System.out.println("User firstName: " + user.getFirstName());
            System.out.println("User lastName: " + user.getLastName());
            System.out.println("User phone: " + user.getPhone());
            System.out.println("User role: " + user.getRole());

            AppUser createdUser = appUserService.createUser(user);
            System.out.println("User created successfully: " + createdUser.getId());
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (StripeException e) {
            System.out.println("StripeException caught: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Stripe error: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (IllegalArgumentException e) {
            System.out.println("IllegalArgumentException caught: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid user data: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.out.println("Exception caught: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "There was an internal server error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // Attach payment method (frontend uses Stripe.js to create paymentMethodId)
    @PostMapping("/attach/{userId}/payment-methods/{paymentMethodId}")
    public ResponseEntity<Object> addPaymentMethod(@PathVariable String userId, @PathVariable String paymentMethodId) {
        try {
            PaymentMethod pm = appUserService.addPaymentMethod(userId, paymentMethodId);
            return new ResponseEntity<>(toPaymentMethodResponse(pm), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Invalid user data: " + e.getMessage()).build();
        } catch (StripeException e) {
            return ResponseEntity.badRequest().header("Error", "Stripe error: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }

    // Attach TEST payment method (backend testing only)
    // Use: visa, mastercard, amex, discover, visa_debit
    @PostMapping("/{userId}/payment-methods/test")
    public ResponseEntity<Object> addTestPaymentMethod(
            @PathVariable String userId,
            @RequestParam(defaultValue = "visa") String cardType) {
        try {
            PaymentMethod pm = appUserService.addTestPaymentMethod(userId, cardType);
            return new ResponseEntity<>(toPaymentMethodResponse(pm), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Invalid user data: " + e.getMessage()).build();
        } catch (StripeException e) {
            return ResponseEntity.badRequest().header("Error", "Stripe error: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }

        // LOGOUT endpoint
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request, HttpServletResponse response) {
        // Invalidate session
        request.getSession().invalidate();

        // Clear JSESSIONID cookie
        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        // Optionally set domain if needed: cookie.setDomain("yourdomain.com");
        response.addCookie(cookie);

        // Return success message
        Map<String, String> body = new HashMap<>();
        body.put("message", "Logged out");
        return ResponseEntity.ok(body);
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

    //Remove a payment method from a user
    @DeleteMapping("/delete/{userId}/payment-methods/{paymentMethodId}")
    public ResponseEntity<Object> removePaymentMethod(
            @PathVariable String userId, 
            @PathVariable String paymentMethodId) {
        try {
            appUserService.removePaymentMethod(userId, paymentMethodId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", e.getMessage()).build();
        } catch (StripeException e) {
            return ResponseEntity.badRequest().header("Error", "Stripe error: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }


//HELPER METHOD

    // Convert Stripe PaymentMethod to serializable Map
    // Stripe API response is not serializable, so we need to convert it to a Map
    // link to documentation: https://stripe.com/docs/api/payment_methods/object
    private Map<String, Object> toPaymentMethodResponse(PaymentMethod pm) {
        Map<String, Object> response = new HashMap<>();
        response.put("paymentMethodId", pm.getId());
        response.put("type", pm.getType());
        response.put("customerId", pm.getCustomer());

        if (pm.getCard() != null) {
            Map<String, Object> card = new HashMap<>();
            card.put("brand", pm.getCard().getBrand());
            card.put("last4", pm.getCard().getLast4());
            card.put("expMonth", pm.getCard().getExpMonth());
            card.put("expYear", pm.getCard().getExpYear());
            response.put("card", card);
        }

        return response;
    }
}