package com.library.library_service.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="reservations", indexes={@Index(name="idx_res_book_status",columnList="bookId,status")})
public class Reservation {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private Long userId;
 @Column(nullable=false) private Long bookId;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private ReservationStatus status=ReservationStatus.WAITING;
 @Column(nullable=false) private LocalDateTime reservedAt=LocalDateTime.now();
 public Reservation(){}
 public Long getId(){return id;} public Long getUserId(){return userId;} public void setUserId(Long v){userId=v;}
 public Long getBookId(){return bookId;} public void setBookId(Long v){bookId=v;}
 public ReservationStatus getStatus(){return status;} public void setStatus(ReservationStatus v){status=v;}
 public LocalDateTime getReservedAt(){return reservedAt;}
}
