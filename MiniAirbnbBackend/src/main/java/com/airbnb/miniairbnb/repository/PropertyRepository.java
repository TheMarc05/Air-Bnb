package com.airbnb.miniairbnb.repository;

import com.airbnb.miniairbnb.model.Property;
import com.airbnb.miniairbnb.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByHost(User host); //gaseste toate proprietatile unui host

    List<Property> findByIsActiveTrue(); //gaseste toate proprietatile active

    List<Property> findByCityAndIsActiveTrue(String city); //gaseste proprietati active dintr-un oras

    List<Property> findByCountryAndIsActiveTrue(String country); //gaseste proprietati active dintr-o tara

    Optional<Property> findByIdAndHost(Long id, User host); //gaseste proprietatea dupa id si host (pt verificare ownership)
}
