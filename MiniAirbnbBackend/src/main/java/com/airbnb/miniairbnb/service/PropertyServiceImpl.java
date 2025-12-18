package com.airbnb.miniairbnb.service;

import com.airbnb.miniairbnb.model.Property;
import com.airbnb.miniairbnb.model.User;
import com.airbnb.miniairbnb.model.UserRole;
import com.airbnb.miniairbnb.repository.PropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PropertyServiceImpl implements PropertyService {
    private final PropertyRepository propertyRepository;
    private final com.airbnb.miniairbnb.repository.ReservationRepository reservationRepository;

    public PropertyServiceImpl(PropertyRepository propertyRepository, 
                               com.airbnb.miniairbnb.repository.ReservationRepository reservationRepository) {
        this.propertyRepository = propertyRepository;
        this.reservationRepository = reservationRepository;
    }

    @Override
    public Property createProperty(Property property, User host){
        //verifica daca utilizatorul este host sau ADMIN
        if(host.getRole() != UserRole.ROLE_HOST && host.getRole() != UserRole.ROLE_ADMIN){
            throw new RuntimeException("Only HOST or ADMIN can create properties");
        }

        //seteaza host-ul proprietatii
        property.setHost(host);
        property.setIsActive(true); //Implicit activa

        return propertyRepository.save(property);
    }

    @Override
    public Property updateProperty(Long propertyId, Property propertyDetails, User currentUser){
        Property existingProperty = propertyRepository.findById(propertyId).orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        //verifica ownership sau daca este admin
        if(!isPropertyOwner(propertyId, currentUser) && currentUser.getRole() != UserRole.ROLE_ADMIN){
            throw new RuntimeException("You don't have permission to update this property");
        }

        //actualizeaza campurile (pastreaza host-ul original)
        if (propertyDetails.getTitle() != null) {
            existingProperty.setTitle(propertyDetails.getTitle());
        }
        if (propertyDetails.getDescription() != null) {
            existingProperty.setDescription(propertyDetails.getDescription());
        }
        if (propertyDetails.getAddress() != null) {
            existingProperty.setAddress(propertyDetails.getAddress());
        }
        if (propertyDetails.getCity() != null) {
            existingProperty.setCity(propertyDetails.getCity());
        }
        if (propertyDetails.getCountry() != null) {
            existingProperty.setCountry(propertyDetails.getCountry());
        }
        if (propertyDetails.getPricePerNight() != null) {
            existingProperty.setPricePerNight(propertyDetails.getPricePerNight());
        }
        if (propertyDetails.getBedrooms() != null) {
            existingProperty.setBedrooms(propertyDetails.getBedrooms());
        }
        if (propertyDetails.getBathrooms() != null) {
            existingProperty.setBathrooms(propertyDetails.getBathrooms());
        }
        if (propertyDetails.getMaxGuests() != null) {
            existingProperty.setMaxGuests(propertyDetails.getMaxGuests());
        }
        if (propertyDetails.getIsActive() != null) {
            existingProperty.setIsActive(propertyDetails.getIsActive());
        }
        if (propertyDetails.getImageUrls() != null) {
            existingProperty.setImageUrls(propertyDetails.getImageUrls());
        }

        return propertyRepository.save(existingProperty);
    }

    @Override
    public void deleteProperty(Long propertyId, User currentUser){
        Property property = propertyRepository.findById(propertyId).orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        if(!isPropertyOwner(propertyId, currentUser) && currentUser.getRole() != UserRole.ROLE_ADMIN){
            throw new RuntimeException("You don't have permission to delete this property");
        }

        // Verificăm dacă există rezervări (în afara celor anulate)
        long activeReservations = reservationRepository.findByProperty(property).stream()
                .filter(r -> r.getStatus() != com.airbnb.miniairbnb.model.ReservationStatus.CANCELLED)
                .count();

        if (activeReservations > 0) {
            throw new RuntimeException("Această proprietate are rezervări active sau finalizate și nu poate fi ștearsă. Poți în schimb să o dezactivezi.");
        }

        propertyRepository.delete(property);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Property> findPropertyById(Long id){
        return propertyRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Property> findAllActiveProperties() {
        return propertyRepository.findByIsActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Property> findAllProperties() {
        return propertyRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Property> findPropertiesByHost(User host) {
        return propertyRepository.findByHost(host);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Property> findActivePropertiesByCity(String city) {
        return propertyRepository.findByCityAndIsActiveTrue(city);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Property> findActivePropertiesByCountry(String country) {
        return propertyRepository.findByCountryAndIsActiveTrue(country);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isPropertyOwner(Long propertyId, User user) {
        return propertyRepository.findByIdAndHost(propertyId, user).isPresent();
    }
}
