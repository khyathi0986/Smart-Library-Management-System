
package com.library.smart_service.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "faculty_recommendations")
public class FacultyRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long facultyId;

    @Column(nullable = false)
    private String facultyName;

    @Column(nullable = false)
    private Long bookId;

    @Column(nullable = false)
    private String bookTitle;

    private String author;
    private String category;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public FacultyRecommendation() {}

    public Long getId() { return id; }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long v) { facultyId = v; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String v) { facultyName = v; }

    public Long getBookId() { return bookId; }
    public void setBookId(Long v) { bookId = v; }

    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String v) { bookTitle = v; }

    public String getAuthor() { return author; }
    public void setAuthor(String v) { author = v; }

    public String getCategory() { return category; }
    public void setCategory(String v) { category = v; }

    public String getReason() { return reason; }
    public void setReason(String v) { reason = v; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
