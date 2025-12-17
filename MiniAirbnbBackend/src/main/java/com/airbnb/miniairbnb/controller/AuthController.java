package com.airbnb.miniairbnb.controller;

import com.airbnb.miniairbnb.dto.AuthResponse;
import com.airbnb.miniairbnb.dto.LoginRequest;
import com.airbnb.miniairbnb.dto.RegisterRequest;
import com.airbnb.miniairbnb.model.User;
import com.airbnb.miniairbnb.model.UserRole;
import com.airbnb.miniairbnb.security.CustomUserDetailsService;
import com.airbnb.miniairbnb.security.JwtTokenProvider;
import com.airbnb.miniairbnb.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtTokenProvider jwtTokenProvider,
                          CustomUserDetailsService userDetailsService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    //endpoint pt register
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            //verifica daca email exista deja
            if (userService.emailExists(registerRequest.getEmail())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Email already exists");
            }

            //creeaza un utilizator nou
            User user = userService.registerUser(
                    registerRequest.getEmail(),
                    registerRequest.getPassword(),
                    registerRequest.getFirstName(),
                    registerRequest.getLastName(),
                    registerRequest.getRole()
            );

            //genereaza token JWT
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtTokenProvider.generateToken(userDetails);

            //returneaza raspuns cu token
            AuthResponse authResponse = new AuthResponse(
                    token,
                    user.getId(),
                    user.getEmail(),
                    user.getRole().name()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    //endpoint pt login
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            //autentifica utilizatorul
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            //genereaza token JWT
            UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());
            String token = jwtTokenProvider.generateToken(userDetails);

            //gaseste utilizatorul pt a obtine rolul
            User user = userService.findUserByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            //returneaza raspuns cu token
            AuthResponse authResponse = new AuthResponse(
                    token,
                    user.getId(),
                    user.getEmail(),
                    user.getRole().name()
            );

            return ResponseEntity.ok(authResponse);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }

    @PostMapping("/become-host")
    public ResponseEntity<?> becomeHost(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.findUserByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            //verifica daca utilizatorul este deja host sau admin
            if (user.getRole() == UserRole.ROLE_HOST || user.getRole() == UserRole.ROLE_ADMIN) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("User is already a host or admin");
            }

            //actualizeaza rolul la host
            user = userService.updateUserRole(user.getId(), UserRole.ROLE_HOST);

            //genereaza un token nou cu noul rol
            UserDetails updatedUserDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtTokenProvider.generateToken(updatedUserDetails);

            AuthResponse authResponse = new AuthResponse(
                    token,
                    user.getId(),
                    user.getEmail(),
                    user.getRole().name()
            );

            return ResponseEntity.ok(authResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
