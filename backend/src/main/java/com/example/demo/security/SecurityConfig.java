package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**", "/error").permitAll()
                // preflight do CORS (o navegador manda OPTIONS sem token)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // imóveis: leitura pública, resto só ADMIN (inclui PATCH /imoveis/{id}/status)
                .requestMatchers(HttpMethod.GET, "/imoveis", "/imoveis/*").permitAll()
                .requestMatchers(HttpMethod.POST, "/imoveis/sabermais/*").permitAll()
                .requestMatchers("/imoveis/**").hasRole("ADMIN")

                // ofertas: admin lista todas e responde; cliente cria, vê as suas e cancela
                .requestMatchers(HttpMethod.GET, "/ofertas").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/ofertas/*/aceitar", "/ofertas/*/recusar").hasRole("ADMIN")
                // cliente = USER, COMPRADOR ou VENDEDOR
                .requestMatchers("/ofertas/**", "/favoritos/**").hasAnyRole("USER", "COMPRADOR", "VENDEDOR")

                // contratos: cliente vê os seus aprovados e assina; PDF para admin ou dono (checado no service); resto ADMIN
                .requestMatchers(HttpMethod.GET, "/contratos/meus").hasAnyRole("USER", "COMPRADOR", "VENDEDOR")
                .requestMatchers(HttpMethod.PATCH, "/contratos/*/assinar").hasAnyRole("USER", "COMPRADOR", "VENDEDOR")
                .requestMatchers(HttpMethod.GET, "/contratos/*/pdf").authenticated()
                .requestMatchers("/contratos/**").hasRole("ADMIN")

                // bairros e tipos: GET público (inclui paginação), escrita só ADMIN
                .requestMatchers(HttpMethod.GET, "/bairros/**", "/tiposimoveis/**").permitAll()
                .requestMatchers("/bairros/**", "/tiposimoveis/**").hasRole("ADMIN")

                // fotos: ver é público (detalhe do imóvel), upload só ADMIN
                .requestMatchers(HttpMethod.GET, "/fotos-imoveis/imovel/*", "/fotos-imoveis/arquivo/*").permitAll()

                .requestMatchers("/users/**", "/fotos-imoveis/**", "/email/**", "/painel/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .exceptionHandling(ex -> ex
                // sem token, token inválido ou expirado
                .authenticationEntryPoint((req, res, e) ->
                    writeJson(res, HttpServletResponse.SC_UNAUTHORIZED, "Token ausente, inválido ou expirado"))
                // token válido, mas a role não tem permissão
                .accessDeniedHandler((req, res, e) ->
                    writeJson(res, HttpServletResponse.SC_FORBIDDEN, "Acesso negado")))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // libera o front Angular (ng serve na porta 4200)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Location"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private static void writeJson(HttpServletResponse res, int status, String message) throws java.io.IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"status\":" + status + ",\"error\":\"" + message + "\"}");
    }
}
