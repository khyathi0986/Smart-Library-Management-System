package com.library.library_service.service;

import com.library.library_service.dto.BorrowRequest;
import com.library.library_service.dto.ReservationRequest;
import com.library.library_service.model.*;
import com.library.library_service.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LibraryService {
 private static final int LOAN_DAYS=14, MAX_RENEWALS=1;
 private static final BigDecimal FINE_PER_DAY=new BigDecimal("5.00");
 private final LoanRepository loans; private final ReservationRepository reservations;
 public LibraryService(LoanRepository loans, ReservationRepository reservations){this.loans=loans;this.reservations=reservations;}
 @Transactional public Loan borrow(BorrowRequest req){
  if(loans.existsByUserIdAndBookIdAndStatus(req.userId(),req.bookId(),LoanStatus.BORROWED)) throw new ResponseStatusException(HttpStatus.CONFLICT,"User already has this book on loan");
  Loan l=new Loan(); l.setUserId(req.userId()); l.setBookId(req.bookId()); l.setBorrowDate(LocalDate.now()); l.setDueDate(LocalDate.now().plusDays(LOAN_DAYS)); l.setStatus(LoanStatus.BORROWED); return loans.save(l);
 }
 @Transactional public Loan returnBook(Long id){
  Loan l=loans.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Loan not found"));
  if(l.getStatus()==LoanStatus.RETURNED) throw new ResponseStatusException(HttpStatus.CONFLICT,"Loan has already been returned");
  LocalDate today=LocalDate.now(); long daysLate=Math.max(0,ChronoUnit.DAYS.between(l.getDueDate(),today));
  l.setFine(FINE_PER_DAY.multiply(BigDecimal.valueOf(daysLate))); l.setReturnDate(today); l.setStatus(LoanStatus.RETURNED); return loans.save(l);
 }
 @Transactional public Loan renew(Long id){
  Loan l=loans.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Loan not found"));
  if(l.getStatus()!=LoanStatus.BORROWED) throw new ResponseStatusException(HttpStatus.CONFLICT,"Only active loans can be renewed");
  if(l.getRenewalCount()>=MAX_RENEWALS) throw new ResponseStatusException(HttpStatus.CONFLICT,"Renewal limit reached");
  if(LocalDate.now().isAfter(l.getDueDate())) throw new ResponseStatusException(HttpStatus.CONFLICT,"Overdue books cannot be renewed");
  l.setDueDate(l.getDueDate().plusDays(LOAN_DAYS)); l.setRenewalCount(l.getRenewalCount()+1); return loans.save(l);
 }
 public List<Loan> allLoans(){return loans.findAll();}
 public List<Loan> userLoans(Long userId){return loans.findByUserIdOrderByBorrowDateDesc(userId);}
 public List<Loan> activeLoans(){return loans.findByStatusOrderByDueDateAsc(LoanStatus.BORROWED);}
 @Transactional public Reservation reserve(ReservationRequest req){
  if(reservations.existsByUserIdAndBookIdAndStatus(req.userId(),req.bookId(),ReservationStatus.WAITING)) throw new ResponseStatusException(HttpStatus.CONFLICT,"An active reservation already exists");
  Reservation r=new Reservation(); r.setUserId(req.userId()); r.setBookId(req.bookId()); r.setStatus(ReservationStatus.WAITING); return reservations.save(r);
 }
 public List<Reservation> userReservations(Long userId){return reservations.findByUserIdOrderByReservedAtDesc(userId);}
 public List<Reservation> waitingReservations(Long bookId){return reservations.findByBookIdAndStatusOrderByReservedAtAsc(bookId,ReservationStatus.WAITING);}
 @Transactional public Reservation cancelReservation(Long id){Reservation r=reservations.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Reservation not found")); if(r.getStatus()!=ReservationStatus.WAITING) throw new ResponseStatusException(HttpStatus.CONFLICT,"Reservation is no longer waiting"); r.setStatus(ReservationStatus.CANCELLED); return reservations.save(r);}
}
