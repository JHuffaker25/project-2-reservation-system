package com.skillstorm.backend.Config;


import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {
    
    //Security filter chain configuration
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable()) // Disable CSRF TEMPORARILY for testing purposes
            .authorizeHttpRequests(authorize -> {
                authorize
                
                //PERMITTED ROUTES
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Allow CORS preflight requests

                //CUSTOMER OR ADMIN ROUTES
                /*MAY CHANGE ROLES -->*/.requestMatchers("/users/me").hasAnyRole("ADMIN", "CUSTOMER")
                /*MAY CHANGE ROLES -->*/.requestMatchers("/users/{userId}/payment-methods/{paymentMethodId}").hasAnyRole("ADMIN", "CUSTOMER")
                /*MAY CHANGE ROLES -->*/.requestMatchers("/reservations/user/{userId}").hasAnyRole("ADMIN", "CUSTOMER")
                .requestMatchers("/reservations/new").hasAnyRole("ADMIN", "CUSTOMER")
                .requestMatchers("/reservations/{id}/cancel").hasAnyRole("ADMIN", "CUSTOMER")
                .requestMatchers("/reservations/{id}/update").hasAnyRole("ADMIN", "CUSTOMER")
                .requestMatchers("/reservations/delete/{id}").hasAnyRole("ADMIN", "CUSTOMER")
                /*MAY CHANGE ROLES -->*/.requestMatchers("/room-types/by-reservation/{reservationId}").hasAnyRole("ADMIN", "CUSTOMER") 
                .requestMatchers("/transactions/new").hasAnyRole("ADMIN", "CUSTOMER")

                //ADMIN ONLY ROUTES
                .requestMatchers("/users/all").hasRole("ADMIN")
                .requestMatchers("/users/delete/{id}").hasRole("ADMIN")
                .requestMatchers("/reservations/all").hasRole("ADMIN")
                .requestMatchers("/reservations/{id}/check-in").hasRole("ADMIN")
                .requestMatchers("/rooms/new").hasRole("ADMIN")
                .requestMatchers("/rooms/delete/{id}").hasRole("ADMIN")
                .requestMatchers("/room-types/create").hasRole("ADMIN")
                .requestMatchers("/room-types/delete/{id}").hasRole("ADMIN")
                .requestMatchers("/transactions/all").hasRole("ADMIN")
                .requestMatchers("/transactions/delete/{id}").hasRole("ADMIN")

                //TEST ROUTES
                .requestMatchers("/tests/hello").permitAll()
                .requestMatchers("/tests/private-info").authenticated()

                //ALL OTHER ROUTES PERMITTED
                .anyRequest().permitAll();

            })
            
            //Basic AND Oauth both accepted
            .oauth2Login(Customizer.withDefaults())
            .httpBasic(Customizer.withDefaults())

            //Redirect to frontend home page upon successful login
            .oauth2Login(oauth2 -> oauth2
            .defaultSuccessUrl("http://localhost:3000/home", true)); //REPLACE WITH OUR ACTUAL FRONTEND URL
            
        return http.build();
    }

    //Cors configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
        @Value("${FRONTEND_URL}") String frontendUrl
    ) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendUrl));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    //Password encoder
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder(10);
    }

}
