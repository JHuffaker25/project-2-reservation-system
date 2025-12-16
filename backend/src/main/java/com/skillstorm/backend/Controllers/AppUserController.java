package com.skillstorm.backend.Controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.backend.Models.AppUser;
import com.skillstorm.backend.Services.AppUserService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentMethod;

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

    //This may be unecessary with frontend handling routing
    /*@GetMapping("/login")
    public RedirectView loginRedirect() {
        return new RedirectView("http://localhost:5173");
    }*/


        
//POST MAPPINGS////////////////////////////////////////////////////////////////////////////////////////////

    //To be adjusted to account for authentication
    //required fields: email, password, role, firstName, lastName, phone
    @PostMapping("/create")
    public ResponseEntity<Object> createUser(@RequestBody AppUser user) {
        try {
            AppUser createdUser = appUserService.createUser(user);
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().header("Error", "Stripe error: " + e.getMessage()).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().header("Error", "Invalid user data: " + e.getMessage()).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("Error", "There was an internal server error").build();
        }
    }

    // Attach payment method (frontend uses Stripe.js to create paymentMethodId)
    @PostMapping("/{userId}/payment-methods/{paymentMethodId}")
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



/*
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
 */