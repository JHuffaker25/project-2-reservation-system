
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
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.web.AuthenticationEntryPoint;
import jakarta.servlet.http.HttpServletResponse;

import com.skillstorm.backend.Services.CustomOAuth2UserService;

// import com.skillstorm.backend.Services.CustomOAuth2UserService;

@Configuration
public class SecurityConfig {

        // Custom entry point to suppress browser HTTP Basic popups
        @Bean
        public AuthenticationEntryPoint noPopupBasicAuthEntryPoint() {
            return (request, response, authException) -> {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Unauthorized");
            };
        }
    
    
    //Security filter chain configuration
    @Bean
    public SecurityFilterChain securityFilterChain(
        CustomOAuth2UserService customOAuth2UserService,
        HttpSecurity http,
        @Value("${frontend.url:http://localhost:3000}") String frontendUrl
    ) throws Exception {
        http
            .cors(Customizer.withDefaults())

            // Temporarily disable CSRF completely to test
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(authorize -> {
                authorize
                
            //PERMITTED ROUTES//////////////////////////////////////////////////////////////////////////////
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Allow CORS preflight requests



            //ADMIN ONLY ROUTES//////////////////////////////////////////////////////////////////////////////
                
                //APPUSER
                .requestMatchers("/users/all").hasRole("ADMIN") //GET all users
                .requestMatchers("/users/user/{id}").hasRole("ADMIN") //GET user by ID
                .requestMatchers("/users/delete/{id}").hasRole("ADMIN") //DELETE user by ID
                .requestMatchers("/users/update/{id}").hasAnyRole("ADMIN", "CUSTOMER") //PUT update user details
                .requestMatchers("/users/update-preferences/{id}").hasAnyRole("ADMIN", "CUSTOMER") //PUT update user preferences
                
                //RESERVATION
                .requestMatchers("/reservations/all").hasRole("ADMIN") //GET all reservations
                .requestMatchers("/reservations/{id}/check-in").hasRole("ADMIN") //PUT check-in reservation
                .requestMatchers("/reservations/{id}/check-out").hasRole("ADMIN") //PUT check-out reservation
               
                //ROOM
                .requestMatchers("/rooms/new").hasRole("ADMIN") //POST new room
                .requestMatchers("/rooms/update/{id}").hasRole("ADMIN") //PUT update room
                .requestMatchers("/rooms/delete/{id}").hasRole("ADMIN") //DELETE room by ID
                
                //ROOM TYPE
                .requestMatchers("/room-types/create").hasRole("ADMIN") //POST create room type
                .requestMatchers("/room-types/update/{id}").hasRole("ADMIN") //PUT update room type
                .requestMatchers("/room-types/delete/{id}").hasRole("ADMIN") //DELETE room type by ID
                
                //TRANSACTION
                .requestMatchers("/transactions/all").hasRole("ADMIN") //GET all transactions
                .requestMatchers("/transactions/delete/{id}").hasRole("ADMIN") //DELETE transaction by ID



            //CUSTOMER OR ADMIN ROUTES///////////////////////////////////////////////////////////////////////

                //APPUSER
                .requestMatchers("/users/me").hasAnyRole("ADMIN", "CUSTOMER") //GET current user info
                .requestMatchers("/users/{userId}/payment-methods").hasAnyRole("ADMIN", "CUSTOMER") //GET user payment methods
                // .requestMatchers("/users/csrf").hasAnyRole("ADMIN", "CUSTOMER") //GET CSRF token
                .requestMatchers("/users/attach/{userId}/payment-methods/{paymentMethodId}").hasAnyRole("ADMIN", "CUSTOMER") //POST attach payment method
                .requestMatchers("/users/delete/{userId}/payment-methods/{paymentMethodId}").hasAnyRole("ADMIN", "CUSTOMER") //DELETE payment method from user

                //RESERVATION
                .requestMatchers("/reservations/user/{userId}").hasAnyRole("ADMIN", "CUSTOMER") //GET reservations by userId
                .requestMatchers("/reservations/new").hasAnyRole("ADMIN", "CUSTOMER") //POST new reservation with payment authorization (holds funds)
                .requestMatchers("/reservations/{id}/cancel").hasAnyRole("ADMIN", "CUSTOMER") //PUT cancel reservation (releases held payment)
                .requestMatchers("/reservations/{id}/update").hasAnyRole("ADMIN", "CUSTOMER") //PUT update reservation
                .requestMatchers("/reservations/delete/{id}").hasAnyRole("ADMIN", "CUSTOMER") //DELETE reservation by ID
                
                //ROOM TYPE
                .requestMatchers("/room-types/by-reservation/{reservationId}").hasAnyRole("ADMIN", "CUSTOMER") //GET room type by reservation ID
                
                //TRANSACTION
                .requestMatchers("/transactions/new").hasAnyRole("ADMIN", "CUSTOMER") //POST new transaction
                .requestMatchers("/transactions/{id}").hasAnyRole("ADMIN", "CUSTOMER") //GET transaction by ID
                .requestMatchers("/transactions/user/{userId}").hasAnyRole("ADMIN", "CUSTOMER") //GET transaction by USER ID
                .requestMatchers("/transactions/reservation/{reservationId}").hasAnyRole("ADMIN", "CUSTOMER") //GET transaction by RESERVATION ID



            //TEST ROUTES/////////////////////////////////////////////////////////////////////////////////////
                .requestMatchers("/tests/hello").permitAll()
                .requestMatchers("/tests/private-info").authenticated()



            //ALL OTHER ROUTES PERMITTED//////////////////////////////////////////////////////////////////////
                .anyRequest().permitAll();
            })
            
            

            //Basic AND Oauth both accepted
            //Oauth2 calls custom oauth2 user service to add user to OUR DB, then redirects to frontend home page
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .oidcUserService(customOAuth2UserService)
                )
                .defaultSuccessUrl(frontendUrl + "/auth/callback", true)
            )



            //force logout/delete tokens if needed
            .httpBasic(httpBasic -> httpBasic.authenticationEntryPoint(noPopupBasicAuthEntryPoint()))
            .logout(logout -> logout
                .logoutUrl("/logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(200);
                    response.getWriter().write("Logged out successfully");
                })
            );

        return http.build();
    }



    //Cors configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
        @Value("${frontend.url:http://localhost:3000}") String frontendUrl
    ) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendUrl));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*")); // Allow all headers
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