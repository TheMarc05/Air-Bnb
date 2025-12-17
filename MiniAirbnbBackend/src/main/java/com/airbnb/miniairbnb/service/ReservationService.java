package com.airbnb.miniairbnb.service;

import com.airbnb.miniairbnb.model.Reservation;
import com.airbnb.miniairbnb.model.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReservationService {
    Reservation createReservation(Long propertyId, LocalDate checkInDate, LocalDate checkOutDate,
                                  Integer numberOfGuests, User guest); //creeaza o rezervare noua pt guest

    Reservation confirmReservation(Long reservationId, User currentUser); //confirma o rezervare (pt host sau admin)

    Reservation completeReservation(Long reservationId, User currentUser); //finalizeaza o rezervare (pt host sau admin)

    Reservation cancelReservation(Long reservationId, User currentUser); //anuleaza o rezervare (pt guest, host sau admin)

    Optional<Reservation> findReservationById(Long id); //gaseste rezervarea dupa id

    List<Reservation> findReservationsByGuest(User guest); //gaseste toate rezervarile unui guest

    List<Reservation> findReservationsByProperty(Long propertyId); //gaseste toate rezervarile pt o proprietate

    List<Reservation> findReservationsByHost(User host); //gaseste toate rezervarile unui host (prin proprietatile sale)

    boolean isPropertyAvailable(Long propertyId, LocalDate checkInDate, LocalDate checkOutDate); //verifica disponibilitatea unei proprietati intr-un interbal de date

    java.math.BigDecimal calculateTotalPrice(java.math.BigDecimal pricePerNight,
                                             LocalDate checkInDate, LocalDate checkOutDate); //calculeaza pretul total pt o rezervare
}
