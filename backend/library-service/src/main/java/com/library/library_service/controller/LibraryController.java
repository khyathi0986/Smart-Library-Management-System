package com.library.library_service.controller;
import com.library.library_service.dto.*;
import com.library.library_service.model.*;
import com.library.library_service.service.LibraryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/library")
public class LibraryController {
 private final LibraryService service;
 public LibraryController(LibraryService service){this.service=service;}
 @GetMapping("/health") public String health(){return "Library Service is running";}
 @PostMapping("/loans") public Loan borrow(@Valid @RequestBody BorrowRequest req){return service.borrow(req);}
 @GetMapping("/loans") public List<Loan> allLoans(){return service.allLoans();}
 @GetMapping("/loans/active") public List<Loan> activeLoans(){return service.activeLoans();}
 @GetMapping("/loans/user/{userId}") public List<Loan> userLoans(@PathVariable Long userId){return service.userLoans(userId);}
 @PostMapping("/loans/{id}/return") public Loan returnBook(@PathVariable Long id){return service.returnBook(id);}
 @PostMapping("/loans/{id}/renew") public Loan renew(@PathVariable Long id){return service.renew(id);}
 @PostMapping("/reservations") public Reservation reserve(@Valid @RequestBody ReservationRequest req){return service.reserve(req);}
 @GetMapping("/reservations/user/{userId}") public List<Reservation> userReservations(@PathVariable Long userId){return service.userReservations(userId);}
 @GetMapping("/reservations/book/{bookId}/waiting") public List<Reservation> waitingReservations(@PathVariable Long bookId){return service.waitingReservations(bookId);}
 @DeleteMapping("/reservations/{id}") public Reservation cancelReservation(@PathVariable Long id){return service.cancelReservation(id);}
}
