package com.airbnb.miniairbnb.repository;

import com.airbnb.miniairbnb.model.Property;
import com.airbnb.miniairbnb.model.Reservation;
import com.airbnb.miniairbnb.model.ReservationStatus;
import com.airbnb.miniairbnb.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByGuest(User guest); //gaseste toate rezervarile unui guest

    List<Reservation> findByProperty(Property property); //gaseste toate rezervarile pt o proprietate

    List<Reservation> findByPropertyHost(User host); //gaseste rezervarile unui host (prin proprietatile sale)

    List<Reservation> findByStatus(ReservationStatus status); //gaseste rezervari dupa status

    //gaaseste rezervari active (CONFIRMED) pt o proprietate intr-un interval de date
    List<Reservation> findByPropertyAndStatusAndCheckInDateLessThanEqualAndCheckOutDateGreaterThanEqual(Property property, ReservationStatus status, LocalDate checkInDate, LocalDate checkOutDate);

    Optional<Reservation> findByIdAndGuest(Long id, User guest); //gaseste rezervarea dupa id si guest (pt verificare ownership)
}
