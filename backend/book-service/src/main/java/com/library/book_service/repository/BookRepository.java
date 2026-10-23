
package com.library.book_service.repository;

import com.library.book_service.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);

    boolean existsByIsbn(String isbn);

    List<Book> findByActiveTrue();

    Optional<Book> findByIdAndActiveTrue(Long id);

    List<Book> findByTitleContainingIgnoreCaseAndActiveTrue(
            String title);

    List<Book> findByAuthorContainingIgnoreCaseAndActiveTrue(
            String author);

    List<Book> findByCategoryContainingIgnoreCaseAndActiveTrue(
            String category);
}
