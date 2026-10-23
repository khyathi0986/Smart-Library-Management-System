package com.library.library_service.repository;
import com.library.library_service.model.Reservation;
import com.library.library_service.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ReservationRepository extends JpaRepository<Reservation,Long> {
 List<Reservation> findByUserIdOrderByReservedAtDesc(Long userId);
 List<Reservation> findByBookIdAndStatusOrderByReservedAtAsc(Long bookId, ReservationStatus status);
 boolean existsByUserIdAndBookIdAndStatus(Long userId, Long bookId, ReservationStatus status);
}
