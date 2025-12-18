package com.airbnb.miniairbnb.service;

import com.airbnb.miniairbnb.model.User;
import com.airbnb.miniairbnb.model.UserRole;

import java.util.List;
import java.util.Optional;

public interface UserService {
    User registerUser(String email, String password, String firstName, String lastName, UserRole role); //inregistrare utilizator nou

    Optional<User> findUserByEmail(String email); //gaseste utilizatorul dupa email

    Optional<User> findUserById(Long id); //gaseste utilizator dupa id

    List<User> findUsersByRole(UserRole role); //gaseste toti utilizatorii dupa rol

    boolean emailExists(String email); //verifica daca un email exista deja

    List<User> findAllUsers(); //gaseste toti utilizatorii, doar adminul

    User updateUserRole(Long userId, UserRole newRole);

    void deleteUser(Long userId);
}
