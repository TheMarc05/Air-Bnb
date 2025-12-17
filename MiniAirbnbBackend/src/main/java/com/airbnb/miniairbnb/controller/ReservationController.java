package com.airbnb.miniairbnb.controller;

import com.airbnb.miniairbnb.dto.ReservationRequest;
import com.airbnb.miniairbnb.model.Reservation;
import com.airbnb.miniairbnb.model.User;
import com.airbnb.miniairbnb.model.UserRole;
import com.airbnb.miniairbnb.service.ReservationService;
import com.airbnb.miniairbnb.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ReservationController {
    private final ReservationService reservationService;
    private final UserService userService;

    public ReservationController(ReservationService reservationService, UserService userService) {
        this.reservationService = reservationService;
        this.userService = userService;
    }

    //helper method pt a obtine utilizatorul curent autentificat
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            return userService.findUserByEmail(userDetails.getUsername())
                    .orElse(null);
        }
        return null;
    }

    //POST /api/reservations - creeaza o rezervare (pt guest)
    @PostMapping
    public ResponseEntity<?> createReservation(@Valid @RequestBody ReservationRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (currentUser.getRole() != UserRole.ROLE_GUEST && currentUser.getRole() != UserRole.ROLE_ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only GUEST or ADMIN can create reservations");
        }

        try {
            Reservation reservation = reservationService.createReservation(
                    request.getPropertyId(),
                    request.getCheckInDate(),
                    request.getCheckOutDate(),
                    request.getNumberOfGuests(),
                    currentUser
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    //GET /api/reservations/my-reservations - lista cu rezervarile utilizatorului curent (pt guest)
    @GetMapping("/my-reservations")
    public ResponseEntity<List<Reservation>> getMyReservations() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Reservation> reservations = reservationService.findReservationsByGuest(currentUser);
        return ResponseEntity.ok(reservations);
    }

    // GET /api/reservations/host-reservations - lista cu rezervarile pt proprietatile host-ului (pt host)
    @GetMapping("/host-reservations")
    public ResponseEntity<List<Reservation>> getHostReservations() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (currentUser.getRole() != UserRole.ROLE_HOST && currentUser.getRole() != UserRole.ROLE_ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Reservation> reservations = reservationService.findReservationsByHost(currentUser);
        return ResponseEntity.ok(reservations);
    }

    // PUT /api/reservations/{id}/confirm - confirma o rezervare (pt host sau admin)
    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmReservation(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Reservation reservation = reservationService.confirmReservation(id, currentUser);
            return ResponseEntity.ok(reservation);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // PUT /api/reservations/{id}/cancel - anuleaza o rezervare (pt guest, host sau admin)
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Reservation reservation = reservationService.cancelReservation(id, currentUser);
            return ResponseEntity.ok(reservation);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // GET /api/reservations/property/{propertyId} - lista cu rezervarile pentru o proprietate
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Reservation>> getReservationsByProperty(@PathVariable Long propertyId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Reservation> reservations = reservationService.findReservationsByProperty(propertyId);
        return ResponseEntity.ok(reservations);
    }

    // GET /api/reservations/{id} - gaseste o rezervare dupa id
    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable Long id) {
        Optional<Reservation> reservation = reservationService.findReservationById(id);

        if (reservation.isPresent()) {
            return ResponseEntity.ok(reservation.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
