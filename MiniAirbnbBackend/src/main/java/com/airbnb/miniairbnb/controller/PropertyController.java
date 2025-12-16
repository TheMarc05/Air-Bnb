package com.airbnb.miniairbnb.controller;

import com.airbnb.miniairbnb.model.Property;
import com.airbnb.miniairbnb.model.User;
import com.airbnb.miniairbnb.model.UserRole;
import com.airbnb.miniairbnb.service.PropertyService;
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
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:3000")
public class PropertyController {
    private final PropertyService propertyService;
    private final UserService userService;

    public PropertyController(PropertyService propertyService,
                              UserService userService) {
        this.propertyService = propertyService;
        this.userService = userService;
    }

    //helper method pt a obtine utilizatorul curent autentificat
    //extrage utilizatorul curent din SecurityContext
    //foloseste UserService pt a obtine User complet
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            return userService.findUserByEmail(userDetails.getUsername())
                    .orElse(null);
        }
        return null;
    }

    //GET /api/properties - lista cu toate proprietatile active (pt guest)
    @GetMapping
    public ResponseEntity<List<Property>> getAllActiveProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String country) {

        List<Property> properties;

        if (city != null && !city.isEmpty()) {
            properties = propertyService.findActivePropertiesByCity(city);
        } else if (country != null && !country.isEmpty()) {
            properties = propertyService.findActivePropertiesByCountry(country);
        } else {
            properties = propertyService.findAllActiveProperties();
        }

        return ResponseEntity.ok(properties);
    }

    //GET /api/properties/{id} - gaseste o proprietate dupa id
    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        Optional<Property> property = propertyService.findPropertyById(id);

        if (property.isPresent()) {
            return ResponseEntity.ok(property.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    //GET /api/properties/my-properties - lista cu proprietatile utilizatorului curent (pt host)
    @GetMapping("/my-properties")
    public ResponseEntity<List<Property>> getMyProperties() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Property> properties = propertyService.findPropertiesByHost(currentUser);
        return ResponseEntity.ok(properties);
    }

    // POST /api/properties - creeazaa o proprietate noua (pt host sau admin)
    @PostMapping
    public ResponseEntity<?> createProperty(@Valid @RequestBody Property property) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (currentUser.getRole() != UserRole.ROLE_HOST && currentUser.getRole() != UserRole.ROLE_ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only HOST or ADMIN can create properties");
        }

        try {
            Property createdProperty = propertyService.createProperty(property, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProperty);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // PUT /api/properties/{id} - actualizeaza o proprietate (pt host sau admin)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProperty(@PathVariable Long id,
                                            @Valid @RequestBody Property propertyDetails) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Property updatedProperty = propertyService.updateProperty(id, propertyDetails, currentUser);
            return ResponseEntity.ok(updatedProperty);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // DELETE /api/properties/{id} - sterge o proprietate (pt host sau admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            propertyService.deleteProperty(id, currentUser);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}

