
package com.library.book_service.service;

import com.library.book_service.entity.Book;
import com.library.book_service.repository.BookRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> getAllBooks() {
        return bookRepository.findByActiveTrue();
    }

    public Book getBookById(Long id) {
        return bookRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new BookNotFoundException(
                                "Active book not found with ID: " + id));
    }

    public List<Book> searchByTitle(String title) {
        return bookRepository
                .findByTitleContainingIgnoreCaseAndActiveTrue(title);
    }

    public List<Book> searchByAuthor(String author) {
        return bookRepository
                .findByAuthorContainingIgnoreCaseAndActiveTrue(author);
    }

    public List<Book> searchByCategory(String category) {
        return bookRepository
                .findByCategoryContainingIgnoreCaseAndActiveTrue(category);
    }

    @Transactional
    public Book addBook(Book book) {
        validateBook(book);

        String isbn = normalizeIsbn(book.getIsbn());

        if (bookRepository.existsByIsbn(isbn)) {
            throw new DuplicateIsbnException(
                    "A book with this ISBN already exists");
        }

        book.setIsbn(isbn);
        book.setAvailableCopies(book.getTotalCopies());
        book.setActive(true);

        try {
            return bookRepository.saveAndFlush(book);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateIsbnException(
                    "A book with this ISBN already exists");
        }
    }

    @Transactional
    public Book updateBook(Long id, Book updatedBook) {
        validateBook(updatedBook);

        Book existing = getBookById(id);
        String isbn = normalizeIsbn(updatedBook.getIsbn());

        bookRepository.findByIsbn(isbn)
                .filter(book -> !book.getId().equals(id))
                .ifPresent(book -> {
                    throw new DuplicateIsbnException(
                            "A book with this ISBN already exists");
                });

        existing.setTitle(updatedBook.getTitle().trim());
        existing.setAuthor(updatedBook.getAuthor().trim());
        existing.setIsbn(isbn);
        existing.setCategory(updatedBook.getCategory());
        existing.setPublisher(updatedBook.getPublisher());
        existing.setPublicationYear(updatedBook.getPublicationYear());

        // Do not overwrite copy counts here: Library Service
        // may later manage borrowing and availability.
        return bookRepository.save(existing);
    }

    @Transactional
    public void deactivateBook(Long id) {
        Book book = getBookById(id);
        book.setActive(false);
        bookRepository.save(book);
    }

    private void validateBook(Book book) {
        if (book.getTitle() == null || book.getTitle().isBlank()) {
            throw new InvalidBookException("Title is required");
        }

        if (book.getAuthor() == null || book.getAuthor().isBlank()) {
            throw new InvalidBookException("Author is required");
        }

        if (book.getIsbn() == null || book.getIsbn().isBlank()) {
            throw new InvalidBookException("ISBN is required");
        }

        if (book.getTotalCopies() == null || book.getTotalCopies() < 1) {
            throw new InvalidBookException(
                    "Total copies must be at least 1");
        }

        if (book.getTitle().length() > 200
                || book.getAuthor().length() > 150
                || book.getIsbn().length() > 20) {
            throw new InvalidBookException(
                    "Title, author, or ISBN exceeds its maximum length");
        }

        if (book.getPublicationYear() != null
                && (book.getPublicationYear() < 1
                || book.getPublicationYear() > 9999)) {
            throw new InvalidBookException(
                    "Publication year must be between 1 and 9999");
        }

        book.setTitle(book.getTitle().trim());
        book.setAuthor(book.getAuthor().trim());
    }

    private String normalizeIsbn(String isbn) {
        return isbn.trim()
                .replace("-", "")
                .replace(" ", "")
                .toUpperCase(Locale.ROOT);
    }

    public static class BookNotFoundException
            extends RuntimeException {
        public BookNotFoundException(String message) {
            super(message);
        }
    }

    public static class DuplicateIsbnException
            extends RuntimeException {
        public DuplicateIsbnException(String message) {
            super(message);
        }
    }

    public static class InvalidBookException
            extends RuntimeException {
        public InvalidBookException(String message) {
            super(message);
        }
    }
}
