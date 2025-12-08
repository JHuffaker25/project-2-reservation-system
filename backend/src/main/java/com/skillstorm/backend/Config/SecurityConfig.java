package com.skillstorm.backend.Config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        
        http
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/users/hello").permitAll()
                .requestMatchers("/users/private-info").authenticated()
            )
            
            .httpBasic(Customizer.withDefaults());


        return http.build();
    }
}
