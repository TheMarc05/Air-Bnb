package com.airbnb.miniairbnb.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = false)
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Column(length = 2000)
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Column(nullable = false)
    @NotBlank(message = "Address is required")
    private String address;

    @Column(nullable = false)
    @NotBlank(message = "City is required")
    private String city;

    @Column(nullable = false)
    @NotBlank(message = "Country is required")
    private String country;

    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Price per night is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal pricePerNight; //precizie pt performanta

    @Column(nullable = false)
    @Min(value = 1, message = "Bedrooms must be at least 1")
    private Integer bedrooms;

    @Column(nullable = false)
    @Min(value = 1, message = "Bathrooms must be at least 1")
    private Integer bathrooms;

    @Column(nullable = false)
    @Min(value = 1, message = "Max guests must be at least 1")
    private Integer maxGuests;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; //proprietatea este activa/disponibila

    //relatie many to one cu user (host-ul proprietatii)
    @ManyToOne(fetch = FetchType.LAZY) //incarcare kazy pt performanta
    @JoinColumn(name = "host_id", nullable = false)
    @NotNull(message = "Host is required")
    private User host;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    @PrePersist // Lifecycle callbacks pentru timestamp-uri
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
