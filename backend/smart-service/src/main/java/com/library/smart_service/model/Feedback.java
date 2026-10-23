package com.library.smart_service.model;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="book_feedback", indexes={@Index(name="idx_feedback_user",columnList="userId"),@Index(name="idx_feedback_category",columnList="category")})
public class Feedback {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private Long userId; @Column(nullable=false) private Long bookId;
 @Column(nullable=false) private String bookTitle; @Column(nullable=false) private String category;
 @Column(nullable=false) private int rating; @Column(length=1500) private String comment;
 @Column(nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
 public Feedback(){}
 public Long getId(){return id;} public Long getUserId(){return userId;} public void setUserId(Long v){userId=v;}
 public Long getBookId(){return bookId;} public void setBookId(Long v){bookId=v;}
 public String getBookTitle(){return bookTitle;} public void setBookTitle(String v){bookTitle=v;}
 public String getCategory(){return category;} public void setCategory(String v){category=v;}
 public int getRating(){return rating;} public void setRating(int v){rating=v;}
 public String getComment(){return comment;} public void setComment(String v){comment=v;}
 public LocalDateTime getCreatedAt(){return createdAt;}
}
