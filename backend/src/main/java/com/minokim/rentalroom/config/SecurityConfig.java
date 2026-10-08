package com.minokim.rentalroom.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http.authorizeHttpRequests(auth -> auth.requestMatchers(HttpMethod.POST, "/api/members")
                .permitAll()
                .requestMatchers(HttpMethod.GET, "/api/members/availability")
                .permitAll()
                .anyRequest()
                .authenticated());
        http.csrf(csrf -> csrf.ignoringRequestMatchers("/api/members"));

        return http.build();
    }
}
