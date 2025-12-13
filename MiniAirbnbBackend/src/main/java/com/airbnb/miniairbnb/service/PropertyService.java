package com.airbnb.miniairbnb.service;

import com.airbnb.miniairbnb.model.Property;
import com.airbnb.miniairbnb.model.User;

import java.util.List;
import java.util.Optional;

public interface PropertyService {
    Property createProperty(Property property, User host); //creeaza o proprietate noua (doar pt host sau admin)

    Property updateProperty(Long propertyId, Property propertyDetails, User currentUser); //Actuaalizeaza o proprietate (doar owner-ul sau ADMIN)

    void deleteProperty(Long propertyId, User currentUser); //sterge o proprietate (doar owner-ul sau ADMIN

    Optional<Property> findPropertyById(Long id);//gaseste proprietatea dupa id

    List<Property> findAllActiveProperties(); //gaseste toate proprietatile active (pt guest)

    List<Property> findPropertiesByHost(User host); //gaseste toate proprietatile unui host

    List<Property> findActivePropertiesByCity(String city); //filtrare proprietati active dupa oras

    List<Property> findActivePropertiesByCountry(String country); //filtrare proprietati active dupa tara

    boolean isPropertyOwner(Long propertyId, User user); //verifica daca utilizatorul este owner-ul proprietatii
}
