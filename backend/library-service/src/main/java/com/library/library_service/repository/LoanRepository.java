package com.library.library_service.repository;
import com.library.library_service.model.Loan;
import com.library.library_service.model.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface LoanRepository extends JpaRepository<Loan,Long> {
 List<Loan> findByUserIdOrderByBorrowDateDesc(Long userId);
 List<Loan> findByStatusOrderByDueDateAsc(LoanStatus status);
 boolean existsByUserIdAndBookIdAndStatus(Long userId, Long bookId, LoanStatus status);
}
