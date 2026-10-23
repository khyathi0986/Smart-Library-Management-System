
package com.library.book_service.security;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())

            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, exception) -> {
                    response.setStatus(
                            HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write(
                            "{\"error\":\"Authentication required\"}");
                })
                .accessDeniedHandler((request, response, exception) -> {
                    response.setStatus(
                            HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write(
                            "{\"error\":\"Insufficient permissions\"}");
                }))

            .authorizeHttpRequests(auth -> auth

                // Public catalogue reads
                .requestMatchers(HttpMethod.GET, "/api/books")
                    .permitAll()
                .requestMatchers(HttpMethod.GET, "/api/books/**")
                    .permitAll()

                // Only librarians can modify books
                .requestMatchers(HttpMethod.POST, "/api/books/**")
                    .hasRole("LIBRARIAN")
                .requestMatchers(HttpMethod.PUT, "/api/books/**")
                    .hasRole("LIBRARIAN")
                .requestMatchers(HttpMethod.PATCH, "/api/books/**")
                    .hasRole("LIBRARIAN")
                .requestMatchers(HttpMethod.DELETE, "/api/books/**")
                    .hasRole("LIBRARIAN")

                // Any other endpoint requires authentication
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
