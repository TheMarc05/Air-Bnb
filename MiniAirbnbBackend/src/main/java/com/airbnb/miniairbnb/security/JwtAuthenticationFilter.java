package com.airbnb.miniairbnb.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// ELIMINĂM @Component pentru a evita înregistrarea dublă de către Spring Boot
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                   UserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Permite request-urile OPTIONS (preflight) să treacă fără procesare
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = getTokenFromRequest(request); //extrage token-ul din header

        //verifica daca token-ul exista si este valid
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String username = jwtTokenProvider.getUsernameFromToken(token); //extrage username din token

                UserDetails userDetails = userDetailsService.loadUserByUsername(username); //incarca UserDetails

                //valideaza token-ul
                if (jwtTokenProvider.validateToken(token, userDetails)) {
                    //creeaza authentication object
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication); //seteaza authentication in SecurityContext
                }
            } catch (Exception e) {
                // Dacă token-ul este invalid sau expirat, curățăm contextul pentru a trata cererea ca anonimă
                // Rutele permitAll vor funcționa în continuare, cele protejate vor da 401/403 ulterior
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response); //continua cu filter chain
    }

    //extrage token-ul din header "Authorization: Bearer <token>"
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); //elimina "bearer " prefix
        }
        return null;
    }
}
