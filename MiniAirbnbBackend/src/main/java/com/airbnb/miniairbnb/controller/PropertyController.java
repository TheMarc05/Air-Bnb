package com.airbnb.miniairbnb.controller;

import com.airbnb.miniairbnb.model.Property;
import com.airbnb.miniairbnb.model.User;
import com.airbnb.miniairbnb.model.UserRole;
import com.airbnb.miniairbnb.service.PropertyService;
import com.airbnb.miniairbnb.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/properties")
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

    // GET /api/properties/all - lista cu toate proprietatile (doar pt ADMIN)
    @GetMapping("/all")
    public ResponseEntity<List<Property>> getAllProperties() {
        User currentUser = getCurrentUser();
        if (currentUser == null || currentUser.getRole() != UserRole.ROLE_ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(propertyService.findAllProperties());
    }

    // GET /api/properties/user/{userId} - lista cu proprietatile unui utilizator specific (doar pt ADMIN)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Property>> getPropertiesByUser(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        if (currentUser == null || currentUser.getRole() != UserRole.ROLE_ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return userService.findUserById(userId)
                .map(user -> ResponseEntity.ok(propertyService.findPropertiesByHost(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/properties - creeazaa o proprietate noua (pt host sau admin)
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createProperty(
            @RequestPart("property") String propertyJson,
            @RequestPart(value = "images", required = false) MultipartFile[] images) {
        
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (currentUser.getRole() != UserRole.ROLE_HOST && currentUser.getRole() != UserRole.ROLE_ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only HOST or ADMIN can create properties");
        }

        try {
            // Mapăm JSON-ul manual către obiectul Property
            ObjectMapper objectMapper = new ObjectMapper();
            // Înregistrăm modulele necesare pentru Java 8 date/time
            objectMapper.findAndRegisterModules();
            Property property = objectMapper.readValue(propertyJson, Property.class);
            
            List<String> imageUrls = new ArrayList<>();
            if (images != null) {
                String uploadDir = "uploads/";
                Files.createDirectories(Paths.get(uploadDir));

                for (MultipartFile image : images) {
                    if (image.isEmpty()) continue;
                    // Curățăm numele fișierului de spații pentru a evita problemele de URL
                    String originalFilename = image.getOriginalFilename() != null ? image.getOriginalFilename().replace(" ", "_") : "image";
                    String fileName = UUID.randomUUID().toString() + "_" + originalFilename;
                    Path filePath = Paths.get(uploadDir + fileName);
                    Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                    imageUrls.add("http://localhost:8080/uploads/" + fileName);
                }
            }
            property.setImageUrls(imageUrls);

            Property createdProperty = propertyService.createProperty(property, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProperty);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading images: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // PUT /api/properties/{id} - actualizeaza o proprietate (pt host sau admin)
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateProperty(
            @PathVariable Long id,
            @RequestPart("property") String propertyJson,
            @RequestPart(value = "images", required = false) MultipartFile[] images) {
        
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.findAndRegisterModules();
            Property propertyDetails = objectMapper.readValue(propertyJson, Property.class);

            if (images != null && images.length > 0) {
                String uploadDir = "uploads/";
                Files.createDirectories(Paths.get(uploadDir));
                
                List<String> newImageUrls = new ArrayList<>();
                // Păstrăm imaginile existente dacă vin în JSON
                if (propertyDetails.getImageUrls() != null) {
                    newImageUrls.addAll(propertyDetails.getImageUrls());
                }

                for (MultipartFile image : images) {
                    if (image.isEmpty()) continue;
                    // Curățăm numele fișierului de spații pentru a evita problemele de URL
                    String originalFilename = image.getOriginalFilename() != null ? image.getOriginalFilename().replace(" ", "_") : "image";
                    String fileName = UUID.randomUUID().toString() + "_" + originalFilename;
                    Path filePath = Paths.get(uploadDir + fileName);
                    Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                    newImageUrls.add("http://localhost:8080/uploads/" + fileName);
                }
                propertyDetails.setImageUrls(newImageUrls);
            }

            Property updatedProperty = propertyService.updateProperty(id, propertyDetails, currentUser);
            return ResponseEntity.ok(updatedProperty);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading images: " + e.getMessage());
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

