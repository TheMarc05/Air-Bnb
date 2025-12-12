package com.airbnb.miniairbnb.service;

import com.airbnb.miniairbnb.model.User;
import com.airbnb.miniairbnb.model.UserRole;
import com.airbnb.miniairbnb.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; //hash parola inainte de salvare

    //constructor injection
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User registerUser(String email, String password, String firstName, String lastName, UserRole role){
        //verifica daca email-ul exista deja
        if(userRepository.existsByEmail(email)){
            throw new RuntimeException("Email already exists: " + email);
        }

        //creeaza utilizatorul nou
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password)); //hash-uieste parola
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);

        return userRepository.save(user);//salveaza in baza de date
    }

    @Override
    @Transactional(readOnly = true) //pt metodele de citire, asigura consistenta datelor pt operatiile de scriere
    public Optional<User> findUserByEmail(String email){
        return userRepository.findByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findUserById(Long id) {
        return  userRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> findUsersByRole(UserRole role){
        return userRepository.findByRole(role);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email){
        return userRepository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> findAllUsers(){
        return userRepository.findAll();
    }
}
