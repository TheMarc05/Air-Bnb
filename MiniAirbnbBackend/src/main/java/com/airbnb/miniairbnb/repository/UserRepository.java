package com.airbnb.miniairbnb.repository;

import com.airbnb.miniairbnb.model.User;
import com.airbnb.miniairbnb.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); //metoda pt gasirea utilizatorului dupa email

    boolean existsByEmail(String email); //metoda pt verificarea existentei unui email

    List<User> findByRole(UserRole role); //metoda pt gasirea tuturor utilizatorilor dupa rol
}

//extends JpaRepository<User, Long> - User e tipul entitatii si Long e tipul cheii primare