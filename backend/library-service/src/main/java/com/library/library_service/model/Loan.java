package com.library.library_service.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name="loans", indexes={@Index(name="idx_loan_user",columnList="userId"),@Index(name="idx_loan_book",columnList="bookId")})
public class Loan {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private Long userId;
    @Column(nullable=false) private Long bookId;
    @Column(nullable=false) private LocalDate borrowDate;
    @Column(nullable=false) private LocalDate dueDate;
    private LocalDate returnDate;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private LoanStatus status=LoanStatus.BORROWED;
    @Column(nullable=false) private int renewalCount=0;
    @Column(nullable=false, precision=10, scale=2) private BigDecimal fine=BigDecimal.ZERO;
    @Column(nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
    public Loan() {}
    public Long getId(){return id;} public Long getUserId(){return userId;} public void setUserId(Long v){userId=v;}
    public Long getBookId(){return bookId;} public void setBookId(Long v){bookId=v;}
    public LocalDate getBorrowDate(){return borrowDate;} public void setBorrowDate(LocalDate v){borrowDate=v;}
    public LocalDate getDueDate(){return dueDate;} public void setDueDate(LocalDate v){dueDate=v;}
    public LocalDate getReturnDate(){return returnDate;} public void setReturnDate(LocalDate v){returnDate=v;}
    public LoanStatus getStatus(){return status;} public void setStatus(LoanStatus v){status=v;}
    public int getRenewalCount(){return renewalCount;} public void setRenewalCount(int v){renewalCount=v;}
    public BigDecimal getFine(){return fine;} public void setFine(BigDecimal v){fine=v;}
    public LocalDateTime getCreatedAt(){return createdAt;}
}
