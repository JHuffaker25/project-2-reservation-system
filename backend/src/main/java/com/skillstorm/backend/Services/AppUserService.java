package com.skillstorm.backend.Services;

import java.util.List;
import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.skillstorm.backend.Models.AppUser;
import com.skillstorm.backend.Repositories.AppUserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.PaymentMethod;

@Service
public class AppUserService implements UserDetailsService {

    private final AppUserRepository appUserRepository;
    private final StripeService stripeService;
    private final PasswordEncoder passwordEncoder;

    public AppUserService(AppUserRepository appUserRepository, StripeService stripeService, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.stripeService = stripeService;
        this.passwordEncoder = passwordEncoder;
    }



//GET METHODS////////////////////////////////////////////////////////////////////////////////////////////

    //Returns all users
    public List<AppUser> getAllUsers() {
        return appUserRepository.findAll();
    }

    //Returns user by ID, and use DTOR
    public AppUser getUserById(String id) {
        AppUser user = findUserOrThrow(id);
        return user;
    }

    public List<PaymentMethod> getPaymentMethods(String userId) throws StripeException {
        AppUser user = findUserOrThrow(userId);
        return stripeService.listPaymentMethods(user.getStripeCustomerId());
    }

     //UserDetailsService interface method returns a user by username (email in this case)
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    // Get user by email for AppUser DTO in controller
    public AppUser getUserByEmail(String email) {
        return appUserRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }



//POST METHODS////////////////////////////////////////////////////////////////////////////////////////////

    // Create user and Stripe customer
    public AppUser createUser(AppUser user) throws StripeException {
        // Validate required fields
        if (user.getEmail() == null || user.getPassword() == null || user.getRole() == null ||
            user.getFirstName() == null || user.getLastName() == null || user.getPhone() == null) {
            throw new IllegalArgumentException("Missing required fields: email, password, role, firstName, lastName, phone");
        }

        // Create Stripe customer
        Customer stripeCustomer = stripeService.createCustomer(
                user.getEmail(),
                user.getFirstName() + " " + user.getLastName());
        user.setStripeCustomerId(stripeCustomer.getId());

        //Encrypt password before saving to DB
        user.setPassword(passwordEncoder.encode(user.getPassword()));

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



//PUT METHODS////////////////////////////////////////////////////////////////////////////////////////////

    // Update user details (firstName, lastName, email, phone)
    public AppUser updateUserDetails(String id, String firstName, String lastName, String email, String phone) {
        AppUser user = findUserOrThrow(id);
        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (email != null) user.setEmail(email);
        if (phone != null) user.setPhone(phone);
        return appUserRepository.save(user);
    }

    // Update user preferences (emailNotifications, display)
    public AppUser updateUserPreferences(String id, Boolean emailNotifications, Boolean darkMode) {
        AppUser user = findUserOrThrow(id);
        AppUser.Preferences prefs = user.getPreferences();
        if (prefs == null) {
            prefs = new AppUser.Preferences();
        }
        if (emailNotifications != null) prefs.setEmailNotifications(emailNotifications);
        if (darkMode != null) prefs.setDarkMode(darkMode);
        user.setPreferences(prefs);
        return appUserRepository.save(user);
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