package com.airbnb.miniairbnb.service;

import com.airbnb.miniairbnb.model.*;
import com.airbnb.miniairbnb.repository.PropertyRepository;
import com.airbnb.miniairbnb.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ReservationServiceImpl implements ReservationService{
    private final ReservationRepository reservationRepository;
    private final PropertyRepository propertyRepository;

    public ReservationServiceImpl(ReservationRepository reservationRepository,
                                  PropertyRepository propertyRepository) {
        this.reservationRepository = reservationRepository;
        this.propertyRepository = propertyRepository;
    }

    @Override
    public Reservation createReservation(Long propertyId, LocalDate checkInDate, LocalDate checkOutDate, Integer numberOfGuests, User guest) {
        //gaseste proprietatea
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        //verifica daca utilizatorul este host-ul proprietatii
        if (property.getHost().getId().equals(guest.getId())) {
            throw new RuntimeException("Nu poți închiria deoarece ești host-ul!");
        }

        //verifica daca proprietatea este activa
        if (!property.getIsActive()) {
            throw new RuntimeException("Property is not available");
        }

        //validare date
        if (checkInDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Check-in date cannot be in the past");
        }
        if (checkOutDate.isBefore(checkInDate) || checkOutDate.isEqual(checkInDate)) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        //verifica numarul de oaspeti
        if (numberOfGuests > property.getMaxGuests()) {
            throw new RuntimeException("Number of guests exceeds property capacity");
        }

        //verifica disponibilitatea
        if (!isPropertyAvailable(propertyId, checkInDate, checkOutDate)) {
            throw new RuntimeException("Property is not available for the selected dates");
        }

        BigDecimal totalPrice = calculateTotalPrice(property.getPricePerNight(), checkInDate, checkOutDate); //calculeaza pretul total

        //creeaza rezervarea
        Reservation reservation = new Reservation();
        reservation.setProperty(property);
        reservation.setGuest(guest);
        reservation.setCheckInDate(checkInDate);
        reservation.setCheckOutDate(checkOutDate);
        reservation.setNumberOfGuests(numberOfGuests);
        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(ReservationStatus.PENDING);

        return reservationRepository.save(reservation);
    }

    @Override
    public Reservation confirmReservation(Long reservationId, User currentUser){
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        //verifica daca utilizatorul este host-ul proprietatii sau admin
        if (currentUser.getRole() != UserRole.ROLE_ADMIN &&
                !reservation.getProperty().getHost().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only property host or ADMIN can confirm reservations");
        }

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new RuntimeException("Only PENDING reservations can be confirmed");
        }

        reservation.setStatus(ReservationStatus.CONFIRMED);
        return reservationRepository.save(reservation);
    }

    @Override
    public Reservation completeReservation(Long reservationId, User currentUser) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        //verifica daca utilizatorul este host-ul proprietatii sau admin
        if (currentUser.getRole() != UserRole.ROLE_ADMIN &&
                !reservation.getProperty().getHost().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only property host or ADMIN can complete reservations");
        }

        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new RuntimeException("Only CONFIRMED reservations can be completed");
        }

        reservation.setStatus(ReservationStatus.COMPLETED);
        return reservationRepository.save(reservation);
    }

    @Override
    public Reservation cancelReservation(Long reservationId, User currentUser){
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        //verifica daca utilizatorul este guest, host sau admin
        boolean isGuest = reservation.getGuest().getId().equals(currentUser.getId());
        boolean isHost = reservation.getProperty().getHost().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == UserRole.ROLE_ADMIN;

        if (!isGuest && !isHost && !isAdmin) {
            throw new RuntimeException("You don't have permission to cancel this reservation");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Reservation is already cancelled");
        }

        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed reservation");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        return reservationRepository.save(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Reservation> findReservationById(Long id) {
        return reservationRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reservation> findReservationsByGuest(User guest) {
        return reservationRepository.findByGuest(guest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reservation> findReservationsByProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));
        return reservationRepository.findByProperty(property);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reservation> findReservationsByHost(User host) {
        return reservationRepository.findByPropertyHost(host);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isPropertyAvailable(Long propertyId, LocalDate checkInDate, LocalDate checkOutDate) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        if (!property.getIsActive()) {
            return false;
        }

        // Găsește rezervări CONFIRMED care se suprapun cu intervalul dat
        List<Reservation> conflictingReservations = reservationRepository
                .findByPropertyAndStatusAndCheckInDateLessThanEqualAndCheckOutDateGreaterThanEqual(
                        property,
                        ReservationStatus.CONFIRMED,
                        checkOutDate,
                        checkInDate
                );

        return conflictingReservations.isEmpty();
    }

    @Override
    public BigDecimal calculateTotalPrice(BigDecimal pricePerNight, LocalDate checkInDate, LocalDate checkOutDate) {
        long nights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        return pricePerNight.multiply(BigDecimal.valueOf(nights));
    }
}
