package com.skillstorm.backend.Services;

import com.skillstorm.backend.Models.AppUser;
import com.stripe.exception.StripeException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;


@Service
public class CustomOAuth2UserService implements OAuth2UserService<OidcUserRequest, OidcUser> {
    private final AppUserService appUserService;

    public CustomOAuth2UserService(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) {
        OidcUser oidcUser = new org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService().loadUser(userRequest);
        processUser(oidcUser.getAttributes());
        return new DefaultOidcUser(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_CUSTOMER")),
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                "email"
        );
    }

    private void processUser(Map<String, Object> attributes) {
        String email = (String) attributes.get("email");
        String firstName = (String) attributes.getOrDefault("given_name", "EXTERNAL");
        String lastName = (String) attributes.getOrDefault("family_name", "EXTERNAL");
        AppUser existingUser = null;
        try {
            System.out.println("[CustomOAuth2UserService] Checking for existing user: " + email);
            existingUser = appUserService.getUserByEmail(email);
        } catch (Exception ignored) {}
        if (existingUser == null) {
            System.out.println("[CustomOAuth2UserService] Creating new user: " + email);
            AppUser user = new AppUser();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole("CUSTOMER");
            user.setPassword("EXTERNAL"); //Note: The password text 'EXTERNAL' still gets hashed before storage
            try {
                appUserService.createUser(user);
            } catch (StripeException ex) {
                throw new RuntimeException("Failed to create Stripe customer for OAuth user", ex);
            }
        }
    }
}
