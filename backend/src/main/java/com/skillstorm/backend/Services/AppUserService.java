package com.skillstorm.backend.Services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.backend.Models.AppUser;
import com.skillstorm.backend.Repositories.AppUserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.PaymentMethod;

@Service
public class AppUserService {

    private final AppUserRepository appUserRepository;
    private final StripeService stripeService;

    public AppUserService(AppUserRepository appUserRepository, StripeService stripeService) {
        this.appUserRepository = appUserRepository;
        this.stripeService = stripeService;
    }

//GET METHODS////////////////////////////////////////////////////////////////////////////////////////////

    public List<AppUser> getAllUsers() {
        return appUserRepository.findAll();
    }

    public List<PaymentMethod> getPaymentMethods(String userId) throws StripeException {
        AppUser user = findUserOrThrow(userId);
        return stripeService.listPaymentMethods(user.getStripeCustomerId());
    }

//POST METHODS////////////////////////////////////////////////////////////////////////////////////////////

    // Create user and Stripe customer
    public AppUser createUser(AppUser user) throws StripeException {
        // Validate required fields
        //WARNING: Password will need to be hashed before saving to the database in real implementation
        if (user.getEmail() == null || user.getPassword() == null || user.getRole() == null ||
            user.getFirstName() == null || user.getLastName() == null || user.getPhone() == null) {
            throw new IllegalArgumentException("Missing required fields: email, password, role, firstName, lastName, phone");
        }

        // Create Stripe customer
        Customer stripeCustomer = stripeService.createCustomer(
                user.getEmail(),
                user.getFirstName() + " " + user.getLastName());
        user.setStripeCustomerId(stripeCustomer.getId());

        return appUserRepository.save(user);
    }

    // Attach a frontend-tokenized payment method to user
    public PaymentMethod addPaymentMethod(String userId, String paymentMethodId) throws StripeException {
        AppUser user = findUserOrThrow(userId);
        return stripeService.attachPaymentMethod(paymentMethodId, user.getStripeCustomerId());
    }

    // Attach a test payment method (backend testing only)
    public PaymentMethod addTestPaymentMethod(String userId, String cardType) throws StripeException {
        AppUser user = findUserOrThrow(userId);
        return stripeService.createTestPaymentMethod(cardType, user.getStripeCustomerId());
    }

//DELETE METHODS////////////////////////////////////////////////////////////////////////////////////////////

    public void deleteUser(String id) {
        if (!appUserRepository.existsById(id)) {
            throw new IllegalArgumentException("User with id " + id + " does not exist");
        }
        appUserRepository.deleteById(id);
    }

    public void removePaymentMethod(String userId, String paymentMethodId) throws StripeException {
        AppUser user = findUserOrThrow(userId);
        
        // Verify the payment method belongs to this user
        PaymentMethod pm = PaymentMethod.retrieve(paymentMethodId);
        if (!user.getStripeCustomerId().equals(pm.getCustomer())) {
            throw new IllegalArgumentException("Payment method does not belong to this user");
        }
        
        stripeService.detachPaymentMethod(paymentMethodId);
    }



//HELPER METHODS////////////////////////////////////////////////////////////////////////////////////////////

    private AppUser findUserOrThrow(String userId) {
        Optional<AppUser> user = appUserRepository.findById(userId);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
        return user.get();
    }

    
}


/*
 * 
    //CREATE new user
    public AppUser createUser(AppUser user) {
        // Validate all required fields
        if (user.getEmail() == null || user.getPassword() == null || user.getRole() == null ||
            user.getFirstName() == null || user.getLastName() == null || user.getPhone() == null) {
            throw new IllegalArgumentException("Missing required fields: email, password, role, firstName, lastName, phone");
        }
        
        //WILL NEED TO HASH PASSWORD HERE BEFORE SAVING TO DB AND MODEL

        return appUserRepository.save(user);
    }


    

 */